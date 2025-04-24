import {defineStore} from "pinia";
import {db} from "@/firebase";
import {collection, doc, addDoc, onSnapshot, query, where, documentId, setDoc} from "firebase/firestore";
import {ChatEntity, type ChatAggregate, GroupChatAggregate, PrivateChatAggregate} from "@/services/entities.ts";
import {UserChatEntity} from "@/services/entities.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import type {Unsubscribe} from "@firebase/firestore";
import {reactive} from "vue";

export const useChatStore = defineStore("chats", {
    state: () => ({
        userChats: reactive([] as ChatAggregate[]),
        chatsUnsubscribe: new Map<string, Unsubscribe>(),
    }),
    actions: {
        // --- Fetching user chats ---
        async fetchUserChats(): Promise<Unsubscribe> {
            this.userChats.splice(0, this.userChats.length);

            const currentUserStore = useCurrentUserStore();
            const currentUsername = currentUserStore.username;
            if (!currentUsername) {
                console.error("User not logged in");
                return;
            }

            const userChatsRef = collection(db, 'userChats', currentUsername, 'chats')
                .withConverter(UserChatEntity.converter);
            return onSnapshot(userChatsRef, async (snapshot) => {
                for (const change of snapshot.docChanges()) {
                    console.log("Change type userchat", change.type);
                    if (change.type === "added") {
                        await this.handleAddedUserChat(change.doc.data());
                    } else if (change.type === "modified") {
                        this.handleModifiedUserChat(change.doc.data());
                    } else if (change.type === "removed") {
                        await this.handleRemovedUserChat(change.doc.data());
                    }
                }
            });
        },

        async handleRemovedUserChat(userChat: UserChatEntity) {
            console.log("Removed user chat", userChat);
            const chatIndex = this.userChats.findIndex(chat => chat.userChat.id === userChat.id);
            if (chatIndex === -1) {
                console.error("Chat not found", userChat.id);
                return;
            }

            const route = this.router.currentRoute;
            if (route.value.name === 'chat' && route.value.params.id === userChat.id) {
                await this.router.push({name: 'app'});
            }

            this.userChats.splice(chatIndex, 1);
        },

        // --- Adding a new chat ---
        async handleAddedUserChat(userChat: UserChatEntity) {
            const chatRef = query(collection(db, 'chats'), where(documentId(), '==', userChat.chat.id))
                .withConverter(ChatEntity.converter);
            const unsubscribe = onSnapshot(chatRef, async (chatSnap) => {
                for (const change of chatSnap.docChanges()) {
                    if (change.type === "added") {
                        const chat = change.doc.data() as ChatEntity;
                        if (chat.isGroup) {
                            await this.handleAddedGroupChat(userChat, chat);
                        } else {
                            await this.handleAddedPrivateChat(userChat, chat);
                        }
                    } else if (change.type === "modified") {
                        this.handleModifiedChat(change.doc.data());
                    } else if (change.type === "removed") {
                        this.handleRemovedChat(change.doc.data());
                    }
                }
            });
            this.chatsUnsubscribe.set(userChat.id, unsubscribe);
        },
        async handleAddedGroupChat(userChat: UserChatEntity, chat: ChatEntity) {
            const groupChat = new GroupChatAggregate(chat, userChat);
            // TODO: add sorting
            this.userChats.push(groupChat);
        },
        async handleAddedPrivateChat(userChat: UserChatEntity, chat: ChatEntity) {
            if (chat.members.length !== 2) {
                console.error("Private chat must have exactly 2 members", chat.uid);
                return;
            }

            const currentUserStore = useCurrentUserStore();
            const currentUserId = currentUserStore.currentUser.username;

            const otherUserId = chat.members.find(member => member.id !== currentUserId).id;

            const usersStore = useUserStore();
            const otherUser = usersStore.fetchByUsername(otherUserId);

            const privateChat = new PrivateChatAggregate(chat, otherUser, userChat);
            this.userChats.push(privateChat);
        },
        handleModifiedChat(chat: ChatEntity) {
            const chatAggregate = this.userChats.find(chatAgg => chatAgg.chat.id === chat.id);
            if (!chatAggregate) {
                console.error("Chat not found", chat.id);
                return;
            }

            chatAggregate.chat = chat;
        },
        handleRemovedChat(chat: ChatEntity) {
            console.log("Removed chat", chat);
            const chatIndex = this.userChats.findIndex(chat => chat.chat.id === chat.id);
            if (chatIndex === -1) {
                console.error("Chat not found", chat.id);
                return;
            }

            this.userChats.splice(chatIndex, 1);
            this.chatsUnsubscribe.get(chat.id)?.();
        },


        // --- Updating a chat ---
        handleModifiedUserChat(userChat: UserChatEntity) {
            console.log("Modified user chat", userChat);
            const chat = this.userChats.find(chat => chat.userChat.id === userChat.id);
            if (!chat) {
                console.error("Chat not found", userChat.id);
                return;
            }

            chat.userChat = userChat;
        },


        // --- Creating a new chat ---
        async createPrivateChat(username: string): Promise<string> {
            // Create a new chat
            const currentUserStore = useCurrentUserStore();
            const currentUserRef = doc(db, "users", currentUserStore.username);
            const chatRef = await addDoc(collection(db, "chats"), {
                members: [
                    currentUserRef,
                    doc(db, "users", username)
                ],
                isGroup: false,
                createdAt: nowToUTCTimestamp(),
                createBy: currentUserRef,
            });

            // Add the chat to the user's chat list
            await setDoc(doc(db, "userChats", currentUserStore.username, "chats", chatRef.id), {
                chat: chatRef,
                isStarred: false,
                unreadCount: 0,
                updatedAt: nowToUTCTimestamp(),
            });

            return chatRef.id;
        },
        async createGroupChat(groupChat: ChatEntity) {
            const currentUserStore = useCurrentUserStore();
            const currentUserRef = doc(db, "users", currentUserStore.username);
            const chatDocRef = doc(db, "chats", groupChat.id)
            await setDoc(chatDocRef, {
                isGroup: true,
                groupName: groupChat.groupName,
                groupImageUrl: groupChat.groupImageUrl,
                members: groupChat.members,
                createdBy: currentUserRef,
            });

            const userChatDocRef = doc(db, "userChats", currentUserStore.username, "chats", groupChat.id);
            await setDoc(userChatDocRef, {
                chat: chatDocRef,
                unreadCount: 0,
                isStarred: false,
                updatedAt: nowToUTCTimestamp(),
            });
        }
    },
    getters: {
        getChats: (state) => state.userChats.sort((a, b) => {
            return b.userChat?.updatedAt - a.userChat?.updatedAt
        }),
        getChatsCount: (state) => state.userChats.length,
        getChatByUserChatId: (state) => {
            return (userChatId: string) => {
                return state.userChats.find(chat => chat.userChat.id === userChatId);
            }
        },
        getChatByChatId: (state) => {
            return (chatId: string) => {
                return state.userChats.find(chat => chat.chat.id === chatId);
            }
        }
    }
})