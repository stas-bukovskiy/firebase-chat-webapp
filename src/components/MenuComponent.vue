<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Search} from "@vicons/carbon";
import SearchModal from "@/components/SearchModal.vue";
import {useChatStore} from "@/stores/chats.ts";
import {DEFAULT_BADGE_COLORS} from "@/utils/avatar_badge.ts";

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
  <div class="py-3">
    <div class="header-container mb-3 p-3 d-flex justify-content-between align-items-center">
      <Logo/>
      <div class="div" @click="handleSearchClick">
        <n-button text>
          <n-icon size="32">
            <Search/>
          </n-icon>
        </n-button>
      </div>
    </div>
    <n-scrollbar style="max-height: calc(100vh - 224px)" trigger="none">
      <div class="mb-1 pe-3" v-for="chat in chats">
        <ChatListItem class="mb-0" :chatAgg="chat" :badgeBorderColors="DEFAULT_BADGE_COLORS"
                      :isCurrent="currentChatUid === chat.uid" @click="handleChatClick" @clickUserProfile="handleChatClick"/>
      </div>
    </n-scrollbar>
  </div>

  <n-modal v-model:show="showSearchModal">
    <SearchModal @onClose="showSearchModal = false"/>
  </n-modal>
</template>

<style scoped>
.header-container {
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
}
</style>