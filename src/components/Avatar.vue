<script setup lang="ts">
import {computed, type PropType} from "vue";
import {generateAvatarColors, generateInitials} from "@/utils/avatars.ts";
import type {AvatarParamsInterface} from "@/services/interfaces.ts";


const props = defineProps({
  params: {
    type: Object as PropType<AvatarParamsInterface>,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
});

const initials = computed(() => {
  return props.params.displayName ? generateInitials(props.params.displayName) : "";
});

const colors = computed(() => {
  return props.params.avatarKey
      ? generateAvatarColors(props.params.avatarKey)
      : {bgColor: "var(--cs-avatar-default-bg-color)", textColor: "var(--cs-avatar-default-text-color)"};
});

const badgeColor = computed(() => {
  return props.params.isOnline ? "var(--cs-badge-online-bg-color)" : "var(--cs-badge-offline-bg-color)";
});

const isAvatarUrl = computed(() => props.params.avatarUrl);

const badgeBorderColor = computed(() => {
  return props.isCurrent ? "var(--cs-badge-current-bg-color)" : "var(--cs-badge-default-bg-color)";
});
</script>


<template>
  <div class="avatar-container"
       :style="{ backgroundColor: colors.bgColor, color: colors.textColor }">
    <div class="status-badge" :style="{ backgroundColor: badgeColor, borderColor: badgeBorderColor }"></div>
    <img v-if="isAvatarUrl" :src="props.params.avatarUrl" :alt="props.params.displayName" class="avatar-image"/>
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

.status-badge {
  position: absolute;
  top: -4px;
  left: 38px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 4px solid var(--cs-badge-default-bg-color);
  box-sizing: content-box;
  transition: border-color 0.3s ease;
}
</style>
