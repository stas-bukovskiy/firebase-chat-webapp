<script setup lang="ts">

import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import MessageInput from "@/components/MessageInput.vue";
import MessageComponent from "@/components/MessageComponent.vue";
import {MessageEntity, MessageStatus} from "@/services/entities.ts";
import {collection, doc, getDocs, limit, onSnapshot, orderBy, query, startAt, where, or, updateDoc} from "firebase/firestore";
import {db} from "@/firebase";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";

const PAGE_SIZE = 12;

const props = defineProps({
  chatId: String,
});

const notification = useNotification();
const currentUserStore = useCurrentUserStore();

const isInitialLoading = ref(true);
const isLoadingOldMessages = ref(false);
const isLoadingNewMessages = ref(false);

const chatContainer = ref(null);

const messages = ref<MessageEntity[]>([]);

const hasNoMoreOldMessages = ref(false);
const hasNoMoreNewMessages = ref(false);
let firstNewMessageId = null;

let unsubscribe = null;

const messagesSource = computed(() => {
  return collection(db, 'chats', props.chatId, 'messages').withConverter(MessageEntity.converter);
});

onMounted(async () => {
  await handleInitialFetch();
});

watch(() => props.chatId, async () => {
  await handleInitialFetch();
});

watch(hasNoMoreNewMessages, (hasNoMoreNewMessages) => {
  // Subscribe to new messages if there are no more new messages
  // (user has scrolled down to the bottom of the chat)
  if (hasNoMoreNewMessages) {
    subscribeToNewMessages();
  }
});

const handleInitialFetch = async () => {
  reset();

  // fetchInitialOldMessages()
  //     .then(fetchInitialNewMessages())
  //     .then(() => {
  //       // Finish initial loading
  //       isInitialLoading.value = false;
  //
  //       // Scroll to the bottom of the chat
  //       nextTick(() => {
  //         chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  //       })
  //     })
  //     // .then(new Promise(resolve => setTimeout(resolve, 5000)))
  //     .catch((e) => {
  //       notifyError(notification, e);
  //     })
  await fetchInitialOldMessages();
  await fetchInitialNewMessages();
  isInitialLoading.value = false;
  if (chatContainer.value) {
    await nextTick(() => {
      if (firstNewMessageId) {
        scrollToMessageById(firstNewMessageId);
      } else {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    })
  }
};

const reset = () => {
  messages.value = [];
  hasNoMoreOldMessages.value = false;
  hasNoMoreNewMessages.value = false;
  isLoadingOldMessages.value = false;
  isLoadingNewMessages.value = false;
  isInitialLoading.value = true;
  firstNewMessageId = null;

  if (unsubscribe) {
    unsubscribe();
  }
};

const fetchInitialOldMessages = async () => {
  const q = query(messagesSource.value,
      or(
          where("status", "==", MessageStatus.READ),
          where("fromUser", "==", doc(db, "users", currentUserStore.currentUser.username)),
      ),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE));
  const snapshot = await getDocs(q);
  const prevMessages = snapshot.docs.map(doc => doc.data());
  if (prevMessages.length < PAGE_SIZE) {
    hasNoMoreOldMessages.value = true;
  }

  prevMessages.sort((a, b) => a.createdAt - b.createdAt);
  // prevMessages.forEach((message) => {
  //   console.log("Old message", message.fromUser.id === currentUserStore.username, message.text);
  // });
  messages.value = prevMessages;
};

const fetchInitialNewMessages = async () => {
  const queryParams = [messagesSource.value, orderBy('createdAt', 'asc'), limit(PAGE_SIZE)]

  const lastOldMessage = messages.value.length ? messages.value[messages.value.length - 1] : null;
  if (lastOldMessage) {
    queryParams.push(startAt(lastOldMessage.createdAt + 1));
  }

  const q = query(...queryParams);
  const snapshot = await getDocs(q);
  const newMessages = snapshot.docs.map(doc => doc.data());
  if (newMessages.length < PAGE_SIZE) {
    hasNoMoreNewMessages.value = true;
  }

  // newMessages.forEach((message) => {
  //   console.log("New message", message.fromUser.id === currentUserStore.username, message.text);
  // });

  // newMessages.sort((a, b) => a.createdAt - b.createdAt);
  messages.value.push(...newMessages);
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

        if (!chatContainer?.value) {
          messages.value.push(newMessage);
        } else {
          const {scrollTop, scrollHeight, clientHeight} = chatContainer.value;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Allow a small buffer

          messages.value.push(newMessage);

          // Scroll to the bottom of the chat if the user is already at the bottom
          if (isAtBottom) {
            nextTick(() => {
              scrollToBottom()
            });
          }
        }
      }
    });
  }, (error) => notifyError(notification, error));
};

onUnmounted(() => {
  reset();
});

const onScroll = async () => {
  if (!chatContainer.value || isInitialLoading) return

  updateReadStatus();

  const {scrollTop, scrollHeight, clientHeight} = chatContainer.value;
  if (chatContainer.value.scrollTop === 0 && messages.value.length) {
    await loadOldMessages();
  } else if (scrollTop + clientHeight >= scrollHeight - 10) {
    await loadNewMessages();
  }
};

const loadOldMessages = async () => {
  if (isLoadingOldMessages.value || hasNoMoreOldMessages.value) {
    return;
  }

  isLoadingOldMessages.value = true;
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
    hasNoMoreOldMessages.value = true;
  }

  prevMessages.sort((a, b) => a.createdAt - b.createdAt);
  messages.value.unshift(...prevMessages);

  isLoadingOldMessages.value = false;

  // Wait for DOM updates and adjust scroll position
  await nextTick(() => {
    const newScrollHeight = chatContainer.value.scrollHeight;
    chatContainer.value.scrollTop += newScrollHeight - previousScrollHeight;
  })
};

const loadNewMessages = async () => {
  if (isLoadingNewMessages.value || hasNoMoreNewMessages.value) {
    return;
  }

  isLoadingNewMessages.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000));

  // const previousScrollHeight = chatContainer.value.scrollHeight;

  const lastMessageCreatedAt = messages.value.length ?
      messages.value[messages.value.length - 1].createdAt + 1 :
      nowToUTCTimestamp();

  const q = query(messagesSource.value,
      orderBy('createdAt', 'asc'),
      limit(PAGE_SIZE),
      startAt(lastMessageCreatedAt));
  const snapshot = await getDocs(q);
  const newMessages = snapshot.docs.map(doc => doc.data());
  if (newMessages.length < PAGE_SIZE) {
    hasNoMoreNewMessages.value = true;
  }

  messages.value.push(...newMessages);

  isLoadingNewMessages.value = false;

  // // Wait for DOM updates and adjust scroll position
  // await nextTick(() => {
  //   const newScrollHeight = chatContainer.value.scrollHeight;
  //   chatContainer.value.scrollTop += newScrollHeight - previousScrollHeight;
  // })
};

const computeStacked = (message: MessageEntity, index: number) => {
  const nextMessage = index === messages.value.length - 1 ? null : messages.value[index + 1];
  if (!nextMessage) {
    return false
  }

  if (isNewMessage(index + 1)) {
    return false
  }

  return nextMessage.fromUser?.id === message.fromUser?.id;
}

const isNewMessage = (index: number) => {
  if (index === messages.value.length - 1 || index < 0) {
    return false;
  }

  const prevMessage = index !== 0 ? messages.value[index - 1] : null;
  if (prevMessage && prevMessage.status === MessageStatus.SENT) {
    return false;
  }

  const currMessage = messages.value[index];
  if (currMessage.fromUser?.id !== currentUserStore.currentUser.username && currMessage.status === MessageStatus.SENT) {
    firstNewMessageId = currMessage.id;
    return true;
  }

  return false;
}

function scrollToBottom(): void {
  if (!chatContainer.value || !messages.value.length) return;

  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
}

// Function to scroll to a specific message by ID
function scrollToMessageById(messageId: number): void {
  if (!chatContainer.value) return;

  const containerElement = chatContainer.value;
  const messageElement = containerElement.querySelector<HTMLElement>(`.message[data-id='${messageId}']`);

  if (messageElement) {
    messageElement.scrollIntoView({behavior: 'instant', block: 'end'});
  } else {
    console.warn(`Message with ID ${messageId} not found.`);
  }
}

// Function to check if a message is visible
function isMessageVisible(messageElement: HTMLElement, containerElement: HTMLElement): boolean {
  const messageRect = messageElement.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();

  return (
      messageRect.top >= containerRect.top &&
      messageRect.bottom <= containerRect.bottom
  );
}

// Function to update read status of messages
function updateReadStatus(): void {
  if (!chatContainer.value) return;

  const containerElement = chatContainer.value;
  const messageElements = containerElement.querySelectorAll<HTMLElement>('.message');

  messageElements.forEach(async (messageElement) => {
    const messageId = messageElement.dataset.id || ''
    const message = messages.value.find((msg) => msg.id === messageId);

    if (message && isMessageVisible(messageElement, containerElement)
        && message.status !== MessageStatus.READ && message.fromUser?.id !== currentUserStore.currentUser.username) {
      message.status = MessageStatus.READ;
      const messageRef = doc(db, 'chats', props.chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        status: MessageStatus.READ
      });
    }
  });
}

</script>

<template>
  <div class="messages-container px-4" ref="chatContainer" @scroll="onScroll">
    <div v-if="isLoadingOldMessages" class="loading-spinner">
      <n-spin/>
    </div>
    <div class="initial-loading-spinner" v-if="isInitialLoading">
      <n-spin :show="isInitialLoading"/>
    </div>

    <div style="margin-top: auto;">
      <div v-if="!isInitialLoading && messages" v-for="(message, index) in messages" :key="message.id"
           class="message" :data-id="message.id">
        <n-divider v-if="isNewMessage(index)">
          <span slot="content">Unread messages</span>
        </n-divider>
        <MessageComponent :message="message" :chatId="props.chatId" :attachmentsUrl="message.attachmentsUrl"
                          :isStacked="computeStacked(message, index)"/>
      </div>
    </div>

    <div v-if="isLoadingNewMessages" class="loading-spinner">
      <n-spin/>
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
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  padding: 10px;
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
  padding: 1rem 0 1rem;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
