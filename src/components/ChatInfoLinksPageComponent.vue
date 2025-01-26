<script setup lang="ts">
import {ArrowLeft20Regular} from "@vicons/fluent";
import {onMounted, ref} from "vue";
import type {ChatAggregate} from "@/services/entities.ts";

const PAGE_SIZE = 32;

const props = defineProps<{
  chatAgg: ChatAggregate;
}>();

const emit = defineEmits(["back"]);

const links = ref<string[]>([]);

const linksContainer = ref<HTMLElement>();
const isInitialLoading = ref(true);
const isLoading = ref(false);
const hasNoMoreLinks = ref(false);

onMounted(async () => {
  await loadMoreLinks();
  isInitialLoading.value = false;
});

const onScroll = async () => {
  if (!linksContainer.value || isInitialLoading.value) return

  const {scrollTop, scrollHeight, clientHeight} = linksContainer.value;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    await loadMoreLinks();
  }
};

const loadMoreLinks = async () => {
  if (hasNoMoreLinks.value || isLoading.value) return

  // TODO: implement the logic to fetch more files from the server
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000));
  isLoading.value = false;
  links.value.push(
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2F00ceujtpc5%2FScreenshot%20from%202024-07-21%2012-13-20.png?alt=media&token=4ad0aa94-4718-40a2-972a-53fa810e552c',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2Fkuoix9qpbw%2FScreenshot%20from%202024-07-23%2014-57-49.png?alt=media&token=79c8aa0e-cdc7-4a55-98a0-8122eafaff5e',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2Fkuoix9qpbw%2FScreenshot%20from%202024-07-23%2014-57-49.png?alt=media&token=79c8aa0e-cdc7-4a55-98a0-8122eafaff5e',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2Fkuoix9qpbw%2FScreenshot%20from%202024-07-23%2014-57-49.png?alt=media&token=79c8aa0e-cdc7-4a55-98a0-8122eafaff5e',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/attachments%2FCIvmkEzw61INMayq51Zi%2Fkuoix9qpbw%2FScreenshot%20from%202024-07-23%2014-57-49.png?alt=media&token=79c8aa0e-cdc7-4a55-98a0-8122eafaff5e',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7',
      'https://firebasestorage.googleapis.com/v0/b/chat-webapp-6634b.firebasestorage.app/o/avatars%2Fmail%40mail.com%2Favatar.jpg?alt=media&token=e239af4e-056d-46dc-a8be-f96bc7e23cd7'
  )
};

</script>

<template>
  <div class="chat-info-container">
    <div class="d-flex align-items-center px-4 py-3 bottom-bordered">
      <n-button text style="font-size: 24px" class="d-flex align-items-baseline me-3"
                @click="emit('back')">
        <n-icon class="d-flex align-items-baseline">
          <ArrowLeft20Regular/>
        </n-icon>
      </n-button>
      <h4 class="mb-0">Links</h4>
    </div>

    <div class="attachments-container ps-4 me-1 pe-1 py-3" ref="linksContainer" @scroll="onScroll">
      <div class="initial-loading-spinner" v-if="isInitialLoading">
        <n-spin :show="isInitialLoading"/>
      </div>

<!--      // TODO: Implement the logic to render the links-->

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