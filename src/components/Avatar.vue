<script setup lang="ts">

import UserAvatar from "@/components/UserAvatar.vue";
import GroupAvatar from "@/components/GroupAvatar.vue";
import type {AvatarBadgeBorderColors} from "@/utils/avatar_badge.ts";
import {computed, type PropType} from "vue";
import type {ChatAggregate} from "@/services/entities.ts";


const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>,
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

const isGroup = computed(() => {
  return props.chatAgg?.chat?.isGroup;
});

</script>

<template>
  <GroupAvatar v-if="isGroup" :chatAgg="props.chatAgg"/>
  <UserAvatar v-else :userProfile="props.chatAgg.otherUserProfile" :isCurrent="props.isCurrent"
              :size="props.size"
              :badgeBorderColors="props.badgeBorderColors"/>
</template>

<style scoped>

</style>