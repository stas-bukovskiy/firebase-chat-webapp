<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import SearchModal from "@/components/SearchModal.vue";
import {useChatStore} from "@/stores/chats.ts";
import {GroupAddOutlined, SearchRound} from "@vicons/material";
import CreateGroupModal from "@/components/CreateGroupModal.vue";
import ProfileComponent from "@/components/ProfileComponent.vue";

const chatStore = useChatStore();

const chats = chatStore.getChats;

const currentChatUid = ref<null | string>(null);

const router = useRouter();

const handleChatClick = (uid: string) => {
  currentChatUid.value = uid;
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
      <div class="mb-1 me-3" v-for="chat in chats">
        <ChatListItem class="mb-0" :chatAgg="chat"
                      :isCurrent="currentChatUid === chat.uid" @click="handleChatClick"
                      @clickUserProfile="handleChatClick"/>
      </div>
    </n-scrollbar>
    <div class="mt-auto me-3">
      <ProfileComponent/>
    </div>
  </div>

  <n-modal v-model:show="showSearchModal" :mask-closable="false">
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
</style>