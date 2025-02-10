import {DocumentReference} from "firebase-admin/firestore";

export enum UPDATE_FROM {
    LEAVE_GROUP = "leaveGroup",
}

export interface UserChat {
    chat: DocumentReference;
    unreadCount: number;
    isStarred: boolean;
    createdAt: number;
}

export interface Chat {
    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;
    members: Array<DocumentReference>;
    createdBy: DocumentReference;
    metadata?: {
        updatedFrom?: UPDATE_FROM;
    }
}