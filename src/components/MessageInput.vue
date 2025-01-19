<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {Attach24Filled, ArrowUp12Filled} from "@vicons/fluent";
import {collection, doc, addDoc} from "firebase/firestore";
import {db} from "@/firebase";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {MessageStatus} from "@/services/entities.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import {SendRound} from "@vicons/material";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";

const props = defineProps({
  chatId: String,
  disabled: {
    type: Boolean,
    default: false,
  }
});

const newMessage = ref('');
let isLoading = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const defaultHeight = 'auto';

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = defaultHeight;
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight + 2}px`;
  }
};

const currentUserStore = useCurrentUserStore();
const notification = useNotification();

const submitMessage = async () => {
  const messageText = newMessage.value.trim();
  if (messageText) {
    isLoading.value = true;
    addDoc(collection(db, 'chats', props.chatId, 'messages'), {
      text: messageText,
      fromUser: doc(db, 'users', currentUserStore.currentUser.username),
      status: MessageStatus.SENT,
      attachmentsUrl: [],
      createdAt: nowToUTCTimestamp(),
    }).catch((e) => {
      notifyError(notification, e);
    }).finally(() => {
      newMessage.value = '';
      isLoading.value = false;
      if (textareaRef.value) {
        textareaRef.value.style.height = defaultHeight;
      }
    });
  }
};

const isDisabled = computed(() => {
  return props.disabled || !newMessage.value.trim();
});
</script>

<template>
  <div class="message-input d-flex px-4 py-3">
    <n-button tertiary circle size="large">
      <template #icon>
        <n-icon size="1.4rem">
          <Attach24Filled/>
        </n-icon>
      </template>
    </n-button>

    <textarea
        ref="textareaRef"
        class="mx-2"
        v-model="newMessage"
        placeholder="Type a message..."
        rows="1"
        @input="adjustTextareaHeight"
        @keydown.enter.prevent="submitMessage"
    />

    <n-button type="primary" size="large" @click="submitMessage" :disabled="isDisabled" style="">
      <n-icon size="1.4rem">
        <SendRound/>
      </n-icon>
    </n-button>
  </div>
</template>

<style scoped>
.message-input {
  border-top: 2px solid var(--cs-sub-card-bg-color);
  display: flex;
  align-items: end;
}

textarea {
  resize: none;
  overflow: hidden;
  width: 100%;
  font-size: 1rem;
  padding: 8px;
  border: 1px solid var(--cs-sub-card-bg-color);
  background-color: var(--cs-sub-card-bg-color);
  transition: background-color 0.2s ease-in-out;
}

textarea {
  transition: border-color 0.2s ease-in-out;
}

textarea:focus {
  outline: none;
  border-color: var(--cs-primary-color);
  background-color: var(--cs-badge-current-bg-color);
}

textarea:focus {
  outline: none;
  border-color: var(--cs-primary-color);
}

</style>
