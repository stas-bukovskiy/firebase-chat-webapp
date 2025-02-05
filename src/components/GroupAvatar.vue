<script setup lang="ts">
import {computed, type PropType, ref} from "vue";
import {generateAvatarColors, generateDisplayName, generateInitials} from "@/utils/avatars.ts";
import type {ChatAggregate} from "@/services/entities.ts";
import {SIZE_CONFIGS} from "@/utils/avatar_config.ts";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
  size: {
    type: String,
    default: "default"
  }
});

const chatName = ref(props.chatAgg?.chat?.groupName);

const initials = computed(() => {
  return chatName.value ? generateInitials(chatName.value) : "";
});

const isAvatarUrl = computed(() => props.chatAgg?.chat?.groupImageUrl);

const avatarStyles = computed(() => {
  let colors = {bgColor: "var(--cs-avatar-default-bg-color)", textColor: "var(--cs-avatar-default-text-color)"};
  if (props.chatAgg?.chat && props.chatAgg?.chat.id) {
    colors = generateAvatarColors(props.chatAgg?.chat.id);
  }

  return {
    ...SIZE_CONFIGS.get(props.size).avatar,
    backgroundColor: colors.bgColor,
    color: colors.textColor,
  };
});

const avatarInitialsStyles = computed(() => {
  return {...SIZE_CONFIGS.get(props.size).avatarInitials};
});

</script>


<template>
  <div class="avatar-container" :style="avatarStyles">
    <img v-if="isAvatarUrl" :src="props.chatAgg?.chat?.groupImageUrl" :alt="chatName" class="avatar-image" :style="avatarStyles"/>
    <span v-else class="avatar-initials" :style="avatarInitialsStyles">{{ initials }}</span>
  </div>
</template>


<style scoped>
.avatar-container {
  position: relative;
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
  font-weight: bold;
}
</style>
