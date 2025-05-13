import type DocumentReference from "firebase"
import Entity from "@/models/entity.ts";


// UserChatEntity is a model that represents a chat info for a specific user
export class UserChatEntity extends Entity {
    chat: DocumentReference;
    unreadCount: number;
    isStarred: boolean;
    lastReadMessageTimestamp: number;
    updatedAt: number;

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): ChatEntity {
        return {
            chat: data.chat || null,
            unreadCount: Number(data.unreadCount) || 0,
            isStarred: Boolean(data.isStarred) || false,
            lastReadMessageTimestamp: Number(data.lastReadMessageTimestamp) || 0,
            updatedAt: Number(data.updatedAt) || 0,
        }
    }
}

export class ChatEntity extends Entity {

    id: string;
    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;

    members: Array<DocumentReference>;

    createdBy: DocumentReference;

    constructor(data?: ChatEntity) {
        super();

        if (!data) {
            return;
        }

        this.id = data.id;
        this.isGroup = data.isGroup;
        this.groupName = data.groupName;
        this.groupImageUrl = data.groupImageUrl;
        this.members = data.members;
        this.createdBy = data.createdBy;
    }

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

// MessageEntity is a model that represents a message in a chat
export class MessageEntity extends Entity {
    text: string;
    fromUser: DocumentReference;
    attachmentsUrl: Array<string>;
    isRead: boolean;
    readBy: Array<string>;
    isPinned: boolean;
    createdAt: number;

    systemMessageType?: string;
    data?: any;

    constructor(data: MessageEntity) {
        super(data);
        this.text = data.text;
        this.fromUser = data.fromUser;
        this.attachmentsUrl = data.attachmentsUrl;
        this.isRead = data.isRead || false;
        this.readBy = data.readBy || [];
        this.isPinned = data.isPinned || false;
        this.createdAt = data.createdAt;
        this.systemMessageType = data.systemMessageType;
        this.data = data.data;
    }

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): MessageEntity {
        return {
            text: String(data.text),
            fromUser: data.fromUser,
            isRead: Boolean(data.isRead),
            readBy: data.readBy || [],
            isPinned: Boolean(data.isPinned),
            attachmentsUrl: data.attachmentsUrl || [],
            createdAt: parseInt(data.createdAt),
            systemMessageType: data.systemMessageType || undefined,
            data: data.data || undefined
        }
    }

    protected static transformToFirestore(data: MessageEntity): FirebaseFirestore.DocumentData {
        return {
            text: data.text,
            fromUser: data.fromUser,
            isPinned: data.isPinned ? data.isPinned : undefined,
            attachmentsUrl: data.attachmentsUrl,
            createdAt: data.createdAt,
        }
    }
}

export class PinnedMessageEntity extends Entity {
    message: DocumentReference;
    createdAt: number;

    constructor(data: PinnedMessageEntity) {
        super(data);
        this.message = data.message;
        this.createdAt = data.createdAt;
    }

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): PinnedMessageEntity {
        return {
            message: data.message,
            createdAt: data.createdAt,
        }
    }

    protected static transformToFirestore(data: PinnedMessageEntity): FirebaseFirestore.DocumentData {
        return {
            message: data.message,
            createdAt: data.createdAt,
        }
    }
}


export class MessageFileEntity extends Entity {
    message: DocumentReference;
    url: string;
    isMedia: boolean;

    constructor(data: MessageFileEntity) {
        super(data);
        this.message = data.message;
        this.url = data.url;
        this.isMedia = data.isMedia;
    }

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): MessageFileEntity {
        return {
            message: data.message,
            url: data.url,
            isMedia: Boolean(data.isMedia),
        }
    }

    protected static transformToFirestore(data: MessageFileEntity): FirebaseFirestore.DocumentData {
        return {
            message: data.message,
            url: data.url,
            isMedia: data.isMedia,
        }
    }
}

export class LinkMessageEntity extends Entity {
    message: DocumentReference;
    createdAt: number;

    constructor(data: PinnedMessageEntity) {
        super(data);
        this.message = data.message;
        this.createdAt = data.createdAt;
    }

    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): PinnedMessageEntity {
        return {
            message: data.message,
            createdAt: data.createdAt,
        }
    }

    protected static transformToFirestore(data: PinnedMessageEntity): FirebaseFirestore.DocumentData {
        return {
            message: data.message,
            createdAt: data.createdAt,
        }
    }
}