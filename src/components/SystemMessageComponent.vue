<script setup lang="ts">
import {computed, type PropType} from "vue";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";
import {generateDisplayName} from "@/utils/avatars.ts";

enum SYSTEM_MESSAGE {
  GROUP_CREATED = "group_created",
  GROUP_RENAMED = "group_renamed",
  GROUP_IMAGE_UPDATED = "group_image_updated",
  GROUP_MEMBER_ADDED = "group_member_added",
  GROUP_MEMBER_REMOVED = "group_member_removed",
  GROUP_MEMBER_LEFT = "group_member_left",
}

const props = defineProps({
  chatId: String,
  type: SYSTEM_MESSAGE,
  data: Object as PropType<any>,
});

const currentUserStore = useCurrentUserStore();
const userStore = useUserStore();

const messageText = computed(() => {
  switch (props.type) {
    case SYSTEM_MESSAGE.GROUP_CREATED:
      return `The group <b>${props.data.groupName}</b> has been created`;
    case SYSTEM_MESSAGE.GROUP_MEMBER_ADDED:
      if (props.data.newMemberId === currentUserStore.username) {
        return `<b>You</b> have been added to the group`;
      } else {
        const user = userStore.fetchByUsername(props.data.newMemberId);
        return `<b>${generateDisplayName(user?.data)}</b> has been added to the group`;
      }
    case SYSTEM_MESSAGE.GROUP_MEMBER_REMOVED:
      if (props.data.removedMemberId === currentUserStore.username) {
        return `<b>You</b> have been removed from the group`;
      } else {
        const user = userStore.fetchByUsername(props.data.removedMemberId);
        return `<b>${generateDisplayName(user?.data)}</b> has been removed from the group`;
      }
    case SYSTEM_MESSAGE.GROUP_RENAMED:
      return `The group has been renamed to <b>${props.data.newGroupName}</b>`;
    case SYSTEM_MESSAGE.GROUP_IMAGE_UPDATED:
      return `The group image has been updated`;
    case SYSTEM_MESSAGE.GROUP_MEMBER_LEFT:
      if (props.data.leftMemberId === currentUserStore.username) {
        return `<b>You</b> have left the group`;
      } else {
        const user = userStore.fetchByUsername(props.data.leftMemberId);
        return `<b>${generateDisplayName(user?.data)}</b> has left the group`;
      }
    default:
      console.error(`Unknown system message type: ${props.type}`);
      return "";
  }
});
</script>

<template>
  <div class="w-100 d-flex justify-content-center">
    <div class="message px-3 py-2" v-html="messageText"></div>
  </div>
</template>

<style scoped>
.message {
  background-color: var(--cs-sub-card-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 0.8rem;
}
</style>