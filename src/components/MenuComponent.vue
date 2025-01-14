<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Search} from "@vicons/carbon";
import SearchModal from "@/components/SearchModal.vue";
import {useChatStore} from "@/stores/chats.ts";
import {DEFAULT_BADGE_COLORS} from "@/utils/avatar_badge.ts";
import ProfileModal from "@/components/ProfileModal.vue";
import {PrivateChatAggregate} from "@/services/entities.ts";

const chatStore = useChatStore();

const chats = chatStore.getChats;

const currentChatUid = ref<null | string>(null);

const router = useRouter();

const showTemp = ref(false);
const temp = ref<null| PrivateChatAggregate>(null)

const handleChatClick = (uid: string) => {
  currentChatUid.value = uid;
  // router.push(`/chat/${uid}`);

  showTemp.value = true;
  temp.value = chats[0].otherUserProfile;
};

const showSearchModal = ref(false);
const handleSearchClick = () => {
  showSearchModal.value = true;
};


onMounted(async () => {
  await chatStore.fetchUserChats();
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
    <SearchModal/>
  </n-modal>

  <n-modal v-model:show="showTemp">
    <ProfileModal :user-profile="temp"/>
  </n-modal>
</template>

<style scoped>
.header-container {
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
}
</style>