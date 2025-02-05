<script setup lang="ts">
import {computed, type PropType} from "vue";
import {generateAvatarColors, generateDisplayName, generateInitials} from "@/utils/avatars.ts";
import type {UserProfileEntity} from "@/services/entities.ts";
import {type AvatarBadgeBorderColors, DEFAULT_BADGE_COLORS, SIZE_CONFIGS} from "@/utils/avatar_config.ts";

const props = defineProps({
  userProfile: Object as PropType<UserProfileEntity>,
  badgeBorderColors: {
    type: Object as PropType<AvatarBadgeBorderColors>,
    default: DEFAULT_BADGE_COLORS,
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "default"
  }
});

const initials = computed(() => {
  const displayName = generateDisplayName(props.userProfile);
  return displayName ? generateInitials(displayName) : "";
});

const displayName = computed(() => {
  return generateDisplayName(props.userProfile);
});

const isAvatarUrl = computed(() => props.userProfile?.photoUrl);

const avatarStyles = computed(() => {
  let colors = {bgColor: "var(--cs-avatar-default-bg-color)", textColor: "var(--cs-avatar-default-text-color)"};
  if (props.userProfile && props.userProfile.uid) {
    colors = generateAvatarColors(props.userProfile.uid);
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

const badgeStyles = computed(() => {
  return {
    ...SIZE_CONFIGS.get(props.size).badge,
    backgroundColor: props.userProfile?.isOnline ? "var(--cs-badge-online-bg-color)" : "var(--cs-badge-offline-bg-color)",
    borderColor: props.isCurrent ? props.badgeBorderColors.hoverColor : props.badgeBorderColors.color,
  };
});

</script>


<template>
  <div class="avatar-container" :style="avatarStyles">
    <div class="status-badge" :style="badgeStyles"></div>
    <img v-if="isAvatarUrl" :src="props.userProfile.photoUrl" :alt="displayName" class="avatar-image"/>
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

.status-badge {
  position: absolute;
  border-radius: 50%;
  box-sizing: content-box;
  transition: border-color 0.3s ease;
}
</style>
