<script setup lang="ts">
import {computed, type PropType} from "vue";
import {generateAvatarColors, generateDisplayName, generateInitials} from "@/utils/avatars.ts";
import type {ChatAggregate} from "@/services/entities.ts";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
});

const displayName = computed(() => {
  const chatName = props.chatAgg?.chat?.groupName;
  return chatName ? generateDisplayName(chatName) : "";
});

const initials = computed(() => {
  const chatName = props.chatAgg?.chat?.groupName;
  return chatName ? generateInitials(chatName) : "";
});

const colors = computed(() => {
  if (!props.chatAgg.userChat.chat || !props.chatAgg.userChat.chat.id) {
    return {bgColor: "var(--cs-avatar-default-bg-color)", textColor: "var(--cs-avatar-default-text-color)"};
  }

  return generateAvatarColors(props.chatAgg.userChat.chat.id);
});

const isAvatarUrl = computed(() => props.chatAgg?.chat?.photoUrl);
</script>


<template>
  <div class="avatar-container" :style="{ backgroundColor: colors.bgColor, color: colors.textColor }">
    <img v-if="isAvatarUrl" :src="props.userProfile.photoUrl" :alt="displayName" class="avatar-image"/>
    <span v-else class="avatar-initials">{{ initials }}</span>
  </div>
</template>


<style scoped>
.avatar-container {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1.4em;
  font-weight: bold;
}
</style>
