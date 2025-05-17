<script setup lang="ts">
import { useRoute } from "vue-router";
import { provide, ref, watch, computed } from "vue";
import { useChatStore } from "@/stores/chats.ts";
import ChatInfoComponent from "@/components/ChatInfoComponent.vue";
import { INJECT_KEYS } from "@/utils/inject_keys.ts";

const route = useRoute();
const chatStore = useChatStore();

// keep track of the current chat ID
const chatId = ref(route.params.id as string);
watch(() => route.params.id, id => {
  chatId.value = id as string;
});

// derive the chat aggregate reactively from Pinia
const chatAgg = computed(() => chatStore.getChatByUserChatId(chatId.value));

// show loading spinner as long as there's no chat in the store
const isLoading = computed(() => !chatAgg.value);

// make it injectable for children
provide(INJECT_KEYS.ChatAgg, chatAgg);

</script>

<template>
  <div>
    <!-- full‐screen spinner while loading -->
    <div class="loading-spinner" v-if="isLoading">
      <n-spin :show="isLoading"/>
    </div>

    <!-- actual chat UI once loaded -->
    <div v-else class="row chat-container">
      <div class="col-8 pe-0">
        <div class="chat-body-layout bordered-right">
          <RouterView/>
        </div>
      </div>

      <div class="col-4 ps-0 chat-info-layout">
        <ChatInfoComponent :chatAgg="chatAgg"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-body-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2.7rem);
  max-height: calc(100vh - 2.9rem);
  overflow: hidden;
}

.chat-info-layout {
  height: calc(100vh - 3.8rem);
  max-height: calc(100vh - 3.8rem);
  overflow: hidden;
}

.loading-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
