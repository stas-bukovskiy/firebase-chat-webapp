import {doc, runTransaction} from "firebase/firestore";
import {db} from "@/firebase";
import type {MessageEntity} from "@/services/entities.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

export async function togglePinnedMessage(chatId: string, message: MessageEntity): Promise<void> {
    const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
    const pinnedMessageRef = doc(db, 'chats', chatId, 'pinnedMessage', message.id);
    await runTransaction(db, async (tr) => {
        if (message.isPinned) {
            tr.delete(pinnedMessageRef);
            tr.update(messageRef, {isPinned: false});
            return
        }

        tr.set(pinnedMessageRef, {message: messageRef, createdAt: nowToUTCTimestamp()});
        tr.update(messageRef, {isPinned: true});
    })
}