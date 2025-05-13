<script lang="ts" setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {requestPermissionAndGetToken, unsubscribe} from '@/services/NotificationService'

const permission = ref<NotificationPermission>(Notification.permission)
const shouldShow = computed(() => permission.value !== 'granted')


async function requestNotifications() {
  const token = await requestPermissionAndGetToken()
  // update local ref from the browser
  permission.value = Notification.permission
  if (token) {
    console.log('FCM Token retrieved:', token)
  }
}

onMounted(async () => {
  // Sync with Permissions API so manual setting in browser also updates us
  if ('permissions' in navigator) {
    const status = await (navigator as any).permissions.query({name: 'notifications'})
    permission.value = status.state as NotificationPermission
    status.onchange = () => {
      permission.value = status.state as NotificationPermission
    }
  }
  // If already granted on mount, fetch token immediately
  if (permission.value === 'granted') {
    const token = await requestPermissionAndGetToken()
    console.log('FCM Token retrieved:', token)
  }
})

onUnmounted(async () => {
  await unsubscribe()
})
</script>

<template>
  <transition name="fade">
    <div v-if="shouldShow" class="notification-prompt-container px-4 py-3 rounded-4">
      <div class="notification-prompt-content">
        <p class="mb-0">Please enable notifications to receive alerts about new messages.</p>
        <n-button size="large" type="primary" @click="requestNotifications">
          Enable notifications
        </n-button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.notification-prompt-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--cs-sub-card-bg-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.notification-prompt-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
