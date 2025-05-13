<script setup lang="ts">

import {useRoute} from "vue-router";
import {onMounted, onUnmounted, provide, ref, watch} from "vue";
import {useChatStore} from "@/stores/chats.ts";
import ChatInfoComponent from "@/components/ChatInfoComponent.vue";
import {INJECT_KEYS} from "@/utils/inject_keys.ts";
import {useChatNotification} from "@/hooks/useChatNotification.ts";
import {initializeMessageListener} from "@/services/NotificationService.ts";
import {subscribeToTokenRefresh, unsubscribeFromTokenRefresh} from "@/services/TokenRefreshService.ts";

const route = useRoute();
const chatStore = useChatStore();
const chatAgg = ref(chatStore.getChatByUserChatId(route.params.id));

watch(() => route.params, (params) => {
  chatAgg.value = chatStore.getChatByUserChatId(params.id);
});

provide(INJECT_KEYS.ChatAgg, chatAgg);


</script>

<template>
  <div class="row chat-container">
    <div class="col-8 pe-0">
      <!--Chat body-->
      <div class="chat-body-layout bordered-right">
        <RouterView/>
      </div>
    </div>

    <div class="col-4 ps-0 chat-info-layout">
      <ChatInfoComponent :chatAgg="chatAgg"/>
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
</style>