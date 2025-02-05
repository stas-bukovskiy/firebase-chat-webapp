import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";

const EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
const UNREGISTERED_ERROR_CODE = 'messaging/registration-token-not-registered';
const INVALID_ARGUMENT_ERROR_CODE = 'messaging/invalid-argument';

interface Payload {
    notification: {
        title: string
        body: string
    },
    data: {
        chatId: string
        icon?: string
    },
}

interface UserToken {
    userId: string
    token: string
}

interface ErrorJSON {
    code?: string;
}


const messaging = getMessaging();
const db = getFirestore();

export const sendNotification = async (chatId: string, recipientsRefs: Array<DocumentReference>, senderRef: DocumentReference, payload: Payload) => {
    const allTokens: UserToken[] = []
    const failedTokens: UserToken[] = []

    for (const {id: recipientId} of recipientsRefs) {
        const tokensSnap = await db.collection(`users/${recipientId}/tokens`).get()
        if (tokensSnap.empty) {
            console.log('No tokens found for user:', recipientId)
            continue
        }

        tokensSnap.forEach((doc) => {
            const data = doc.data()
            if (data.createdAt < Date.now() - EXPIRATION_TIME) {
                console.log('Token is expired:', doc.id)
                failedTokens.push({userId: recipientId, token: doc.id})
            }

            allTokens.push({userId: recipientId, token: doc.id})
        })
    }

    if (allTokens.length > 0) {
        console.log('Sending notification to:', allTokens.map(({userId}) => userId))

        const senderSnap = await senderRef.get();
        const sender = senderSnap.data();
        if (!sender) {
            console.log('No data associated with fromUserRef:', senderRef.id)
            return
        }

        const response = await messaging.sendEachForMulticast({
            tokens: allTokens.map(({token}) => token),
            ...payload,
        })

        response.responses.forEach((resp, idx) => {
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