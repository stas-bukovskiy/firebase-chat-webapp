import {defineStore} from "pinia";
import {MessageEntity} from "@/models/entities.ts";
import {collection, doc, limit, orderBy, query} from "firebase/firestore";
import {db} from "@/firebase";
import {useCollection} from "vuefire";
import {reactive} from "vue";

const initialChunkSize = 24;
const chunkSize = 10;

export const useMessageStore = defineStore("messages", {
    state: () => ({
        messages: reactive(new Map<string, Array<MessageEntity>>()),
    }),
    getters: {
        getMessagesByChatId: state => {
            return (chatId: string) => {
                return state.messages.get(chatId);
            }
        }
    },
    actions: {
        async fetchInitialMessageByChatId(chatId: string): Promise<Array<MessageEntity>> {
            if (this.messages.has(chatId)) {
                return this.messages.get(chatId);
            }

            const messageRef = collection(db, 'chats', chatId, 'messages')
                .withConverter(MessageEntity.converter);
            const messagesRef = query(messageRef, orderBy('createdAt', "desc"), limit(initialChunkSize));
            const {data: messages, promise,} = useCollection(messagesRef);

            this.messages.set(chatId, messages);

            return promise.value.then(() => {
                // this.messages.get(chatId)?.value?.sort((a, b) => a.createdAt - b.createdAt);
                return this.messages.get(chatId);
            });
        }
    },
});
