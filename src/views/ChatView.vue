<script setup lang="ts">

import {useRoute} from "vue-router";
import {ref, watch} from "vue";
import ChatComponent from "@/components/ChatComponent.vue";
import {useChatStore} from "@/stores/chats.ts";
import ChatInfoComponent from "@/components/ChatInfoComponent.vue";


const route = useRoute();
const chatStore = useChatStore();
const chatAgg = ref(chatStore.getChatByUserChatId(route.params.id));

watch(() => route.params, (params) => {
  chatAgg.value = chatStore.getChatByUserChatId(params.id);
});

</script>

<template>
  <div class="row chat-container">
    <div class="col-8 pe-0">
      <!--Chat body-->
      <div class="chat-body-layout">
        <ChatComponent :chatId="chatAgg?.chat?.id"/>
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
  height: calc(100vh - 2.8rem);
  max-height: calc(100vh - 2.8rem);
  overflow: hidden;

  border-right: 2px solid #333;
}

.chat-info-layout {
  height: calc(100vh - 3.8rem);
  max-height: calc(100vh - 3.8rem);
  overflow: hidden;
}
</style>