<script setup lang="ts">

import {computed, type PropType, ref} from "vue";
import {generateDisplayName} from "@/utils/avatars.ts";
import type {ChatAggregate} from "@/services/entities.ts";
import UserAvatar from "@/components/UserAvatar.vue";
import GroupAvatar from "@/components/GroupAvatar.vue";
import type {AvatarBadgeBorderColors} from "@/utils/avatar_badge.ts";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
  badgeBorderColors: Object as PropType<AvatarBadgeBorderColors>,
  isCurrent: {
    type: Boolean,
    default: false
  }
});

console.log(props.chatAgg);

const emits = defineEmits(["click"]);

const isHover = ref(props.isCurrent);

const handleClick = () => {
  emits("click", props.chat.id);
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
      <GroupAvatar v-if="isGroup" :chatAgg="props.chatAgg"/>
      <UserAvatar v-else :userProfile="props.chatAgg.otherUserProfile" :isCurrent="isHover || props.isCurrent"
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
