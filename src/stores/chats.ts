import {defineStore} from "pinia";
import {useDocument} from "vuefire";
import {auth, db} from "@/firebase";
import {collection, doc, setDoc, getDoc, getDocs} from "firebase/firestore";
import {
    ChatEntity,
    type ChatAggregate,
    GroupChatAggregate,
    PrivateChatAggregate,
    UserProfileEntity
} from "@/services/entities.ts";
import type {UserChatEntity, UserChatsEntity} from "@/services/entities.ts";
import {useUserStore} from "@/stores/user.ts";

export const useChatStore = defineStore("chats", {
    state: () => ({
        userChatsDoc: null,
        userChats: [] as ChatAggregate[],
    }),
    actions: {
        async fetchUserChats() {
            const uid = auth.currentUser?.uid;
            if (!uid) {
                console.error("User not found");
                return;
            }

            const userChatsSnapshot = await getDocs(collection(db, 'userChats', uid, 'chats'));

            userChatsSnapshot.docs.map(async userChatRef => {
                const userChat = userChatRef.data();

                const chatRef = doc(db, 'chats', userChat.chat.id).withConverter(ChatEntity.converter);
                const chatSnap = await getDoc(chatRef);

                if (chatSnap.exists()) {
                    const chat = chatSnap.data();
                    if (chat.isGroup) {
                        await this.fetchGroupChat(userChat, chat);
                    } else {
                        await this.fetchPrivateChat(userChat, chat);
                    }
                }
            });
        },
        async createUserChat(uid: string) {
            await setDoc(doc(db, "userChats", uid), {chats: []});
            this.userChatsDoc = useDocument<UserChatsEntity>(doc(collection(db, 'userChats'), uid));
        },
        async fetchGroupChat(userChat: UserChatEntity, chat: ChatEntity) {
            const groupChat = new GroupChatAggregate(chat, userChat);
            this.userChats.push(groupChat);
        },
        async fetchPrivateChat(userChat: UserChatEntity, chat: ChatEntity) {
            if (chat.members.length !== 2) {
                console.error("Private chat must have exactly 2 members", chat.uid);
                return;
            }

            const userStore = useUserStore();
            const currentUserId = userStore.user.username

            const otherUserId = chat.members.find(member => member.id !== currentUserId).id;
            const otherUserRef = doc(db, 'users', otherUserId).withConverter(UserProfileEntity.converter);
            const otherUser = useDocument(otherUserRef);

            const privateChat = new PrivateChatAggregate(chat, otherUser, userChat);
            this.userChats.push(privateChat);
        },
    },
    getters: {
        getChats: (state) => state.userChats
    }
})