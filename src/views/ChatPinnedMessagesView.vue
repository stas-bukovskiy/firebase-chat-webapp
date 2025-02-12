<script setup lang="ts">
import {computed, inject, nextTick, onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import MessageComponent from "@/components/MessageComponent.vue";
import {type ChatAggregate, MessageEntity, PinnedMessageEntity} from "@/services/entities.ts";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAt,
  getDoc,
} from "firebase/firestore";
import {db} from "@/firebase";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {INJECT_KEYS} from "@/utils/inject_keys.ts";
import {ArrowLeft20Regular} from "@vicons/fluent";
import {useRouter} from "vue-router";

const INITIAL_PAGE_SIZE = 24;

const notification = useNotification();
const currentUserStore = useCurrentUserStore();

const isInitialLoading = ref(true);
const isLoadingMoreMessages = ref(false);
const hasNoMoreMessages = ref(false);

const chatContainer = ref(null);

interface MessageAlias {
  message: MessageEntity;
  createdAt: number;
}

const pinnedMessagesMap = reactive(new Map<string, MessageAlias>());
const pinnedMessages = computed(() => {
  return Array.from(pinnedMessagesMap.values())
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((message) => message.message);
});

onMounted(async () => {
  await handleInitialFetch();
});

onUnmounted(() => {
  reset();
});

const chatAgg = inject<ChatAggregate>(INJECT_KEYS.ChatAgg);

watch(() => chatAgg, async () => {
  await handleInitialFetch();
});

const handleInitialFetch = async () => {
  reset();

  await fetchPinnedMessages();
  isInitialLoading.value = false;
};

const unsubscribes = new Array<Unsubsribe>();

const reset = () => {
  pinnedMessagesMap.clear();
  isLoadingMoreMessages.value = false;
  isInitialLoading.value = true;

  unsubscribes.forEach((unsubscribe) => {
    unsubscribe();
  });
  unsubscribes.length = 0;
};

const fetchPinnedMessages = async () => {
  const messagesRef = collection(db, 'chats', chatAgg.value?.chat?.id, 'pinnedMessage').withConverter(PinnedMessageEntity.converter);

  const queryConstraints = [
    orderBy('createdAt', 'desc'),
    limit(INITIAL_PAGE_SIZE)
  ];

  if (pinnedMessages.value.length) {
    queryConstraints.push(startAt(pinnedMessages.value[0].createdAt));
  }
  const q = query(messagesRef, ...queryConstraints);

  let isInitialFetch = !pinnedMessagesMap.size;
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const newPinnedMessage = change.doc.data() as PinnedMessageEntity;
        const message = await getDoc(newPinnedMessage.message.withConverter(MessageEntity.converter));
        if (!message.exists()) {
          return;
        }
        const messageData = message.data() as MessageEntity;
        pinnedMessagesMap.set(message.id, {
          message: messageData,
          createdAt: newPinnedMessage.createdAt
        })

        if (isInitialFetch) {
          await nextTick();
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      } else if (change.type === "removed") {
        pinnedMessagesMap.delete(change.doc.id);
      }
    });
    unsubscribes.push(unsubscribe);

    if (!isInitialFetch && snapshot.size < INITIAL_PAGE_SIZE) {
      hasNoMoreMessages.value = true;
      console.log('No more messages');
    }
  }, (error) => notifyError(notification, error));
};

const onScroll = async () => {
  if (!chatContainer.value) return

  if (chatContainer.value.scrollTop === 0 && pinnedMessages.value.length
      && !isLoadingMoreMessages.value && !hasNoMoreMessages.value) {
    await fetchPinnedMessages();
  }
};

const isMessageRead = (message: MessageEntity) => {
  if (!message)
    return false;

  return (message.isRead && !chatAgg.value?.chat.isGroup) || message.readBy.includes(currentUserStore.username);
}

const router = useRouter();
const handleBackButton = () => {
  router.back();
};

</script>

<template>
  <div class="d-flex align-items-center px-4 py-3 bordered-bottom">
    <n-button text style="font-size: 24px" class="d-flex align-items-baseline me-3"
              @click="handleBackButton">
      <n-icon class="d-flex align-items-baseline">
        <ArrowLeft20Regular/>
      </n-icon>
    </n-button>
    <h4 class="mb-0">Pinned Messages</h4>
  </div>

  <div class="messages-container px-4" ref="chatContainer" @scroll="onScroll">
    <div v-if="isLoadingMoreMessages" class="loading-spinner">
      <n-spin/>
    </div>
    <div class="initial-loading-spinner" v-if="isInitialLoading">
      <n-spin :show="isInitialLoading"/>
    </div>

    <div style="margin-top: auto;">
      <div v-if="!isInitialLoading && pinnedMessagesMap.size" v-for="message in pinnedMessages"
           :key="message.id"
           class="message"
           :data-id="message.id">
        <MessageComponent :message="message" :chatId="chatAgg?.chat?.id" :attachmentsUrl="message.attachmentsUrl"
                          :isRead="isMessageRead(message)"/>
      </div>
    </div>
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