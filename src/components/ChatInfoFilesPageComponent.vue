<script setup lang="ts">
import {ArrowLeft20Regular} from "@vicons/fluent";
import {onMounted, ref} from "vue";
import AttachmentComponent from "@/components/AttachmentComponent.vue";
import {type ChatAggregate, MessageFileEntity} from "@/services/entities.ts";
import {Pages} from "@/services/enums.ts";
import {collection, getDocs, limit, orderBy, query, where} from "firebase/firestore";
import {db} from "@/firebase";

const PAGE_SIZE = 32;

const props = defineProps<{
  chatAgg: ChatAggregate;
  pageType: "media" | "files";
}>();

const emit = defineEmits(["back"]);

const mediaFiles = ref<MessageFileEntity[]>([]);

const filesContainer = ref<HTMLElement>();
const isInitialLoading = ref(true);
const isLoading = ref(false);
const hasNoMoreFiles = ref(false);

onMounted(async () => {
  await loadMoreFiles();
  isInitialLoading.value = false;
});

const onScroll = async () => {
  if (!filesContainer.value || isInitialLoading.value) return

  const {scrollTop, scrollHeight, clientHeight} = filesContainer.value;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    await loadMoreFiles();
  }
};

const loadMoreFiles = async () => {
  if (hasNoMoreFiles.value || isLoading.value) return
  isLoading.value = !isInitialLoading.value;

  const fileQueryConstraints = [
    where("isMedia", "==", props.pageType === Pages.MEDIA),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  ]
  if (mediaFiles.value.length > 0) {
    fileQueryConstraints.push(where("createdAt", "<", mediaFiles.value[mediaFiles.value.length - 1].createdAt))
  }

  const filesRef = collection(db, `chats/${props.chatAgg?.chat?.id}/files`).withConverter(MessageFileEntity.converter)
  const filesQuery = query(filesRef, ...fileQueryConstraints);
  getDocs(filesQuery).then((filesSnapshot) => {
    if (filesSnapshot.size === 0) {
      console.log("No more files found");
      hasNoMoreFiles.value = true;
      return
    }

    const files = filesSnapshot.docs.map(doc => doc.data());
    mediaFiles.value.push(...files);
    hasNoMoreFiles.value = files.length < PAGE_SIZE;
  }).catch((error) => {
    console.error("Error loading files", error);
  }).finally(() => {
    isLoading.value = false;
  });
};

const isMedia = props.pageType === Pages.MEDIA;
</script>

<template>
  <div class="chat-info-container">
    <div class="d-flex align-items-center px-4 py-3 bordered-bottom">
      <n-button text style="font-size: 24px" class="d-flex align-items-baseline me-3"
                @click="emit('back')">
        <n-icon class="d-flex align-items-baseline">
          <ArrowLeft20Regular/>
        </n-icon>
      </n-button>
      <h4 class="mb-0">{{ isMedia ? 'Media' : 'Files' }}</h4>
    </div>

    <div class="attachments-container ps-4 me-1 pe-1 py-3" ref="filesContainer" @scroll="onScroll">
      <div class="initial-loading-spinner" v-if="isInitialLoading">
        <n-spin/>
      </div>
      <div class="initial-loading-spinner" v-else-if="hasNoMoreFiles && mediaFiles.length===0">
        <p class="badge-default">No {{ isMedia ? 'media' : 'files' }} yet</p>
      </div>

      <AttachmentComponent v-for="mediaFile in mediaFiles" :key="mediaFile.id"
                           :fileUrl="mediaFile.url" class="attachment-item"/>

      <div v-if="isLoading && !isInitialLoading" class="loading-spinner">
        <n-spin/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attachments-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* Space between items */
  align-content: flex-start; /* Align rows to the top */
  justify-content: flex-start; /* Align items to the left */

  overflow-y: auto;
  height: calc(100vh - 7.2rem); /* 100% - header and footer height */

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

.attachment-item {
  flex: 0 1 calc(33.333% - 1rem); /* 3 items per row with gap adjustment */
  height: auto;
  aspect-ratio: 1 / 1; /* Makes the height equal to the width */
  box-sizing: border-box; /* Includes padding and border in width/height calculation */
}

.initial-loading-spinner {
  width: 100%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  padding: 1rem 0 1rem;
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}


@media (max-width: 1444px) {
  .attachment-item {
    flex: 0 1 calc(50% - 1rem); /* 2 items per row on smaller screens */
  }
}

@media (max-width: 480px) {
  .attachment-item {
    flex: 0 1 calc(100% - 1rem); /* 1 item per row on very small screens */
  }
}
</style>