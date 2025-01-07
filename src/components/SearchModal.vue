<script setup lang="ts">
import SearchPanelComponent from "@/components/SearchPanelComponent.vue";
import {reactive, ref} from "vue";
import ChatListItem from "@/components/ChatListItem.vue";

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

const search = ref("")
const result = reactive([])

const handleSearchUpdate = (value: string) => {
  search.value = value
  if (value.length < 3) {
    result.splice(0, result.length)
    return
  }

  const res = chats.value.filter((chat) => {
    return true
  })

  result.splice(0, result.length, ...res)
}

const handleChatClick = (uid: string) => {
  // TODO: Implement chat click handler
}

</script>

<template>
  <n-card class="modal-card" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <SearchPanelComponent @searchValueUpdated="handleSearchUpdate"/>

    <n-scrollbar v-if="result.length" trigger="none" class="mt-3" style="max-height: 38vh">
      <div class="mb-1" v-for="chat in result">
        <ChatListItem class="mb-0" :uid="chat.uid" :displayName="chat.displayName" :username="chat.username"
                      :avatarKey="chat.avatarKey" :isOnline="chat.isOnline"
                      :isCurrent="currentChatUid === chat.uid" @click="handleChatClick"/>
      </div>
    </n-scrollbar>
    <div v-else class="text-muted text-center pt-4">
      <i><h6>Who seeks shall find...</h6></i>
    </div>
  </n-card>
</template>

<style scoped>
.modal-card {
  width: 60%;
  max-width: 600px;
  margin-top: 15vh;
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
  max-height: 60vh;
  transition: max-height 3s ease-in-out;
}
</style>