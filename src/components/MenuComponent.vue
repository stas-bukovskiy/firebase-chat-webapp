<script setup lang="ts">
import SearchPanelComponent from "@/components/SearchPanelComponent.vue";
import Logo from "@/components/Logo.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {ref} from "vue";

const handleSearchInput = (value: string) => {
  // TODO: Implement search logic
};

const chats = ref([
  {
    uid: "1",
    displayName: "John Doe",
    username: "test.user.1",
    avatarKey: "test.user.1@mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "2",
    displayName: "Jane Doe",
    username: "test.user.2",
    avatarKey: "test.user.2.mail.com",
    isOnline: false,
    unreadMessagesCount: 3,
  },
  {
    uid: "3",
    displayName: "Bill Gates",
    username: "test.user.2",
    avatarKey: "test.user.3.mail.com",
    isOnline: false,
    unreadMessagesCount: 20,
  },
  {
    uid: "4",
    displayName: "Elon Musk",
    username: "test.user.4",
    avatarKey: "test.user.4.mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "5",
    displayName: "Jeff Bezos",
    username: "test.user.5",
    avatarKey: "test.user.5.mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "6",
    displayName: "Mark Zuckerberg",
    username: "test.user.6",
    avatarKey: "test.user.6.mail.com",
    isOnline: false,
    unreadMessagesCount: 0,
  },
  {
    uid: "1",
    displayName: "John Doe",
    username: "test.user.1",
    avatarKey: "test.user.1@mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "2",
    displayName: "Jane Doe",
    username: "test.user.2",
    avatarKey: "test.user.2.mail.com",
    isOnline: false,
    unreadMessagesCount: 3,
  },
  {
    uid: "3",
    displayName: "Bill Gates",
    username: "test.user.2",
    avatarKey: "test.user.3.mail.com",
    isOnline: false,
    unreadMessagesCount: 20,
  },
  {
    uid: "4",
    displayName: "Elon Musk",
    username: "test.user.4",
    avatarKey: "test.user.4.mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "5",
    displayName: "Jeff Bezos",
    username: "test.user.5",
    avatarKey: "test.user.5.mail.com",
    isOnline: true,
    unreadMessagesCount: 0,
  },
  {
    uid: "6",
    displayName: "Mark Zuckerberg",
    username: "test.user.6",
    avatarKey: "test.user.6.mail.com",
    isOnline: false,
    unreadMessagesCount: 0,
  },

]);

const currentChatUid = ref<null | string>(null);

const handleChatClick = (uid: string) => {
  console.log("Chat clicked", uid);
  currentChatUid.value = uid;
};

</script>

<template>
  <div>
    <Logo/>
    <div class="my-3 pe-3">
      <SearchPanelComponent @searchValueUpdated="handleSearchInput"/>
    </div>
    <n-scrollbar style="max-height: calc(100vh - 224px)" trigger="hover">
      <div class="mb-1 pe-3" v-for="chat in chats">
        <ChatListItem class="mb-0" :uid="chat.uid" :displayName="chat.displayName" :username="chat.username"
                      :avatarKey="chat.avatarKey" :isOnline="chat.isOnline"
                      :unreadMessagesCount="chat.unreadMessagesCount"
                      :isCurrent="currentChatUid === chat.uid" @click="handleChatClick"/>
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped>

</style>