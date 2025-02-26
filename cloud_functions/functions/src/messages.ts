import {onDocumentCreatedWithAuthContext} from "firebase-functions/v2/firestore";
import {DocumentReference, getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getMessaging} from "firebase-admin/messaging";

const EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
const UNREGISTERED_ERROR_CODE = 'messaging/registration-token-not-registered';
const INVALID_ARGUMENT_ERROR_CODE = 'messaging/invalid-argument';

const db = getFirestore()
const messaging = getMessaging();

export const onMessageCreated = onDocumentCreatedWithAuthContext("chats/{chatId}/messages/{messageId}",
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No data associated with the event");
            return;
        }

        const data = snapshot.data();

        if (data.systemMessageType) {
            console.log("System message, skipping");
            return;
        }

        // retrieve auth context from event
        const fromUserRef: DocumentReference = await data.fromUser;
        if (!fromUserRef) {
            console.log("No fromUser associated with the message");
            return;
        }

        // retrieve username from fromUserRef
        const senderUsername = fromUserRef.id;
        if (!senderUsername) return;

        // retrieve chatId from event
        const chatId = event.params.chatId;
        const messageId = event.params.messageId;

        // retrieve userChat entity from firestore
        const chat = await getChatById(chatId);
        if (!chat) return;

        // update timestamp of the userChat entity
        await db.doc(`userChats/${senderUsername}/chats/${chatId}`).update({
            updatedAt: Math.floor(Date.now())
        })

        const members = chat.members.filter(member => member.id !== senderUsername);

        for (const userRef of members) {
            const userChatId = await getOrCreateUserChat(userRef, chatId);
            if (!userChatId) {
                // userChat is just created, no need to increment unreadCount
                continue;
            }

            await db.doc(userChatId).update({
                unreadCount: FieldValue.increment(1),
                updatedAt: Math.floor(Date.now())
            })
        }

        // send notification to the chat members
        await sendNotification(chat, members, fromUserRef, data.text);

        // save attachment files
        if (data.attachmentsUrl && data.attachmentsUrl.length > 0) {
            await saveAttachmentFiles(chatId, messageId, data.attachmentsUrl);
        }

        // save message links
        if (data.text && data.text.length >= 12) {
            await saveMessageLinks(chatId, messageId, data.text);
        }
    });

interface Chat {
    id: string;
    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;
    members: Array<DocumentReference>;
    createdBy: DocumentReference;
}

const getChatById = async (chatId: string): Promise<Chat | undefined> => {
    const chatSnapshot = await db.collection("chats").doc(chatId).get();
    if (!chatSnapshot.exists) {
        console.log('Not found chat with chatId:', chatId);
        return undefined;
    }

    const data = chatSnapshot.data();
    if (!data) {
        console.log('No data associated with chatId:', chatId);
        return undefined
    }

    return {
        id: chatSnapshot.id,
        isGroup: data.isGroup,
        groupName: data.groupName,
        groupImageUrl: data.groupImageUrl,
        members: data.members,
        createdBy: data.createdBy,
    }
}

const getOrCreateUserChat = async (userRef: DocumentReference, chatId: string): Promise<string | undefined> => {
    const userChatSnapshot = await db.collection(`userChats/${userRef.id}/chats`)
        .where("chat", "==", db.doc(`chats/${chatId}`)).get();
    if (userChatSnapshot.empty) {
        // create userChat
        const createdAt = Math.floor(Date.now());
        await db.doc(`userChats/${userRef.id}/chats/${chatId}`).set({
            chat: db.doc(`chats/${chatId}`),
            unreadCount: 1, // set unreadCount to 1 since it is a new chat that created from sendMessage function
            isStarred: false,
            createdAt: createdAt,
            updatedAt: createdAt
        })
        return;
    }

    const userChatId = userChatSnapshot.docs[0].id;
    return `userChats/${userRef.id}/chats/${userChatId}`;
}

interface ErrorJSON {
    code?: string;
}

const sendNotification = async (chat: Chat, members: Array<DocumentReference>, fromUserRef: DocumentReference, text: string) => {
    const allTokens: { userId: string, token: string }[] = []
    const failedTokens: { userId: string, token: string }[] = []
    for (const {id: memberId} of members) {
        const tokensSnap = await db.collection(`users/${memberId}/tokens`).get()
        if (tokensSnap.empty) {
            console.log('No tokens found for user:', memberId)
            continue
        }

        tokensSnap.forEach((doc) => {
            const data = doc.data()
            if (data.createdAt < Date.now() - EXPIRATION_TIME) {
                console.log('Token is expired:', doc.id)
                failedTokens.push({userId: memberId, token: doc.id})
            }

            allTokens.push({userId: memberId, token: doc.id})
        })
    }

    if (allTokens.length > 0) {
        console.log('Sending notification to:', allTokens.map(({userId}) => userId))

        const senderSnap = await fromUserRef.get();
        const sender = senderSnap.data();
        if (!sender) {
            console.log('No data associated with fromUserRef:', fromUserRef.id)
            return
        }

        const senderParams = {firstName: sender.firstName, lastName: sender.lastName}

        const payload = {
            notification: {
                title: chat.isGroup ? chat.groupName : generateDisplayName(senderParams),
                body: generateNotificationBody(chat, senderParams, text),
            },
            data: {
                chatId: chat.id,
                icon: (chat.isGroup ? chat.groupImageUrl : sender.photoUrl) || '',
            },
        }

        const response = await messaging.sendEachForMulticast({
            tokens: allTokens.map(({token}) => token),
            ...payload,
        })

        response.responses.forEach((resp, idx) => {
            // if (!resp.success && resp.error?.code === UNREGISTERED_ERROR_CODE) {

            if (!resp.success && resp.error) {
                console.log('Response:', resp.error)

                const jsonError = resp.error.toJSON() as ErrorJSON;
                const code = jsonError.code;
                console.log('Code:', code)
                if (code && (code === UNREGISTERED_ERROR_CODE || code === INVALID_ARGUMENT_ERROR_CODE)) {
                    failedTokens.push(allTokens[idx])
                }
            }
        })
    }

    if (failedTokens.length > 0) {
        console.log('Removing invalid tokens:', failedTokens.map(({token}) => token))

        for (const {userId, token} of failedTokens) {
            await db.doc(`users/${userId}/tokens/${token}`).delete()
        }
    }
}

function generateDisplayName(params: { firstName: string, lastName?: string }): string {
    if (!params) {
        return '';
    }

    return params.lastName ? `${params.firstName} ${params.lastName}` : params.firstName;
}

const generateNotificationBody = (chat: Chat, user: { firstName: string, lastName?: string }, text: string): string => {
    if (text.length > 100) {
        text = text.substring(0, 97) + '...';
    }

    if (chat.isGroup) {
        return `${generateDisplayName(user)}: ${text}`;
    }

    return text;
}

const saveAttachmentFiles = async (chatId: string, messageId: string, attachmentsUrl: Array<string>) => {
    for (const attachmentUrl of attachmentsUrl) {
        await db.collection(`chats/${chatId}/files`).add({
            message: db.doc(`chats/${chatId}/messages/${messageId}`),
            url: attachmentUrl,
            isMedia: isMediaFile(attachmentUrl),
            createdAt: Math.floor(Date.now())
        })
    }
}

const mediaExtensions = new Set([
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', // Image formats
    'mp4', 'mov', 'avi', 'mkv', 'webm', // Video formats
]);

const isMediaFile = (fileUrl: string): boolean => {
    try {
        const parsedUrl = new URL(fileUrl);

        const pathname = parsedUrl.pathname;
        const extension = pathname.split('.').pop()?.toLowerCase();

        return extension !== undefined && mediaExtensions.has(extension);
    } catch (error) {
        // Return false if the URL is invalid
        return false;
    }
};


const saveMessageLinks = async (chatId: string, messageId: string, text: string) => {
    const links = extractUrls(text);
    for (const link of links) {
        await db.collection(`chats/${chatId}/links`).add({
            message: db.doc(`chats/${chatId}/messages/${messageId}`),
            url: link,
            createdAt: Math.floor(Date.now())
        })
    }
}

const extractUrls = (text: string): string[] => {
    const urlRegex = /https:\/\/\S+/g;
    return text.match(urlRegex) || [];
};