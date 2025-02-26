<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {computed, onMounted, onUnmounted, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import SearchModal from "@/components/SearchModal.vue";
import {useChatStore} from "@/stores/chats.ts";
import {GroupAddOutlined, SearchRound} from "@vicons/material";
import CreateGroupModal from "@/components/CreateGroupModal.vue";
import ProfileComponent from "@/components/ProfileComponent.vue";

const chatStore = useChatStore();

const chats = computed(() => chatStore.userChats.sort((a, b) => {
  return b.userChat.updatedAt - a.userChat.updatedAt;
}));

const route = useRoute();
const currentChatUid = ref<null | string>(route.params.id as string | null);
watchEffect(() => {
  currentChatUid.value = route.params.id as string | null;
});

const router = useRouter();

const handleChatClick = (uid: string) => {
  router.push(`/chat/${uid}`);
};

const showSearchModal = ref(false);
const handleSearchClick = () => {
  showSearchModal.value = true;
};

const showCreateGroupModal = ref(false);
const handleCreateGroupClick = () => {
  showCreateGroupModal.value = true;
};

let unsubscribeFromUserChats = null;

onMounted(async () => {
  unsubscribeFromUserChats = await chatStore.fetchUserChats();
});

onUnmounted(() => {
  if (unsubscribeFromUserChats) {
    unsubscribeFromUserChats();
  }
});

</script>

<template>
  <div class="py-3 pe-2" style="height: calc(100vh - 2.9rem);">
    <div class="header-container mb-3 p-3 d-flex justify-content-between align-items-center me-3">
      <Logo/>
      <div class="div">
        <n-button text class="me-2" @click="handleCreateGroupClick">
          <n-icon size="1.8rem">
            <GroupAddOutlined/>
          </n-icon>
        </n-button>
        <n-button text @click="handleSearchClick">
          <n-icon size="1.8rem">
            <SearchRound/>
          </n-icon>
        </n-button>
      </div>
    </div>
    <n-scrollbar style="max-height: calc(100vh - 15.3rem)" trigger="hover">
      <TransitionGroup tag="div" name="fade">
        <div class="mb-1 me-3" v-for="(chat, index) in chats" :key="index">
          <ChatListItem class="mb-0" :chatAgg="chat"
                        :isCurrent="currentChatUid === chat?.chat?.id" @click="handleChatClick"
                        @clickUserProfile="handleChatClick"/>
        </div>
      </TransitionGroup>
    </n-scrollbar>
    <div class="mt-auto me-3">
      <ProfileComponent/>
    </div>
  </div>

  <n-modal v-model:show="showSearchModal" :mask-closable="true">
    <SearchModal @onClose="showSearchModal = false"/>
  </n-modal>

  <n-modal v-model:show="showCreateGroupModal" :mask-closable="false">
    <CreateGroupModal @onClose="showCreateGroupModal = false"/>
  </n-modal>
</template>

<style scoped>
.header-container {
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>