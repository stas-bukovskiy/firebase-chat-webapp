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

export class ChatEntity extends Entity {

    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;

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
    uid: string;
    username: string;
    email: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
    isOnline: boolean;

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): UserProfileEntity {
        return {
            uid: String(data.uid),
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

export enum MessageStatus {
    SENT = "sent",
    READ = "read",
}

// MessageEntity is a model that represents a message in a chat
export class MessageEntity extends Entity {
    text: string;
    fromUser: DocumentReference;
    status: MessageStatus;
    attachmentsUrl: Array<string>;
    createdAt: number;

    isStacked: boolean;

    constructor(data: MessageEntity) {
        super(data);
        this.text = data.text;
        this.fromUser = data.fromUser;
        this.status = data.status;
        this.attachmentsUrl = data.attachmentsUrl;
        this.createdAt = data.createdAt;
        this.isStacked = false;
    }

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): MessageEntity {
        return {
            text: String(data.text),
            fromUser: data.fromUser,
            status: data.status,
            attachmentsUrl: data.attachmentsUrl || [],
            createdAt: parseInt(data.createdAt),

            isStacked: false,
        }
    }

    protected static transformToFirestore(data: MessageEntity): FirebaseFirestore.DocumentData {
        return {
            text: data.text,
            fromUser: data.fromUser,
            status: data.status,
            attachmentsUrl: data.attachmentsUrl,
            createdAt: data.createdAt,
        }
    }
}
