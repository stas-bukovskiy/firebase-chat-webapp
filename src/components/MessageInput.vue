<script setup lang="ts">
import {computed, ref} from "vue";
import {Attach24Filled,} from "@vicons/fluent";
import {collection, doc, addDoc} from "firebase/firestore";
import {db} from "@/firebase";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {MessageStatus} from "@/services/entities.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import {SendRound} from "@vicons/material";
import {notifyError, notifyErrorDetail} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import UploadAttachments from "@/components/UploadAttachments.vue";
import type {AttachmentParams} from "@/services/models.ts";
import {generateFileKey} from "@/utils/files.ts";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

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
const attachmentsUrl = ref<string[]>([]);

const submitMessage = async () => {
  const messageText = newMessage.value.trim();
  if (messageText || attachmentsUrl.value.length) {
    isLoading.value = true;
    addDoc(collection(db, 'chats', props.chatId, 'messages'), {
      text: messageText,
      fromUser: doc(db, 'users', currentUserStore.currentUser.username),
      status: MessageStatus.SENT,
      attachmentsUrl: attachmentsUrl.value,
      createdAt: nowToUTCTimestamp(),
    }).catch((e) => {
      notifyError(notification, e);
    }).finally(() => {
      newMessage.value = '';
      isLoading.value = false;
      if (textareaRef.value) {
        textareaRef.value.style.height = defaultHeight;
        attachmentsUrl.value = [];
        attachments.value = [];
      }
    });
  }
};

const attachments = ref<AttachmentParams[]>([]);
const isAttachmentLoading = ref(false);

const isDisabled = computed(() => {
  return props.disabled || isAttachmentLoading.value || (!newMessage.value.trim() && !attachments.value.length);
});

const chooseFile = () => {
  document.getElementById("file-upload").click();
}

const handleFileUploading = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;
  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > MAX_FILE_SIZE) {
        notifyErrorDetail(notification, {
          title: `File ${file.name} is too large.`,
          description: `Maximum size is 10MB.`,
        });
        continue;
      } else if (i >= MAX_FILES) {
        console.log('Max files reached');
        notifyErrorDetail(notification, {
          title: `You can't upload more than ${MAX_FILES} files.`,
          description: 'Please send the current files before adding more.',
        });
        break;
      }

      attachments.value.push({
        key: generateFileKey(),
        file: fileList[i]
      });
    }
  }
  target.files = null;
};

const removeAttachment = (fileKey: number) => {
  attachments.value = attachments.value.filter((file) => file.key !== fileKey);
};

const handleAttachmentUrl = (url: string) => {
  attachmentsUrl.value.push(url);
};

</script>

<template>
  <div class="message-input px-4 py-3">
    <UploadAttachments v-if="attachments.length" :attachments="attachments" :onRemove="removeAttachment"
                       :chatId="chatId" class="mb-3"
                       @update:isLoading="isAttachmentLoading = $event"
                       @addAttachmentUrl="handleAttachmentUrl"/>

    <div class="d-flex align-items-start">
      <n-button tertiary circle size="large" @click="chooseFile">
        <template #icon>
          <n-icon size="1.4rem">
            <Attach24Filled/>
          </n-icon>
        </template>
      </n-button>
      <input type="file" id="file-upload" hidden="hidden" @change="handleFileUploading" multiple/>


      <textarea
          ref="textareaRef"
          class="mx-2"
          v-model="newMessage"
          placeholder="Type a message..."
          rows="1"
          @input="adjustTextareaHeight"
          @keydown.enter.prevent="submitMessage"
      />

      <n-button type="primary" size="large" @click="submitMessage" :disabled="isDisabled">
        <n-icon size="1.4rem">
          <SendRound/>
        </n-icon>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.message-input {
  border-top: 2px solid var(--cs-sub-card-bg-color);
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
