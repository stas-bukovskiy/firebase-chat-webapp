<script lang="ts" setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {requestPermissionAndGetToken, unsubscribe} from '@/services/NotificationService'

const permission = ref<NotificationPermission>(Notification.permission)

onMounted(async () => {
  if (permission.value === 'granted') {
    await requestNotifications();
  }
})

onUnmounted(async () => {
  await unsubscribe();
})

const shouldShow = computed(() => permission.value !== 'granted')

async function requestNotifications() {
  const token = await requestPermissionAndGetToken()
  if (token) {
    console.log('FCM Token retrieved:', token)
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="shouldShow" class="notification-prompt-container px-4 py-3">
      <div class="notification-prompt-content">
        <p class="mb-0">Please enable notifications to receive alerts about new messages.</p>
        <n-button size="large" type="primary" @click="requestNotifications">Enable notifications</n-button>
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
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.notification-prompt-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Optional transition styles for fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
