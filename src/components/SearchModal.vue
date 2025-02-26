<script setup lang="ts">
import SearchPanelComponent from "@/components/SearchPanelComponent.vue";
import {computed, reactive, ref} from "vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {type ChatAggregate, PrivateChatAggregate, UserProfileEntity} from "@/services/entities.ts";
import {useChatStore} from "@/stores/chats.ts";
import {collection, query, where, orderBy, limit, getDocs} from "firebase/firestore";
import {db} from "@/firebase";
import {generateKeywords, generateUserKeywords} from "@/utils/keywords.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {useRouter} from "vue-router";
import {useNotification} from "naive-ui";
import {notifyError} from "@/utils/errors.ts";
import {CloseOutlined} from "@vicons/material";

const RESULT_LIMIT = 10;

const emit = defineEmits(["onClose"]);

const search = ref("")
const usersResult = reactive<ChatAggregate[]>([])

const chatStore = useChatStore();
const currentUserStore = useCurrentUserStore();

const handleSearchUpdate = async (value: string) => {
  search.value = value.toLowerCase()
  await searchUsers(value)
}

const searchUsers = async (value: string) => {
  if (value.length < 3) {
    usersResult.splice(0, usersResult.length)
    return
  }

  const usersQuery = query(collection(db, "users"),
      where("keywords", "array-contains", value),
      orderBy("firstName", "desc"), orderBy("lastName", "desc"),
      limit(RESULT_LIMIT)).withConverter(UserProfileEntity.converter)
  const usersSnapshot = await getDocs(usersQuery)

  const result = usersSnapshot.docs
      .filter(doc => {
        const myChatIndex = myChatsResult.value.find((chatAgg: ChatAggregate) => {
          return !chatAgg.chat.isGroup && chatAgg.otherUserProfile.id === doc.id
        })

        return !myChatIndex && doc.id !== currentUserStore.currentUser.username;
      })
      .map(doc => {
        return new PrivateChatAggregate({isGroup: false}, doc.data(), null);
      })

  usersResult.splice(0, usersResult.length, ...result)
}

const myChatsResult = computed(() => {
  if (search.value.length < 3) {
    return chatStore.getChats.sort((a, b) => {
      return b.chat.updatedAt - a.chat.updatedAt;
    }).slice(0, RESULT_LIMIT);
  }

  return chatStore.getChats.filter(chatAgg => {
    if (!chatAgg) {
      return false;
    }

    if (chatAgg.chat.isGroup) {
      return generateKeywords(chatAgg.chat.groupName)?.includes(search.value);
    }
    return generateUserKeywords(chatAgg.otherUserProfile)?.includes(search.value);
  }).slice(0, RESULT_LIMIT);
})

const router = useRouter();

const handleMyChatClick = (id: string) => {
  router.push({name: "chat", params: {id}})
  emit("onClose")
}

const notification = useNotification();

const handleNewChatClick = (username: string) => {
  chatStore.createPrivateChat(username).then((chatId) => {
    router.push({name: "chat", params: {id: chatId}})
  }).catch((error) => {
    notifyError(notification, error)
  }).finally(() => {
    emit("onClose")
  })
}

</script>

<template>
  <n-card class="modal-card" :bordered="false" size="huge" role="dialog" aria-modal="true">
    <SearchPanelComponent @searchValueUpdated="handleSearchUpdate"/>

    <n-scrollbar v-if="myChatsResult.length || usersResult.length" trigger="none" class="mt-3" style="max-height: 46vh">
      <n-divider v-if="myChatsResult.length" class="my-1">My chats</n-divider>
      <transition-group name="fade">
        <div class="mb-1" v-for="chat in myChatsResult" :key="chat.chat.id">
          <ChatListItem class="mb-0" :chatAgg="chat" :isCurrent="false"
                        @click="handleMyChatClick"/>
        </div>
        <n-divider v-if="usersResult.length" class="my-1">All Users</n-divider>
        <div class="mb-1" v-for="chat in usersResult" :key="chat.otherUserProfile.id">
          <ChatListItem class="mb-0" :chatAgg="chat" :isCurrent="false"
                        @clickUserProfile="handleNewChatClick"/>
        </div>
      </transition-group>
    </n-scrollbar>
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

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
</style>