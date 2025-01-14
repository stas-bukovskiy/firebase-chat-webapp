import type {UserChatEntity, UserProfileEntity} from "@/services/entities.ts";
import type DocumentReference from "firebase"
import Entity from "@/services/entity.ts";


// UserChatEntity is a model that represents a chat info for a specific user
export class UserChatEntity extends Entity {
    chat: DocumentReference;
    unreadCount: number;
    isStarred: boolean;

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): ChatEntity {
        return {
            chat: data.chat || null,
            unreadCount: Number(data.unreadCount) || 0,
            isStarred: Boolean(data.isStarred) || false,
        }
    }
}

// MessageEntity is a model that represents a message in a chat
export interface MessageEntity {

}

export class ChatEntity extends Entity {

    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;

    messages: Array<MessageEntity>;
    members: Array<DocumentReference>;

    createdBy: DocumentReference;

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): ChatEntity {
        return {
            isGroup: Boolean(data.isGroup),
            groupName: String(data.groupName) || undefined,
            groupImageUrl: String(data.groupImageUrl) || undefined,
            messages: data.messages || [],
            members: data.members || [],
            createdBy: data.createdBy,
        }
    }
}

// UserProfileEntity is a model that represents a user profile
export class UserProfileEntity extends Entity {
    username: string;
    email: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
    isOnline: boolean;

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): UserProfileEntity {
        return {
            username: String(data.username),
            email: String(data.email),
            firstName: String(data.firstName),
            lastName: data.lastName ? String(data.lastName) : undefined,
            photoUrl: data.photoUrl ? String(data.photoUrl) : undefined,
            isOnline: Boolean(data.isOnline),
        }
    }
}


export interface ChatAggregate {
    otherUserProfile?: UserProfileEntity;
    userChat: UserChatEntity;
    chat: ChatEntity;
}

export class PrivateChatAggregate implements ChatAggregate {
    chat: ChatEntity;
    otherUserProfile: UserProfileEntity;
    userChat: UserChatEntity;

    constructor(chat: ChatEntity, otherUserProfile: UserProfileEntity, userChat: UserChatEntity) {
        console.log("PrivateChatAggregate constructor", chat, otherUserProfile, userChat);
        this.chat = chat;
        this.otherUserProfile = otherUserProfile;
        this.userChat = userChat;
    }
}

export class GroupChatAggregate implements ChatAggregate {
    chat: ChatEntity;
    userChat: UserChatEntity;

    constructor(chat: ChatEntity, userChat: UserChatEntity) {
        this.chat = chat;
        this.userChat = userChat;
    }
}