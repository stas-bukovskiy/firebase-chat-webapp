import {doc, runTransaction, arrayUnion, increment} from "firebase/firestore";
import {db} from "@/firebase";


export async function updateMessageReadStatus(chatId: string, messageId: string, userId: string, isGroup: boolean) {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    const userChatRef = doc(db, 'userChats', userId, 'chats', chatId);
    await runTransaction(db, async (tr) => {
        const dataToUpdate = {isRead: true};
        if (isGroup) {
            dataToUpdate['readBy'] = arrayUnion(userId)
            return
        }
        tr.update(messageRef, dataToUpdate);
        tr.update(userChatRef, {unreadCount: increment(-1)});
    })
}