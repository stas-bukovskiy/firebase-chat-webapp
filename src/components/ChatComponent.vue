<script setup lang="ts">

import {ref, onMounted, nextTick} from 'vue';
import MessageInput from "@/components/MessageInput.vue";
import MessageComponent from "@/components/MessageComponent.vue";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

const messages = ref([]);
const isLoading = ref(false);
const chatContainer = ref(null);
let lastLoadedMessageId = null;

// 🧩 Fetch initial messages
const loadMessages = async (olderThan = null) => {
  isLoading.value = true;
  try {
    const response = await fetchMessages(olderThan);
    const previousScrollHeight = chatContainer.value.scrollHeight;

    // 📌 Insert new messages at the top
    messages.value = [...response, ...messages.value];
    lastLoadedMessageId = response.length ? response[0].id : null;

    // 🧩 Wait for DOM updates and adjust scroll position
    await nextTick();
    const newScrollHeight = chatContainer.value.scrollHeight;
    chatContainer.value.scrollTop += newScrollHeight - previousScrollHeight;
  } finally {
    isLoading.value = false;
  }
};

// 📦 Simulate API call
const fetchMessages = async (olderThan) => {
  // Replace this with your Firestore fetch logic
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 1 || 99}`,
      fromUid: '1',
      status: 'read',
      avatar: {displayName: "John Doe", avatarKey: "test.user.1@mail.com", isOnline: true},
      isStacked: true,
      createdAt: 1708689948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 2 || 98}`,
      fromUid: '1',
      status: 'read',
      avatar: {displayName: "John Doe", avatarKey: "test.user.1@mail.com", isOnline: true},
      isStacked: true,
      createdAt: 1708689948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 3 || 97}`,
      fromUid: '1',
      status: 'read',
      avatar: {displayName: "John Doe", avatarKey: "test.user.1@mail.com", isOnline: true},
      isStacked: true,
      createdAt: 1708689948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 4 || 96}`,
      fromUid: '1',
      status: 'read',
      avatar: {displayName: "John Doe", avatarKey: "test.user.1@mail.com", isOnline: true},
      isStacked: false,
      createdAt: 1708689948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 5 || 95}`,
      fromUid: '2',
      status: 'read',
      avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
      isStacked: true,
      createdAt: 1708689948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 6 || 94}`,
      fromUid: '2',
      status: 'read',
      avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
      isStacked: true,
      createdAt: 1748001948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 7 || 93}`,
      fromUid: '2',
      status: 'read',
      avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
      isStacked: true,
      createdAt: 1748001948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 8 || 92}`,
      fromUid: '2',
      status: 'sent',
      avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
      isStacked: false,
      createdAt: 1737633948
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 9 || 91}`,
      fromUid: '1',
      status: 'sent',
      avatar: {displayName: "John Doe", avatarKey: "test.user.1@mail.com", isOnline: true},
      isStacked: false,
      createdAt: 1736078748
    },
    {
      uid: Math.floor(Math.random() * 1_000),
      text: `Old message #${olderThan - 10 || 90}`,
      fromUid: '2',
      status: 'sending',
      avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
      isStacked: false,
      createdAt: 1730289948
    },
  ]
};

// 🖱️ Scroll handler for infinite scrolling
const onScroll = async () => {
  if (chatContainer.value.scrollTop === 0 && lastLoadedMessageId !== null) {
    await loadMessages(lastLoadedMessageId);
  }
};

// ✉️ Send new message
const sendMessage = (newMessage) => {
  messages.value.push({
    uid: Math.floor(Math.random() * 1_000),
    text: newMessage.text,
    fromUid: '2',
    status: 'sending',
    avatar: {displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false},
    isStacked: false,
    createdAt: nowToUTCTimestamp()
  });
  nextTick(() => {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  });
};

// 🚀 Initial load
onMounted(() => {
  loadMessages();
});

const props = defineProps({
  uid: String,
});

</script>

<template>
  <div class="messages-container px-4" ref="chatContainer" @scroll="onScroll">
    <div v-if="isLoading" class="loading-spinner">Loading...</div>

    <div class="">
      <MessageComponent v-for="message in messages" :key="message.id" :message="message" :avatar="message.avatar"/>
    </div>
  </div>
  <div style=" flex-grow: 1;">
    <MessageInput @sendMessage="sendMessage"/>
  </div>
</template>


<style scoped>
.messages-container {
  flex-grow: 1;
  overflow-y: scroll;
  padding: 10px;
  height: 100%;

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

</style>
