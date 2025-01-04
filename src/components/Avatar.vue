<script setup lang="ts">
import {computed} from "vue";
import {generateAvatarColors, generateInitials} from "@/utils/avatars.ts";

const props = defineProps({
  displayName: String,
  avatarUrl: {
    type: String | null,
    default: null
  },
  avatarKey: String,
  isOnline: Boolean,
  isCurrent: {
    type: Boolean,
    default: false
  }
});

const initials = computed(() => {
  return props.displayName ? generateInitials(props.displayName) : "";
});

const colors = computed(() => {
  return props.avatarKey
      ? generateAvatarColors(props.avatarKey)
      : {bgColor: "#63e2b7", textColor: "#000"};
});

const badgeColor = computed(() => {
  return props.isOnline ? "#4CAF50" : "#393939";
});

const isAvatarUrl = computed(() => props.avatarUrl !== null)

const badgeBorderColor = computed(() => {
  return props.isCurrent ? "#293632" : "#212529";
});
</script>


<template>
  <div
      class="avatar-container"
      :style="{ backgroundColor: colors.bgColor, color: colors.textColor }"
  >
    <div class="status-badge" :style="{ backgroundColor: badgeColor, borderColor: badgeBorderColor }"></div>
    <img v-if="isAvatarUrl" :src="avatarUrl" :alt="displayName" class="avatar-image"/>
    <span v-else class="avatar-initials">{{ initials }}</span>
  </div>
</template>


<style scoped>
.avatar-container {
  position: relative;
  width: 50px;
  height: 50px;
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
  border: 4px solid #212529;
  box-sizing: content-box;
  transition: border-color 0.3s ease;
}
</style>
