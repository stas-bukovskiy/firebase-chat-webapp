<script setup lang="ts">

import {useChatStore} from "@/stores/chats.ts";
import {computed} from "vue";

const chatStore = useChatStore()
const chatsCount = computed(() => chatStore.getChatsCount)

</script>

<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 100%">
      <div v-if="chatsCount" class="badge-default fs-6">
        Select a chat to start messaging!
      </div>
      <div v-else class="badge-default fs-6">
        Start searching for a chat to start messaging.
      </div>
  </div>
</template>

<style scoped>

</style>