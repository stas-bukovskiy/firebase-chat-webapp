<script setup lang="ts">

import {computed, onMounted, type PropType, ref} from "vue";
import {
  deleteObject,
  getDownloadURL,
  ref as firebaseRef,
  uploadBytesResumable,
  type UploadTask
} from "firebase/storage";
import {useNotification} from "naive-ui";
import {storage} from "@/firebase";
import {notifyError} from "@/utils/errors.ts";
import {getFileExtension, getFileNameFromStorageUrl, getFilePathFromStorageUrl} from "@/utils/files.ts";
import {Delete24Filled, Dismiss24Filled, Document24Regular} from "@vicons/fluent";
import {ViewFilled, Download} from "@vicons/carbon";

const props = defineProps({
  isEditable: {
    type: Boolean,
    required: false,
    default: false
  },
  chatId: String,
  file: {
    type: Object as PropType<File>,
    required: false
  },
  fileUrl: {
    type: String,
    required: false
  },
});

const emit = defineEmits(["addAttachmentUrl", "update:isLoading", "removed"]);

const notification = useNotification();

const hover = ref(false)
const loading = ref(false);
const fileUrl = ref(props.fileUrl);
const percentage = ref(80);
const uploadTask = ref<UploadTask | null>(null)

onMounted(() => {
  if (!props.file && !props.fileUrl) {
    console.error("file or fileUrl prop is required");
  }

  if (props.file) {
    uploadFile(props.file);
  }
});

const uploadFile = (file: File) => {
  startLoading();

  const storageRef = firebaseRef(storage, generateAttachmentName(file.name));
  uploadTask.value = uploadBytesResumable(storageRef, file);

  uploadTask.value.on("state_changed", (snapshot) => {
        percentage.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, (error) => {
        reset();
        notifyError(notification, error)
      }, async () => {
        fileUrl.value = await getDownloadURL(uploadTask.value.snapshot.ref);
        emit("addAttachmentUrl", fileUrl.value);

        reset();
      }
  );
}

const startLoading = () => {
  loading.value = true
  emit("update:isLoading", true);
};

const reset = () => {
  stopLoading();
  percentage.value = 0;
  uploadTask.value = null;
}

const stopLoading = () => {
  loading.value = false
  emit("update:isLoading", false);
};

const generateAttachmentName = (fileName: string): string => {
  const randomName = Math.random().toString(36).substring(2, 12);
  return `attachments/${props.chatId}/${randomName}/${fileName}`;
};

const handleCancelUploading = () => {
  if (uploadTask.value) {
    try {
      uploadTask.value.cancel();
    } catch (error) {
      notifyError(notification, error);
    } finally {
      emit("removed");
      reset();
    }
  }
}

const handleFileRemoving = () => {
  const fileDeleteRef = firebaseRef(storage, getFilePathFromStorageUrl(fileUrl.value));
  deleteObject(fileDeleteRef).then(() => {
    fileUrl.value = null;
    emit("removed");
  }).catch((error) => {
    notifyError(notification, error);
  });
}

const isImage = computed(() => {
  const fileName = fileUrl?.value || props.file?.name;
  const fileExtension = getFileExtension(fileName);
  return fileExtension.match(/(jpg|jpeg|png|gif|webp)$/i) !== null;
});

const fileName = computed(() => {
  return props.file?.name || getFileNameFromStorageUrl(fileUrl.value);
});


</script>

<template>
  <div class="file-card d-flex justify-content-center align-items-center"
       :style="!isImage ? {border: '2px solid'} : {}"
       @mouseover="hover = isEditable" @mouseleave="hover = false">

    <!-- Progress bar -->
    <div v-if="loading" class="file-card-overlay" style="opacity: 100%">
      <n-progress type="circle" :percentage="percentage" style="width: 50px">
        <n-button text @click="handleCancelUploading">
          <n-icon size="1rem">
            <Dismiss24Filled/>
          </n-icon>
        </n-button>
      </n-progress>
    </div>

    <!-- Options for file -->
    <div v-else class="file-card-overlay" :style="!isEditable ? {cursor: 'pointer'} : {}">
      <div v-if="isEditable">
        <n-button text v-if="isImage">
          <n-icon size="1.4rem" class="me-1">
            <ViewFilled/>
          </n-icon>
        </n-button>
        <n-button text v-else>
          <n-icon size="1.4rem" class="me-1">
            <Download/>
          </n-icon>
        </n-button>

        <n-button text @click="handleFileRemoving">
          <n-icon size="1.4rem">
            <Delete24Filled/>
          </n-icon>
        </n-button>
      </div>
    </div>

    <!-- Image section -->
    <img v-if="isImage && !loading" :src="fileUrl" :alt="fileName" class="file-image"/>
    <!-- File section -->
    <div v-else class="d-flex justify-content-center flex-column align-items-center text-muted fw-bold">
      <n-icon size="2rem" class="mb-2">
        <Document24Regular/>
      </n-icon>
      <div class="file-name">{{ fileName }}</div>
    </div>
  </div>
</template>

<style scoped>
.file-card {
  width: 5.2rem;
  height: 5.2rem;
  position: relative;
  border-color: var(--cs-primary-color);
  border-radius: 8px;
  background-color: transparent;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.file-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(34, 30, 52, 0.6);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.file-card-overlay:hover {
  opacity: 100%;
}

.file-name {
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 4rem
}

.file-image {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>