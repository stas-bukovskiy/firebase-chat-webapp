<script setup lang="ts">
import MenuComponent from "@/components/MenuComponent.vue";
import EnableNotificationComponent from "@/components/EnableNotificationComponent.vue";
import { onMounted, onUnmounted } from "vue";
import { useCurrentUserStore } from "@/stores/current-user.ts"
import {useChatNotification} from "@/hooks/useChatNotification.ts";
import {initializeMessageListener} from "@/services/NotificationService.ts";
import {subscribeToTokenRefresh, unsubscribeFromTokenRefresh} from "@/services/TokenRefreshService.ts";

const currentUserStore = useCurrentUserStore();
const {showChatNotification} = useChatNotification()

onMounted(async () => {
  await currentUserStore.setUserIsOnline(true);
  initializeMessageListener(showChatNotification);
  await subscribeToTokenRefresh();
});

onUnmounted(async () => {
  await currentUserStore.setUserIsOnline(false);
  unsubscribeFromTokenRefresh();
});

</script>

<template>
  <main>
    <div class="sidebar">
      <MenuComponent/>
    </div>
    <div class="content">
      <div class="content-inner rounded-4">
        <router-view/>
      </div>
    </div>

    <EnableNotificationComponent/>
  </main>
</template>

<style scoped>
.sidebar {
  margin: 0;
  padding: 0.6rem 0 1.4rem 1.4rem;
  width: 400px;
  position: fixed;
  height: 100vh;
  overflow: auto;
}

div.content {
  margin-left: 400px;
  padding: 1px 0;
  min-height: 100vh;
}

.content-inner {
  background-color: var(--cs-card-bg-color);
  margin: 1.4rem 1.4rem 1.4rem 0;
  height: calc(100vh - 2.9rem);
}

@media screen and (max-width: 700px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .sidebar a {
    float: left;
  }

  div.content {
    margin-left: 0;
  }
}

@media screen and (max-width: 400px) {
  .sidebar a {
    text-align: center;
    float: none;
  }
}
</style>