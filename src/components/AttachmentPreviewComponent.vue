<template>
  <div class="attachment-modal" role="dialog" aria-modal="true">
    <div class="modal-content px-4 py-3 rounded-4">
      <n-button text @click="close" class="close-button">
        <n-icon class="h4">
          <CloseOutlined/>
        </n-icon>
      </n-button>
      <div class="attachment-view">
        <template v-if="isMedia">
          <img v-if="isImage" :src="currentAttachmentUrl" alt="Attachment"/>
          <video v-else-if="isVideo" controls>
            <source :src="currentAttachmentUrl"/>
            Your browser does not support the video tag.
          </video>
        </template>

        <template v-else>
          <div class="unknown-file">
            <n-icon size="10rem">
              <Document24Regular/>
            </n-icon>
          </div>
        </template>
      </div>

      <div class="mt-auto">
        <div class="mt-2 text-muted text-center" style="font-size: 1.1rem">{{ fileName }}</div>

        <div class="d-flex justify-content-center mt-3" style="gap: 0.8rem">
          <n-button v-if="hasMultiple" :disabled="isFirst" type="tertiary" size="large" @click="prev">
            <n-icon class="d-flex align-items-center justify-content-center">
              <ArrowBackIosFilled/>
            </n-icon>
          </n-button>
          <n-button v-if="hasMultiple" :disabled="isLast" type="tertiary" size="large" @click="next">
            <n-icon class="d-flex align-items-center justify-content-center">
              <ArrowForwardIosFilled/>
            </n-icon>
          </n-button>

          <n-button type="tertiary" size="large" @click="handleDownloadClick">
            <n-icon class="d-flex align-items-center justify-content-center">
              <DownloadFilled/>
            </n-icon>
          </n-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, defineProps, defineEmits, ref} from 'vue';
import {getFileExtension, getFileNameFromStorageUrl} from "@/utils/files.ts";
import {ArrowBackIosFilled, ArrowForwardIosFilled, CloseOutlined, DownloadFilled} from "@vicons/material";
import {Document24Regular} from "@vicons/fluent";
import {downloadStorageFile} from "@/utils/download.ts";

const props = defineProps<{
  attachments: string[];
  initialUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};

const initialIndex = props.attachments.findIndex(url => url === props.initialUrl);

const currentIndex = ref(initialIndex ?? 0);

const currentAttachmentUrl = computed(() => props.attachments[currentIndex.value]);

const hasMultiple = computed(() => props.attachments.length > 1);

const isFirst = computed(() => currentIndex.value === 0);
const isLast = computed(() => currentIndex.value === props.attachments.length - 1);

const next = () => {
  if (currentIndex.value < props.attachments.length - 1) {
    currentIndex.value++;
  }
};

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const handleDownloadClick = () => {
  downloadStorageFile(currentAttachmentUrl.value);
}

const fileExtension = computed(() => {
  console.log("currentAttachmentUrl.value", getFileExtension(currentAttachmentUrl.value));
  return getFileExtension(currentAttachmentUrl.value);
});

const fileName = computed(() => {
  return getFileNameFromStorageUrl(currentAttachmentUrl.value);
});

// Supported media types for images and videos
const isImage = computed(() => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.value));
const isVideo = computed(() => ['mp4', 'webm'].includes(fileExtension.value));
const isMedia = computed(() => isImage.value || isVideo.value);
</script>

<style scoped>
.attachment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.modal-content {
  position: relative;
  margin: auto;
  top: 50%;
  height: 80%;
  max-width: 80%;
  transform: translateY(-50%);
  background: rgba(47, 42, 74, 0.8);
  z-index: 1001;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 20px;
}

.attachment-view {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: auto;
  position: relative;
  height: 100%;
}

.attachment-view img,
.attachment-view video {
  max-width: 100%;
  max-height: 100%;
}

.unknown-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
