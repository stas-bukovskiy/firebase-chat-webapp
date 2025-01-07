<script setup lang="ts">

import {useRoute} from "vue-router";
import {ref, watch} from "vue";
import {Star24Filled, Star28Regular, MoreHorizontal24Filled} from '@vicons/fluent';
import ChatComponent from "@/components/ChatComponent.vue";
import Avatar from "@/components/Avatar.vue";

const route = useRoute();
const chatUid = ref(route.params.id);

watch(() => route.params, (params) => {
  chatUid.value = params.id;
});

const chat = ref({
  uid: "1",
  displayName: "John Doe",
  username: "test.user.1",
  avatarKey: "test.user.1@mail.com",
  isOnline: true,
  unreadMessagesCount: 0,
  isStared: false
});

const avatar = ref({displayName: "Bill Gates", avatarKey: "test.user.3.mail.com", isOnline: false});

const handleStarClick = () => {
  chat.value.isStared = !chat.value.isStared;
  // TODO: Implement star/unstar logic
};

</script>

<template>
  <!--Chat header-->
  <div class="chat-header px-4 py-3 d-flex justify-content-between align-items-baseline">
    <div class="d-flex align-items-baseline gap-3">
      <Avatar :params="avatar"/>
      <h3 class="mb-0">{{ chat.displayName }}</h3>
    </div>
    <div class="">
      <n-button text style="font-size: 32px" class="me-3" @click="handleStarClick">
        <n-icon>
          <Star24Filled v-if="chat.isStared"/>
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
    <ChatComponent :uid="chatUid"/>
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
</style>