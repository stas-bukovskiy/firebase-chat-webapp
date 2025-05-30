<script setup lang="ts">
import UserAvatar from "@/components/UserAvatar.vue";
import {computed, ref, onMounted} from "vue";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {generateDisplayName} from "@/utils/avatars.ts";
import {LogOutRound, SettingsOutlined} from "@vicons/material";
import {signOut} from "firebase/auth";
import {auth} from "@/firebase";
import {useRouter} from "vue-router";
import ProfileSettingsModal from "@/components/ProfileSettingsModal.vue";
import {unsubscribe} from "@/services/NotificationService.ts";
import {unsubscribeFromTokenRefresh} from "@/services/TokenRefreshService.ts";

const currentUserStore = useCurrentUserStore();
const currentUserProfile = currentUserStore.user

onMounted(async() => {
  if (!currentUserProfile.firstName) {
    await currentUserStore.fetchUserByEmail(currentUserStore.email)
  }
  console.log('currentUserProfile', currentUserProfile)
});

const displayName = computed(() => generateDisplayName(currentUserProfile))

const showProfileSettingsModal = ref(false);
const handleSettingClick = () => {
  showProfileSettingsModal.value = true;
};

const router = useRouter();
const handleLogoutClick = async () => {
  await unsubscribe()
  await unsubscribeFromTokenRefresh()
  await router.push({name: 'login'})
  await signOut(auth)
};

</script>


<template>
  <div class="header-container mt-3 p-3 d-flex align-items-center justify-content-between w-100 rounded-4">
    <div class="d-flex align-items-center">
      <UserAvatar :user-profile="currentUserProfile" size="big"/>
      <div class="ms-3">
        <h4 class="mb-1">{{ displayName }}</h4>
        <h6 class="text-muted">@{{ currentUserStore.username }}</h6>
      </div>
    </div>

    <div class="d-flex flex-column">
      <n-button text @click="handleSettingClick" class="mb-2">
        <n-icon size="1.6rem">
          <SettingsOutlined/>
        </n-icon>
      </n-button>

      <n-button text @click="handleLogoutClick">
        <n-icon size="1.6rem">
          <LogOutRound/>
        </n-icon>
      </n-button>
    </div>

    <n-modal v-model:show="showProfileSettingsModal" :mask-closable="false">
      <ProfileSettingsModal @onClose="showProfileSettingsModal = false"/>
    </n-modal>
  </div>
</template>

<style scoped>
.header-container {
  background-color: var(--cs-card-bg-color);
}
</style>