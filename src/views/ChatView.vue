<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, ref, watch} from "vue";
import {Star24Filled, Star28Regular, MoreHorizontal24Filled} from '@vicons/fluent';
import Avatar from "@/components/Avatar.vue";
import ChatComponent from "@/components/ChatComponent.vue";
import {useChatStore} from "@/stores/chats.ts";
import {CARD_BADGE_COLORS} from "@/utils/avatar_badge.ts";
import {generateDisplayName} from "@/utils/avatars.ts";

const route = useRoute();
const chatStore = useChatStore();
const chatAgg = ref(chatStore.getChatByUserChatId(route.params.id));

watch(() => route.params, (params) => {
  chatAgg.value = chatStore.getChatByUserChatId(params.id);
});

const handleStarClick = () => {
  // chat.value.isStared = !chat.value.isStared;
  // TODO: Implement star/unstar logic
};

const displayName = computed(() => {
  return chatAgg.value?.chat?.isGroup ?
      chatAgg.value?.chat?.groupName :
      generateDisplayName(chatAgg.value?.otherUserProfile);
});

const isGroup = computed(() => {
  return chatAgg.value.chat?.isGroup;
});

</script>

<template>
  <!--Chat header-->
  <div class="chat-header px-4 py-3 d-flex justify-content-between align-items-baseline">
    <div class="d-flex align-items-center">
      <Avatar :chatAgg="chatAgg" :badgeBorderColors="CARD_BADGE_COLORS"/>
      <div class="ms-3">
        <h5 class="mb-0">{{ displayName }}</h5>
        <p v-if="!isGroup" class="mb-0 text-muted">@{{ chatAgg?.otherUserProfile?.username }}</p>
      </div>
    </div>
    <div class="">
      <n-button text style="font-size: 32px" class="me-3" @click="handleStarClick">
        <n-icon>
          <Star24Filled v-if="chatAgg.userChat.isStared"/>
          <Star28Regular v-else/>
        </n-icon>
      </n-button>
      <n-button text style="font-size: 32px">
        <n-icon>
          <!--TODO: think about what we can do with chat or delete this dropdown-->
          <MoreHorizontal24Filled/>
        </n-icon>
      </n-button>
    </div>
  </div>

  <!--Chat body-->
  <div class="chat-body-layout">
    <ChatComponent :chatId="chatAgg?.chat?.id"/>
  </div>
</template>

<style scoped>
.chat-header {
  border-bottom: 2px solid #333;
}

.chat-body-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - (2 * 48px + 2.4rem));
}

.chat-username {
  border-left: 2px solid var(--cs-sub-card-bg-color);
  padding-left: 10px;
  margin-left: 10px;
  line-height: 1.2;
}
</style>