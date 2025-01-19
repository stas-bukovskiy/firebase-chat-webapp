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
import {UserChatEntity} from "@/services/entities.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";

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

            const userChatsRef = collection(db, 'userChats', uid, 'chats').withConverter(UserChatEntity.converter);
            const userChatsSnapshot = await getDocs(userChatsRef);

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

            const currentUserStore = useCurrentUserStore();
            const currentUserId = currentUserStore.currentUser.username;

            const otherUserId = chat.members.find(member => member.id !== currentUserId).id;

            const usersStore = useUserStore();
            const otherUser = usersStore.fetchByUsername(otherUserId);

            const privateChat = new PrivateChatAggregate(chat, otherUser, userChat);
            this.userChats.push(privateChat);
        },
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