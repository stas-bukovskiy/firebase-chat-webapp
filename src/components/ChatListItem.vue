<script setup lang="ts">

import {computed, onMounted, type PropType, ref} from "vue";
import {generateDisplayName} from "@/utils/avatars.ts";
import type {ChatAggregate} from "@/services/entities.ts";
import type {AvatarBadgeBorderColors} from "@/utils/avatar_config.ts";
import Avatar from "@/components/Avatar.vue";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
  badgeBorderColors: Object as PropType<AvatarBadgeBorderColors>,
  isCurrent: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["click", "clickUserProfile"]);

const isHover = ref(props.isCurrent);

const handleClick = () => {
  if (props.chatAgg?.userChat) {
    emits("click", props.chatAgg.userChat.id);
  } else if (props.chatAgg.otherUserProfile) {
    emits("clickUserProfile", props.chatAgg.otherUserProfile.id);
  }
};

const displayName = computed(() => {
  return props.chatAgg?.chat?.isGroup ?
      props.chatAgg?.chat?.groupName :
      generateDisplayName(props.chatAgg?.otherUserProfile);
});

const isGroup = computed(() => {
  return props.chatAgg?.chat?.isGroup;
});

</script>

<template>
  <div class="chat-item d-flex w-100 align-items-center" @mouseover="isHover = true" @mouseleave="isHover = false"
       @click="handleClick" :style="{ backgroundColor: isHover || props.isCurrent ? '#293632' : '' }">
    <div>
      <Avatar :chatAgg="props.chatAgg" :isCurrent="isHover || props.isCurrent"
              :badgeBorderColors="props.badgeBorderColors"/>
    </div>
    <div class="ms-3 d-flex align-items-center justify-content-between" style="width: 100%">
      <div class="">
        <h5 class="mb-0">{{ displayName }}</h5>
        <p v-if="!isGroup" class="mb-0 text-muted">@{{ props.chatAgg?.otherUserProfile?.username }}</p>
      </div>
      <n-badge :value="props.chatAgg.userChat?.unreadCount" :max="15"/>
    </div>
  </div>
</template>

<style scoped>
.chat-item {
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #293632;
}
</style>
