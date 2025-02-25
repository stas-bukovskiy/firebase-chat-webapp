<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {generateAvatarColors, generateInitials} from "@/utils/avatars";
import {Edit24Filled, Delete24Filled, Dismiss24Filled} from "@vicons/fluent";
import {ref as firebaseRef, uploadBytesResumable, getDownloadURL, deleteObject, listAll} from "firebase/storage";
import type {UploadTask} from "firebase/storage";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {storage} from "@/firebase";
import {getFileExtension} from "@/utils/files.ts";

const defaultColors = {
  bgColor: "var(--cs-primary-color)",
  textColor: "var(--cs-main-bg-color)"
};

const sizeConfigs = new Map([
  ["big", {
    width: "82px",
    height: "82px",
    borderRadius: '10px',
    fontSize: '1.8em'
  }],
  ["large", {
    width: '120px',
    height: '120px',
    borderRadius: '16px',
    fontSize: '2.2em'
  }],
]);


const props = defineProps({
  displayName: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  avatarKey: String,
  size: {
    type: String,
    default: "big"
  }
})

const emit = defineEmits(["update:isLoading", "newAvatarUrl"])

onMounted(() => {
  if (!props.avatarUrl) {
    const listRef = firebaseRef(storage, `avatars/${props.avatarKey}`);
    listAll(listRef).then((res) => {
      if (res.items.length) {
        startLoading();
        getDownloadURL(res.items[0]).then((url) => {
          avatarUrl.value = url;
          emit("newAvatarUrl", url);
        }).catch((error) => {
          notifyError(notification, error);
        }).finally(() => {
          stopLoading();
        });
      }
    }).catch((error) => {
      console.log("Error listing files", error);
      notifyError(notification, error);
    })
  }
})


const initials = computed(() => {
  return props.displayName ? generateInitials(props.displayName) : "";
})

const generateAvatarName = (fileName: string): string => {
  return `avatars/${props.avatarKey}/avatar.${getFileExtension(fileName)}`
}

const avatarUrl = ref<string | null>(props.avatarUrl)
const isAvatarUrl = computed(() => avatarUrl.value !== null)

const hover = ref(false)

const loading = ref(false)
const percentage = ref(80)
const uploadTask = ref<UploadTask | null>(null)

const startLoading = () => {
  loading.value = true
  emit("update:isLoading", true);
};

const stopLoading = () => {
  loading.value = false
  emit("update:isLoading", false);
};

const reset = () => {
  stopLoading();
  percentage.value = 0;
  uploadTask.value = null;
}

const notification = useNotification();

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }

  startLoading();

  const storageRef = firebaseRef(storage, generateAvatarName(file.name));
  uploadTask.value = uploadBytesResumable(storageRef, file);

  uploadTask.value.on("state_changed", (snapshot) => {
        percentage.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, (error) => {
        reset();
        notifyError(notification, error)
      }, async () => {
        const newAvatarUrl = await getDownloadURL(uploadTask.value.snapshot.ref);
        avatarUrl.value = newAvatarUrl;
        emit("newAvatarUrl", newAvatarUrl);

        reset();
      }
  );

  target.value = "";
};

const handleCancelUploading = () => {
  if (uploadTask.value) {
    try {
      uploadTask.value.cancel();
    } catch (error) {
      notifyError(notification, error);
    } finally {
      reset();
    }
  }
}

const handleAvatarRemoving = () => {
  const avatarDeleteRef = firebaseRef(storage, generateAvatarName(avatarUrl.value));
  deleteObject(avatarDeleteRef).then(() => {
    avatarUrl.value = null;
    emit("newAvatarUrl", null);
  }).catch((error) => {
    notifyError(notification, error);
  });
}

const containerStyles = computed(() => {
      const colors = props.avatarKey ? generateAvatarColors(props.avatarKey) : defaultColors;
      return {
        ...sizeConfigs.get(props.size),
        backgroundColor: colors.bgColor,
        color: colors.textColor,
      };
    })
;
</script>

<template>
  <div class="avatar-container" :style="containerStyles"
       @mouseover="hover = !loading" @mouseleave="hover = false">
    <img v-if="isAvatarUrl" :src="avatarUrl" :alt="displayName" class="avatar-image"/>
    <span v-else class="avatar-initials">{{ initials }}</span>
    <div v-if="hover" class="avatar-overlay">
      <n-tooltip trigger="hover">
        <template #trigger>
          <div class="profile-settings">
            <label for="image-upload" class="upload-button">
              <Edit24Filled style="width: 18px;"/>
            </label>
            <input type="file" id="image-upload" class="hidden" @change="handleAvatarUpload" accept="image/*"/>
          </div>
        </template>
        Change Avatar
      </n-tooltip>
      <n-tooltip trigger="hover" v-if="avatarUrl">
        <template #trigger>
          <n-button strong circle type="primary" class="ms-2" @click="handleAvatarRemoving">
            <template #icon>
              <n-icon class="d-flex justify-content-center align-items-center">
                <Delete24Filled/>
              </n-icon>
            </template>
          </n-button>
        </template>
        Remove Avatar
      </n-tooltip>
    </div>

    <div v-if="loading" class="avatar-overlay">
      <div style="">
        <n-progress type="circle" :percentage="percentage" status="default" style="width: 75px">
          <n-button strong circle type="primary" @click="handleCancelUploading">
            <template #icon>
              <n-icon>
                <Dismiss24Filled/>
              </n-icon>
            </template>
          </n-button>
        </n-progress>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-weight: bold;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}


.upload-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: var(--cs-primary-color);
  color: #000;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: var(--cs-primary-color-hover);
}

.upload-button:active {
  background-color: var(--cs-primary-color-pressed);
}

.hidden {
  display: none;
}
</style>