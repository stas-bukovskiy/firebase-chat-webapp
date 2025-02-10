<script setup lang="ts">
import {CloseOutlined, GroupAddOutlined} from "@vicons/material";
import {db} from "@/firebase";
import UploadAvatar from "@/components/UploadAvatar.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {generateFirestoreId} from "@/utils/uid.ts";
import {ChatEntity, PrivateChatAggregate, UserProfileEntity} from "@/services/entities.ts";
import {collection, doc, getDocs, limit, orderBy, query, where} from "firebase/firestore";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {CARD_BADGE_COLORS} from "@/utils/avatar_config.ts";
import SearchPanelComponent from "@/components/SearchPanelComponent.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {useUserStore} from "@/stores/users.ts";
import {GroupOutlined} from "@vicons/material";
import {useRouter} from "vue-router";
import {useChatStore} from "@/stores/chats.ts";

const RESULT_LIMIT = 10;

const emit = defineEmits(["onClose"]);

const currentUserStore = useCurrentUserStore();
const userStore = useUserStore();

const groupChat = reactive(new ChatEntity());
const groupChatMembersSet = reactive(new Map<string, UserProfileEntity>());
const currentUserDocRef = doc(db, "users", currentUserStore.username);

const searchResult = ref<ChatEntity[]>();

const loading = ref(false);

onMounted(() => {
  reset();
});

const reset = () => {
  searchResult.value = getMyUsers();

  groupChat.id = generateFirestoreId();
  groupChat.isGroup = true;
  groupChat.groupName = "";
  groupChat.groupImageUrl = "";
  groupChat.members = [currentUserDocRef];
  groupChat.createdBy = currentUserDocRef;

  loading.value = false;
}

const handleNewAvatarUrl = (url: string) => {
  groupChat.groupImageUrl = url;
}

const handleSearchUpdate = async (value: string) => {
  console.log("searching for", value);
  if (value.length == 0) {
    searchResult.value = getMyUsers();
  } else if (value.length >= 3) {
    searchResult.value = await searchUsers(value);
  }
  console.log("searchResult", searchResult.value);
}

const getMyUsers = () => {
  return Array.from(groupChatMembersSet.values())
      .concat(userStore.getUsers.filter(user => {
        const id = user.data?.id;
        return id !== currentUserStore.currentUser.username && !groupChatMembersSet.has(id);
      })).map(user => {
        console.log("adding user", user);
        return new PrivateChatAggregate({isGroup: false}, user, null);
      })
  // .concat(Array.from(groupChatMembersSet.values())
  //     .concat(userStore.getUsers.filter(user => {
  //       const id = user.data?.id;
  //       return id !== currentUserStore.currentUser.username && !groupChatMembersSet.has(id);
  //     })).map(user => {
  //       console.log("adding user", user);
  //       return new PrivateChatAggregate({isGroup: false}, user, null);
  //     })).concat(Array.from(groupChatMembersSet.values())
  //     .concat(userStore.getUsers.filter(user => {
  //       const id = user.data?.id;
  //       return id !== currentUserStore.currentUser.username && !groupChatMembersSet.has(id);
  //     })).map(user => {
  //       console.log("adding user", user);
  //       return new PrivateChatAggregate({isGroup: false}, user, null);
  //     }).concat(Array.from(groupChatMembersSet.values())
  //         .concat(userStore.getUsers.filter(user => {
  //           const id = user.data?.id;
  //           return id !== currentUserStore.currentUser.username && !groupChatMembersSet.has(id);
  //         })).map(user => {
  //           console.log("adding user", user);
  //           return new PrivateChatAggregate({isGroup: false}, user, null);
  //         })))
}

const searchUsers = async (value: string) => {
  const usersQuery = query(collection(db, "users"),
      where("keywords", "array-contains", value),
      orderBy("firstName", "desc"), orderBy("lastName", "desc"),
      limit(RESULT_LIMIT)).withConverter(UserProfileEntity.converter)
  const usersSnapshot = await getDocs(usersQuery)

  return usersSnapshot.docs.filter(doc => {
    return doc.id !== currentUserStore.currentUser.username;
  }).map(doc => {
    return new PrivateChatAggregate({isGroup: false}, doc.data(), null);
  })
}


const handleAddUserClick = (username: string) => {
  if (groupChatMembersSet.has(username)) {
    groupChatMembersSet.delete(username);
    console.log("removing user", groupChatMembersSet.size)
    return;
  }

  const userProfile = searchResult.value.find(chat => chat.otherUserProfile?.username === username)?.otherUserProfile;
  groupChatMembersSet.set(username, userProfile);
}


const isCreateButtonDisabled = computed(() => {
  return loading.value || groupChat.groupName?.length === 0;
})

const router = useRouter();
const chatStore = useChatStore();

const handleCreateGroup = async () => {
  groupChat.members = Array.from(groupChatMembersSet.values()).map(user => {
    return doc(db, "users", user.username);
  });
  await chatStore.createGroupChat(groupChat);
  emit("onClose")
  await router.push({name: "chat", params: {id: groupChat.id}});
}
</script>

<template>
  <div class="modal-card" role="dialog" aria-modal="true" style="padding: 0;">
    <div class="px-4 py-3 d-flex justify-content-between align-items-center bordered-bottom">
      <div class="d-flex align-items-baseline">
        <n-icon class="h4 me-3">
          <GroupAddOutlined/>
        </n-icon>
        <h4 class="h4 mb-0">New group chat</h4>
      </div>

      <n-button text @click="emit('onClose')">
        <n-icon class="h4">
          <CloseOutlined/>
        </n-icon>
      </n-button>
    </div>

    <div class="modal-body px-4 py-3 d-flex">
      <div class="pe-3">
        <UploadAvatar size="large" :display-name="groupChat.groupName" :avatar-key="groupChat.id"
                      @new-avatar-url="handleNewAvatarUrl" @update:is-loading="loading = $event"/>
      </div>
      <div class="w-100">
        <n-input class="mb-3" v-model:value="groupChat.groupName" placeholder="Enter group name">
          <template #prefix>
            <n-icon class="d-flex align-items-center" :component="GroupOutlined"/>
          </template>
        </n-input>

        <SearchPanelComponent placeholder="Who would you like to add?" @searchValueUpdated="handleSearchUpdate"/>

        <n-scrollbar trigger="none" class="mt-3" style="max-height: 40vh">
          <div class="mb-1" v-for="chat in searchResult">
            <ChatListItem class="mb-0" :chatAgg="chat"
                          :isCurrent="groupChatMembersSet.has(chat.otherUserProfile?.username)"
                          @clickUserProfile="handleAddUserClick" :badgeBorderColors="CARD_BADGE_COLORS"/>
          </div>
        </n-scrollbar>
      </div>
    </div>
    <div class="d-flex justify-content-end align-items-center px-4 py-3">
      <n-button type="primary" @click="handleCreateGroup" :disabled="isCreateButtonDisabled" class="me-3">Create group
      </n-button>
      <n-button type="tertiary" @click="emit('onClose')" :disabled="loading">Cancel</n-button>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  padding: 0;
  width: 60%;
  max-width: 600px;
  margin-top: 15vh;
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
  height: 100%;
}

.modal-body {

}
</style>