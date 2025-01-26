<script setup lang="ts">

import {CARD_BADGE_COLORS} from "@/utils/avatar_badge.ts";
import UserAvatar from "@/components/UserAvatar.vue";
import type {ChatAggregate} from "@/services/entities.ts";
import {computed, type PropType} from "vue";
import {generateDisplayName} from "@/utils/avatars.ts";
import {
  Star24Filled,
  Star28Regular,
  TextBulletListSquareEdit20Regular,
  Delete24Regular,
  People20Regular,
  PeopleAdd20Regular,
  Image20Regular,
  Document20Regular,
  Link20Regular,
} from '@vicons/fluent';
import ChatInfoListItemComponent from "@/components/ChatInfoListItemComponent.vue";
import {useUserStore} from "@/stores/users.ts";
import {Pages} from "@/services/enums.ts";

const props = defineProps({
  chatAgg: Object as PropType<ChatAggregate>
})

const emit = defineEmits(["navigateTo"]);

const isGroup = computed(() => {
  return props.chatAgg?.chat?.isGroup;
});

const displayName = computed(() => {
  if (isGroup.value) {
    return props.chatAgg?.chat?.groupName;
  }
  return generateDisplayName(props.chatAgg?.otherUserProfile);
});

const isAdmin = computed(() => {
  // TODO
  return false;
})


const usersStore = useUserStore();
const members = computed(() => {
  return usersStore.getUsers;
})

const handleStarClick = () => {
  // TODO
  console.log("Star clicked");
}

const handleMediaClick = () => {
  emit("navigateTo", Pages.MEDIA);
}

const handleFilesClick = () => {
  emit("navigateTo", Pages.FILES);
}

const handleLinksClick = () => {
  emit("navigateTo", Pages.LINKS);
}

const handleAddMembersClick = () => {
  console.log("Add members clicked");
}

const handleEditGroupClick = () => {
  console.log("Edit group info");
}

const handleDeleteGroupClick = () => {
  console.log("Delete group");
}

const handleLeaveGroupClick = () => {
  console.log("Leave group");
}

const handleDeleteChatClick = () => {
  console.log("Delete chat");
}

</script>

<template>
  <div class="chat-info-container">

    <div class="d-flex align-items-center px-4 py-3 bottom-bordered">
      <UserAvatar :userProfile="props.chatAgg?.otherUserProfile" :badgeBorderColors="CARD_BADGE_COLORS" size="big"
                  class="me-3"/>

      <div class="row m-0 p-0" style="width: 100%">
        <div class="col-9 m-0 p-0 d-flex flex-column justify-content-center chat-info-text">
          <h4 class="mb-0">{{ displayName }}</h4>
          <h5 v-if="!isGroup" class="mb-0 text-muted">@{{ props.chatAgg?.otherUserProfile?.username }}</h5>
        </div>

        <div class="col-3 m-0 p-0 d-flex justify-content-end align-items-center">
          <n-button text style="font-size: 32px" @click="handleStarClick">
            <n-icon>
              <Star24Filled v-if="chatAgg.userChat.isStared"/>
              <Star28Regular v-else/>
            </n-icon>
          </n-button>
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-bordered py-2">
    <ChatInfoListItemComponent @click="handleMediaClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Image20Regular/>
        </n-icon>
      </template>
      Media
    </ChatInfoListItemComponent>
    <ChatInfoListItemComponent @click="handleFilesClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Document20Regular/>
        </n-icon>
      </template>
      Files
    </ChatInfoListItemComponent>
    <ChatInfoListItemComponent @click="handleLinksClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Link20Regular/>
        </n-icon>
      </template>
      Links
    </ChatInfoListItemComponent>
  </div>

  <div class="bottom-bordered py-2" v-if="isGroup">
    <ChatInfoListItemComponent :is-clickable="false">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <People20Regular/>
        </n-icon>
      </template>
      Members

      <template #right-section v-if="isAdmin">
        <n-button text @click="handleAddMembersClick">
          <n-icon size="28px" class="d-flex align-items-baseline">
            <PeopleAdd20Regular/>
          </n-icon>
        </n-button>
      </template>
    </ChatInfoListItemComponent>

    <ChatInfoListItemComponent class="" v-for="member in members">
      <template #icon>
        <UserAvatar :userProfile="member.data" :badgeBorderColors="CARD_BADGE_COLORS" size="small" class="me-2"/>
      </template>
      {{ generateDisplayName(member.data) }}
    </ChatInfoListItemComponent>
  </div>

  <div class="bottom-bordered py-2" v-if="isAdmin">
    <ChatInfoListItemComponent @click="handleEditGroupClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <TextBulletListSquareEdit20Regular/>
        </n-icon>
      </template>
      Edit group
    </ChatInfoListItemComponent>

    <ChatInfoListItemComponent @click="handleDeleteGroupClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Delete24Regular/>
        </n-icon>
      </template>
      Delete group
    </ChatInfoListItemComponent>
  </div>
  <div class="bottom-bordered py-2" v-else-if="isGroup">
    <ChatInfoListItemComponent @click="handleLeaveGroupClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Delete24Regular/>
        </n-icon>
      </template>
      Leave group
    </ChatInfoListItemComponent>
  </div>
  <div class="bottom-bordered py-2" v-else>
    <ChatInfoListItemComponent @click="handleDeleteChatClick">
      <template #icon>
        <n-icon size="24px" class="d-flex align-items-baseline justify-content-center me-3">
          <Delete24Regular/>
        </n-icon>
      </template>
      Delete chat
    </ChatInfoListItemComponent>
  </div>
</template>

<style scoped>

</style>