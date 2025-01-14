<script setup lang="ts">
import {computed, type PropType} from "vue";
import {generateAvatarColors, generateDisplayName, generateInitials} from "@/utils/avatars.ts";
import type {UserProfileEntity} from "@/services/entities.ts";
import type {AvatarBadgeBorderColors} from "@/utils/avatar_badge.ts";

const props = defineProps({
  userProfile: Object as PropType<UserProfileEntity>,
  badgeBorderColors: Object as PropType<AvatarBadgeBorderColors>,
  isCurrent: Boolean,
});

const initials = computed(() => {
  const displayName = generateDisplayName(props.userProfile);
  return displayName ? generateInitials(displayName) : "";
});

const displayName = computed(() => {
  return generateDisplayName(props.userProfile);
});

const colors = computed(() => {
  if (!props.userProfile || !props.userProfile.username) {
    return {bgColor: "var(--cs-avatar-default-bg-color)", textColor: "var(--cs-avatar-default-text-color)"};
  }
  return generateAvatarColors(props.userProfile.username);
});

const badgeColor = computed(() => {
  return props.userProfile?.isOnline ? "var(--cs-badge-online-bg-color)" : "var(--cs-badge-offline-bg-color)";
});

const isAvatarUrl = computed(() => props.userProfile?.photoUrl);

const badgeBorderColor = computed(() => {
  return props.isCurrent ? props.badgeBorderColors.hoverColor : props.badgeBorderColors.color;
});
</script>


<template>
  <div class="avatar-container"
       :style="{ backgroundColor: colors.bgColor, color: colors.textColor }">
    <div class="status-badge" :style="{ backgroundColor: badgeColor, borderColor: badgeBorderColor }"></div>
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

.status-badge {
  position: absolute;
  top: -4px;
  left: 34px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 4px solid var(--cs-badge-default-bg-color);
  box-sizing: content-box;
  transition: border-color 0.3s ease;
}
</style>
