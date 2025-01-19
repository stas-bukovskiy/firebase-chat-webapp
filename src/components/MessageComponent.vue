<script setup lang="ts">
import {computed, type PropType} from "vue";
import Avatar from "@/components/UserAvatar.vue";
import {formatUtcTimestamp} from "../utils/datetime.ts";
import {Checkmark20Filled} from "@vicons/fluent";
import type {MessageEntity} from "@/services/entities.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useUserStore} from "@/stores/users.ts";
import {SUB_CARD_BADGE_COLORS} from "@/utils/avatar_badge.ts";

const props = defineProps({
  message: Object as PropType<MessageEntity>,
  isStacked: Boolean,
});

console.log("MessageComp", props.message);

const currentUserStore = useCurrentUserStore();
const usersStore = useUserStore();

const fromCurrentUser = computed(() => props.message?.fromUser?.id === currentUserStore.currentUser.username);

const userProfile = computed(() => {
  if (fromCurrentUser.value) {
    return currentUserStore.currentUser;
  }

  return usersStore.fetchByUsername(props.message.fromUser.id);
});

</script>

<template>
  <div class="message-container">
    <div class="message d-flex justify-content-between"
         :style="!props.isStacked ? {paddingBottom: 'calc(0.1rem + 25px)', marginBottom: 'calc(1rem + 25px)'} : {}">
      <div class="message-text d-flex flex-column"
           :style="props.isStacked ? {padding: '1rem 1rem 0.5rem'} : {padding: '1rem'}">
        <span>{{ props.message.text }}</span>

        <div v-if="fromCurrentUser" :class="props.isStacked ? 'mt-2' : 'message-status-absolute'">
          <div v-if="message.status === 'sending'" class="spinner-border spinner-border-sm"
               style="color: var(--cs-primary-color)"/>
          <div v-else>
            <n-icon :color="message.status === 'read' ? 'var(--cs-primary-color)' : 'var(--cs-text-color)'"
                    size="large">
              <Checkmark20Filled/>
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
      <Avatar :userProfile="userProfile" :badgeBorderColors="SUB_CARD_BADGE_COLORS"/>
    </div>
  </div>
</template>

<style scoped>
.message-container {
  position: relative;
}

.message-time {
  font-size: 0.9rem;
  padding: 0.5rem 0.6rem 0 0;
}

.message {
  background-color: var(--cs-sub-card-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 0.8rem;
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