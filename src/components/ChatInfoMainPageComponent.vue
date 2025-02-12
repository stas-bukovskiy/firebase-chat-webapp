<script setup lang="ts">
import {CARD_BADGE_COLORS} from "@/utils/avatar_config.ts";
import UserAvatar from "@/components/UserAvatar.vue";
import type {ChatAggregate} from "@/services/entities.ts";
import {computed, type PropType, ref} from "vue";
import {generateDisplayName} from "@/utils/avatars.ts";
import {
  Star24Filled,
  Star28Regular,
  TextBulletListSquareEdit20Regular,
  Delete24Regular,
  People20Regular,
  Image20Regular,
  Document20Regular,
  Link20Regular, Pin24Regular,
} from '@vicons/fluent';
import ChatInfoListItemComponent from "@/components/ChatInfoListItemComponent.vue";
import {useUserStore} from "@/stores/users.ts";
import {Pages} from "@/services/enums.ts";
import Avatar from "@/components/Avatar.vue";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import EditGroupModal from "@/components/EditGroupModal.vue";
import {httpsCallable} from "firebase/functions";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {db, functions} from "@/firebase";
import {useDialog} from 'naive-ui'
import {deleteDoc, doc} from "firebase/firestore";
import {useRouter} from "vue-router";

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

const currentStore = useCurrentUserStore();

const isAdmin = computed(() => {
  return currentStore.username === props.chatAgg?.chat?.createdBy?.id;
})


const usersStore = useUserStore();
const members = computed(() => {
  const membersIds = [props.chatAgg?.chat.createdBy.id, ...props.chatAgg?.chat?.members.map(member => member.id)];
  return membersIds.map(memberId => usersStore.fetchByUsername(memberId));
})

const handleStarClick = () => {
  // TODO
  console.log("Star clicked");
}


const router = useRouter();

const handlePinnedMessagesClick = () => {
  router.push({name: 'chat-pinned-messages', params: {id: props.chatAgg.chat.id}});
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

const showEditGroupModal = ref(false);
const handleEditGroupClick = () => {
  showEditGroupModal.value = true;
};

const notification = useNotification();
const dialog = useDialog()

const deleteUserChat = async () => {
  const userChatRef = doc(db, `userChats/${currentStore.username}/chats/${props.chatAgg.chat.id}`);
  await deleteDoc(userChatRef);
}

const handleDeleteGroupClick = async () => {
  const d = dialog.warning({
    title: `Are you sure you want to delete the group ${props.chatAgg?.chat?.groupName}?`,
    content: 'You will not be able to restore the group once deleted.',
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: () => {
      d.loading = true;
      return deleteUserChat()
          .catch(error => notifyError(notification, error))
          .finally(() => {
            d.loading = false
          });
    }
  })
}

const handleDeleteChatClick = async () => {
  const d = dialog.warning({
    title: `Are you sure you want to delete chat with ${displayName}?`,
    content: `If you delete this chat, you may lose all messages and shared media, if ${displayName} also deletes the chat.`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: () => {
      d.loading = true;
      return deleteUserChat()
          .catch(error => notifyError(notification, error))
          .finally(() => {
            d.loading = false
          });
    }
  })
}

const leaveGroup = httpsCallable(functions, 'leaveGroup');

const handleLeaveGroupClick = () => {
  const d = dialog.warning({
    title: `Are you sure you want to leave the group ${props.chatAgg?.chat?.groupName}?`,
    content: 'You will not be able to rejoin the group unless invited by an admin.',
    positiveText: 'Leave',
    negativeText: 'Cancel',
    onPositiveClick: () => {
      d.loading = true;
      return leaveGroup({chatId: props.chatAgg.chat.id})
          .catch(error => notifyError(notification, error))
          .finally(() => {
            d.loading = false
          });
    }
  })
}

</script>

<template>
  <div class="chat-info-container">

    <div class="d-flex align-items-center px-4 py-3 bordered-bottom">
      <Avatar :chatAgg="props.chatAgg" :badgeBorderColors="CARD_BADGE_COLORS" size="big" class="me-3"/>

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

  <div class="bordered-bottom py-2">
    <ChatInfoListItemComponent @click="handlePinnedMessagesClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Pin24Regular/>
        </n-icon>
      </template>
      Pinned messages
    </ChatInfoListItemComponent>
  </div>

  <div class="bordered-bottom py-2">
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

  <div class="bordered-bottom py-2" v-if="isGroup">
    <ChatInfoListItemComponent :is-clickable="false">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <People20Regular/>
        </n-icon>
      </template>
      Members
    </ChatInfoListItemComponent>

    <ChatInfoListItemComponent class="" v-for="member in members">
      <template #icon>
        <UserAvatar :userProfile="member.data" :badgeBorderColors="CARD_BADGE_COLORS" size="small" class="me-3"/>
      </template>
      {{ generateDisplayName(member.data) }}
    </ChatInfoListItemComponent>
  </div>

  <div class="bordered-bottom py-2" v-if="isAdmin">
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
  <div class="bordered-bottom py-2" v-else-if="isGroup">
    <ChatInfoListItemComponent @click="handleLeaveGroupClick">
      <template #icon>
        <n-icon size="28px" class="d-flex align-items-baseline me-3">
          <Delete24Regular/>
        </n-icon>
      </template>
      Leave group
    </ChatInfoListItemComponent>
  </div>
  <div class="bordered-bottom py-2" v-else>
    <ChatInfoListItemComponent @click="handleDeleteChatClick">
      <template #icon>
        <n-icon size="24px" class="d-flex align-items-baseline justify-content-center me-3">
          <Delete24Regular/>
        </n-icon>
      </template>
      Delete chat
    </ChatInfoListItemComponent>
  </div>

  <n-modal v-model:show="showEditGroupModal" :mask-closable="false">
    <EditGroupModal @onClose="showEditGroupModal = false" :groupChat="props.chatAgg.chat"/>
  </n-modal>
</template>

<style scoped>

</style>