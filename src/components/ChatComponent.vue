<script setup lang="ts">

import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import MessageInput from "@/components/MessageInput.vue";
import MessageComponent from "@/components/MessageComponent.vue";
import {MessageEntity} from "@/services/entities.ts";
import {collection, getDocs, limit, onSnapshot, orderBy, query, startAt} from "firebase/firestore";
import {db} from "@/firebase";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

const PAGE_SIZE = 8;

const props = defineProps({
  chatId: String,
});

const notification = useNotification();

const isLoading = ref(false);
const isInitialLoading = ref(true);

const chatContainer = ref(null);

const messages = ref<MessageEntity[]>([]);
const hasNoMoreMessages = ref(false);

let unsubscribe = null;

const messagesSource = computed(() => {
  return collection(db, 'chats', props.chatId, 'messages').withConverter(MessageEntity.converter);
});

onMounted(() => {
  handleInitialFetch();
});

watch(() => props.chatId, () => {
  handleInitialFetch();
});

const handleInitialFetch = () => {
  reset();

  fetchInitialMessages()
      .then(() => {
        // Finish initial loading
        isInitialLoading.value = false;

        // Scroll to the bottom of the chat
        nextTick(() => {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        });

        // Subscribe to new messages
        subscribeToNewMessages();
      })
      .catch((e) => {
        notifyError(notification, e);
      })
};

const reset = () => {
  messages.value = [];
  hasNoMoreMessages.value = false;
  isLoading.value = false;
  isInitialLoading.value = true;

  if (unsubscribe) {
    unsubscribe();
  }
};

const fetchInitialMessages = async () => {
  const q = query(messagesSource.value,
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE));
  const snapshot = await getDocs(q);
  const prevMessages = snapshot.docs.map(doc => doc.data());
  if (prevMessages.length < PAGE_SIZE) {
    hasNoMoreMessages.value = true;
  }

  prevMessages.sort((a, b) => a.createdAt - b.createdAt);
  // prevMessages.map((message, index) => {
  //   const prevMessage = index === 0 ? null : prevMessages[index - 1];
  //   const nextMessage = index === prevMessages.length - 1 ? null : prevMessages[index + 1];
  //   computedMessage.computeStacked(prevMessage, nextMessage);
  //   return computedMessage;
  // })
  messages.value = prevMessages;
};

const subscribeToNewMessages = () => {
  // Retrieve the timestamp of the last message to start listening for new messages
  const lastMessageCreatedAt = messages.value.length ?
      messages.value[messages.value.length - 1].createdAt + 1 :
      nowToUTCTimestamp();

  const q = query(messagesSource.value,
      orderBy('createdAt', 'asc'),
      startAt(lastMessageCreatedAt));

  unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const newMessage = change.doc.data();

        const {scrollTop, scrollHeight, clientHeight} = chatContainer.value;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Allow a small buffer

        messages.value.push(newMessage);

        // Scroll to the bottom of the chat if the user is already at the bottom
        if (isAtBottom) {
          nextTick(() => {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
          });
        }
      }
    });
  }, (error) => notifyError(notification, error));
};

onUnmounted(() => {
  reset();
});

const onScroll = async () => {
  if (chatContainer.value.scrollTop === 0 && messages.value.length) {
    await loadMessages();
  }
};

const loadMessages = async () => {
  if (isLoading.value || hasNoMoreMessages.value) {
    return;
  }

  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000));

  const previousScrollHeight = chatContainer.value.scrollHeight;

  const firstMessageCreatedAt = messages.value.length ? messages.value[0].createdAt : null;

  const q = query(messagesSource.value,
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
      startAt(firstMessageCreatedAt));
  const snapshot = await getDocs(q);
  const prevMessages = snapshot.docs.map(doc => doc.data());
  if (prevMessages.length < PAGE_SIZE) {
    hasNoMoreMessages.value = true;
  }

  prevMessages.sort((a, b) => a.createdAt - b.createdAt);
  messages.value.unshift(...prevMessages);

  isLoading.value = false;

  // Wait for DOM updates and adjust scroll position
  await nextTick();
  const newScrollHeight = chatContainer.value.scrollHeight;
  chatContainer.value.scrollTop += newScrollHeight - previousScrollHeight;
};

const computeStacked = (message: MessageEntity, index: number) => {
  let isPrevMessageFromSameUser = true
  const prevMessage = index === 0 ? null : messages.value[index - 1];
  if (prevMessage) {
    isPrevMessageFromSameUser = prevMessage.fromUser?.id === message.fromUser?.id;
  }

  let isNextMessageFromSameUser = false
  const nextMessage = index === messages.value.length - 1 ? null : messages.value[index + 1];
  if (nextMessage) {
    isNextMessageFromSameUser = nextMessage.fromUser?.id === message.fromUser?.id;
  }

  return isPrevMessageFromSameUser && isNextMessageFromSameUser;
}

</script>

<template>
  <div class="messages-container px-4" ref="chatContainer" @scroll="onScroll">
    <div v-if="isLoading" class="loading-spinner">
      <n-spin size="medium"/>
    </div>
    <div class="initial-loading-spinner" v-if="isInitialLoading">
      <n-spin :show="isInitialLoading"/>
    </div>

    <div v-if="!isInitialLoading && messages" v-for="(message, index) in messages" :key="message.id">
      <MessageComponent :message="message"  :chatId="props.chatId" :attachmentsUrl="message.attachmentsUrl"
                        :isStacked="computeStacked(message, index)"/>
    </div>
  </div>

  <div style=" flex-grow: 1;">
    <MessageInput :disabled="isInitialLoading" :chatId="props.chatId"/>
  </div>
</template>


<style scoped>
.initial-loading-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;

  /* For Firefox */

  &::-webkit-scrollbar {
    width: 5px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--cs-scrollbar-color);
    border-radius: 5px;
  }
}

.loading-spinner {
  padding: 1rem 0 1.2rem;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
