import {getFirestore} from "firebase-admin/firestore";

export enum SYSTEM_MESSAGE {
    GROUP_CREATED = "group_created",
    GROUP_RENAMED = "group_renamed",
    GROUP_IMAGE_UPDATED = "group_image_updated",
    GROUP_MEMBER_ADDED = "group_member_added",
    GROUP_MEMBER_REMOVED = "group_member_removed",
    GROUP_MEMBER_LEFT = "group_member_left",
}

const db = getFirestore();

export const createSystemMessage = async (chatId: string, messageType: SYSTEM_MESSAGE, data: any) => {
    const message = {
        systemMessageType: messageType,
        data,
        createdAt: Math.floor(Date.now())
    }

    await db.collection(`chats/${chatId}/messages`).add(message);
};
