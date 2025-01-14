<script setup lang="ts">

import {computed, type PropType} from "vue";
import type {UserProfileEntity} from "@/services/entities.ts";
import UserAvatar from "@/components/UserAvatar.vue";
import {CARD_BADGE_COLORS} from "@/utils/avatar_badge.ts";
import {generateDisplayName} from "@/utils/avatars.ts";
import {Send24Regular} from "@vicons/fluent";

const props = defineProps({
  userProfile: Object as PropType<UserProfileEntity>,
});

const emit = defineEmits(["click"]);

const displayName = computed(() => {
  return generateDisplayName(props.userProfile);
});

</script>

<template>
  <n-card class="modal-card" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <div class="d-flex justify-content-between">
      <div class="d-flex align-items-center">
        <UserAvatar :userProfile="props.userProfile" :badgeBorderColors="CARD_BADGE_COLORS" size="big"/>
        <div class="ms-3 d-flex flex-column">
          <h3 class="mb-0">{{ displayName }}</h3>
          <h5 class="mb-0 text-muted">@{{ props.userProfile.username }}</h5>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <n-button type="primary" size="large" icon-placement="right" @click="emit('click')">
          <template #icon>
            <n-icon>
              <Send24Regular/>
            </n-icon>
          </template>
          Send Message
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.modal-card {
  max-width: 600px;
  margin-top: 15vh;
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
  max-height: 60vh;
  transition: max-height 3s ease-in-out;
}
</style>