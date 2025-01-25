import {defineStore} from "pinia";
import {useDocument} from "vuefire";
import {auth, db} from "@/firebase";
import {collection, doc, setDoc, getDoc, getDocs, addDoc, onSnapshot} from "firebase/firestore";
import {
    ChatEntity,
    type ChatAggregate,
    GroupChatAggregate,
    PrivateChatAggregate,
    UserProfileEntity
} from "@/services/entities.ts";
import {UserChatEntity} from "@/services/entities.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import type {Unsubscribe} from "@firebase/firestore";

export const useChatStore = defineStore("chats", {
    state: () => ({
        userChatsDoc: null,
        userChats: [] as ChatAggregate[],
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
                    if (change.type === "added") {
                        await this.handleAddedUserChat(change.doc.data());
                    } else if (change.type === "modified") {
                        console.log("Modified city: ", change.doc.data());
                    } else if (change.type === "removed") {
                        console.log("Removed city: ", change.doc.data());
                    }
                }
            });
        },

        // --- Adding a new chat ---
        async handleAddedUserChat(userChat: UserChatEntity) {
            const chatRef = doc(db, 'chats', userChat.chat.id)
                .withConverter(ChatEntity.converter);
            const chatSnap = await getDoc(chatRef);

            if (chatSnap.exists()) {
                const chat = chatSnap.data();
                if (chat.isGroup) {
                    await this.handleAddedGroupChat(userChat, chat);
                } else {
                    await this.handleAddedPrivateChat(userChat, chat);
                }
            }
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
            // TODO: add sorting
            this.userChats.push(privateChat);
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
            const userChatRef = await addDoc(collection(db, "userChats", currentUserStore.username, "chats"), {
                chat: chatRef,
                isStarred: false,
                unreadCount: 0,
            });

            // TODO: move to cloud function
            // Add the chat to the other user's chat list
            await addDoc(collection(db, "userChats", username, "chats"), {
                chat: chatRef,
                isStarred: false,
                unreadCount: 0,
            });
            return userChatRef.id;
        }
    },
    getters: {
        getChats: (state) => state.userChats,
        getChatByUserChatId: (state) => {
            return (userChatId: string) => {
                console.log("getChatByUserChatId", userChatId);
                return state.userChats.find(chat => chat.userChat.id === userChatId);
            }
        },
    }
})