<script setup lang="ts">
import {computed, type PropType} from "vue";
import {generateAvatarColors, generateDisplayName, generateInitials} from "@/utils/avatars.ts";
import type {UserProfileEntity} from "@/services/entities.ts";
import type {AvatarBadgeBorderColors} from "@/utils/avatar_badge.ts";

const sizeConfigs = new Map([
  ["default", {
    avatar: {
      width: "46px",
      height: "46px",
      borderRadius: "8px"
    },
    avatarInitials: {
      fontSize: "1.4em"
    },
    badge: {
      top: "-4px",
      left: "34px",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      border: "4px solid var(--cs-badge-default-bg-color)",
    }
  }],
  ["big", {
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "14px"
    },
    avatarInitials: {
      fontSize: "2.4em"
    },
    badge: {
      top: "-4px",
      left: "65px",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      border: "5px solid var(--cs-badge-default-bg-color)",
    }
  }],
]);


const props = defineProps({
  userProfile: Object as PropType<UserProfileEntity>,
  badgeBorderColors: Object as PropType<AvatarBadgeBorderColors>,
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
  if (props.userProfile && props.userProfile.username) {
    colors = generateAvatarColors(props.userProfile.username);
  }

  return {
    ...sizeConfigs.get(props.size).avatar,
    backgroundColor: colors.bgColor,
    color: colors.textColor,
  };
});

const avatarInitialsStyles = computed(() => {
  return {...sizeConfigs.get(props.size).avatarInitials};
});

const badgeStyles = computed(() => {
  return {
    ...sizeConfigs.get(props.size).badge,
    backgroundColor: props.userProfile?.isOnline ? "var(--cs-badge-online-bg-color)" : "var(--cs-badge-offline-bg-color)",
    borderColor: props.isCurrent ? props.badgeBorderColors.hoverColor : props.badgeBorderColors.color,
  };
});

</script>


<template>
  <div class="avatar-container"
       :style="avatarStyles">
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
