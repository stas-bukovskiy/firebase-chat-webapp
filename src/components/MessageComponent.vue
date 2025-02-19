<script setup lang="ts">
import {computed, type PropType} from "vue";
import {formatUtcTimestamp} from "../utils/datetime.ts";
import {Checkmark24Filled, Delete24Regular, Pin24Regular, PinOff24Regular} from "@vicons/fluent";
import type {MessageEntity} from "@/services/entities.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";
import AttachmentComponent from "@/components/AttachmentComponent.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import {togglePinnedMessage} from "@/services/PinnedMessageService.ts";
import {reformatLinks} from "@/utils/links.ts";

const props = defineProps({
  chatId: String,
  message: Object as PropType<MessageEntity>,
  attachmentsUrl: Array as PropType<string[]>,
  isRead: Boolean,
  isStacked: Boolean,
});

const currentUserStore = useCurrentUserStore();
const usersStore = useUserStore();

const fromCurrentUser = computed(() => props.message?.fromUser?.id === currentUserStore.currentUser.username);

const userProfile = computed(() => {
  if (fromCurrentUser.value) {
    return currentUserStore.currentUser;
  }

  return usersStore.fetchByUsername(props.message.fromUser.id)?.data;
});

const handlePinToggleClick = async () => {
  await togglePinnedMessage(props.chatId, props.message);
}

</script>

<template>
  <n-tooltip trigger="click" :show-arrow="false">
    <template #trigger>
      <div class="message-container">
        <div class="message d-flex justify-content-between"
             :style="!props.isStacked ? {paddingBottom: 'calc(0.1rem + 25px)', marginBottom: 'calc(1rem + 25px)'} : {}">
          <div class="message-text d-flex flex-column"
               :style="props.isStacked ? {padding: '1rem 1rem 0.5rem'} : {padding: '1rem'}">
            <div v-if="props.attachmentsUrl.length" class="d-flex flex-wrap gap-2 mb-2">
              <AttachmentComponent v-for="(url, index) in props.attachmentsUrl" :key="index" :chatId="props.chatId"
                                   :fileUrl="url"/>
            </div>

            <span class="message-text" v-html="reformatLinks(props.message.text)"></span>

            <div v-if="fromCurrentUser" :class="props.isStacked ? 'mt-2' : 'message-status-absolute'">
              <div>
                <n-icon :color="props.isRead ? 'var(--cs-primary-color)' : 'var(--cs-text-color)'"
                        size="large">
                  <Checkmark24Filled/>
                </n-icon>
              </div>
            </div>
          </div>
          <div class="message-time text-muted text-end">
            {{ formatUtcTimestamp(props.message.createdAt) }}
          </div>
        </div>

        <div v-if="!props.isStacked" class="message-sender"
             :style="fromCurrentUser ? {right: '30px'} : {left: '30px'}">
          <UserAvatar :userProfile="userProfile" :isCurrent='false'/>
        </div>
      </div>
    </template>

    <n-button text @click="handlePinToggleClick">
      <n-icon size="24px" class="d-flex align-items-baseline justify-content-center me-2">
        <Pin24Regular v-if="!message.isPinned"/>
        <PinOff24Regular v-else/>
      </n-icon>
    </n-button>
    <n-button text>
      <n-icon size="24px" class="d-flex align-items-baseline justify-content-center">
        <Delete24Regular/>
      </n-icon>
    </n-button>
  </n-tooltip>
</template>

<style scoped>
.message-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

.message-text {
  max-width: 95%;
}

.message-time {
  font-size: 0.9rem;
  padding: 0.5rem 0.6rem 0 0;
}

.message {
  background-color: var(--cs-sub-card-bg-color);
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 0.8rem;
}

.message:hover {
  background-color: var(--cs-sub-card-bg-color-hover);
}

.message-sender {
  position: absolute;
  z-index: 2;
  bottom: -20px;
}

.message-status-absolute {
  position: absolute;
  z-index: 2;
  left: 1rem;
  bottom: 0.5rem;
}

</style>