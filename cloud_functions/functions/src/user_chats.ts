import {getFirestore} from "firebase-admin/firestore";
import {onDocumentDeletedWithAuthContext} from "firebase-functions/firestore";
import {Chat} from "./models";

const db = getFirestore()

export const onUserChatDeleted = onDocumentDeletedWithAuthContext("userChats/{userId}/chats/{chatId}", async (event) => {
    if (!event.data) {
        console.log("No data associated with the event");
        return;
    }

    const chatId = event.params.chatId;
    const userId = event.params.userId;
    if (!chatId || !userId) {
        console.log("chatId and userId are required")
        return
    }

    const chatRef = db.doc(`chats/${chatId}`)
    const chatSnap = await chatRef.get()
    if (!chatSnap.exists) {
        console.log("Chat does not exist")
        return
    }

    const chat = chatSnap.data() as Chat;
    if (chat.isGroup) {
        return handleGroupChatDeleted(userId, chatId, chat)
    }

    return handleUserChatDeleted(userId, chatId, chat)
})

const handleGroupChatDeleted = async (userId: string, chatId: string, chat: Chat) => {
    // check if the update is from the admin
    if (chat.createdBy.id !== userId) {
        console.log("Update are not from admin, skipping...")
        return
    }

    console.log("Deleting group chat", chatId)

    // delete all userChats associated with the chat
    for (const member of chat.members) {
        console.log("Deleting user chat for", member.id)
        await db.doc(`userChats/${member.id}/chats/${chatId}`).delete()
    }

    // delete the chat itself
    return await db.doc(`chats/${chatId}`).delete()
}

const handleUserChatDeleted = async (userId: string, chatId: string, chat: Chat) => {
    const otherUser = chat.members.find(member => member.id !== userId)
    if (!otherUser) {
        console.log("No other user found in the chat")
        return
    }

    const otherUserChatRef = db.doc(`userChats/${otherUser.id}/chats/${chatId}`)
    const otherUserChatSnap = await otherUserChatRef.get()
    if (!otherUserChatSnap.exists) {
        console.log("No other user chat found, deleting the chat")
        return db.doc(`chats/${chatId}`).delete()
    }

    return
}