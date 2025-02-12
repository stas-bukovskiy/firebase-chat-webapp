<script setup lang="ts">
import {inject} from "vue";
import {INJECT_KEYS} from "@/utils/inject_keys.ts";
import ChatComponent from "@/components/ChatComponent.vue";

const chatAgg = inject(INJECT_KEYS.ChatAgg);
</script>

<template>
  <ChatComponent :chatAgg="chatAgg"/>
</template>