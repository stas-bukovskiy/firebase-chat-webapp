<script setup lang="ts">
import {CloseOutlined, GroupAddOutlined} from "@vicons/material";
import {db} from "@/firebase";
import UploadAvatar from "@/components/UploadAvatar.vue";
import {computed, onMounted, type PropType, reactive, ref} from "vue";
import {ChatEntity, PrivateChatAggregate, UserProfileEntity} from "@/services/entities.ts";
import {collection, doc, getDocs, limit, orderBy, query, setDoc, where} from "firebase/firestore";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {CARD_BADGE_COLORS} from "@/utils/avatar_config.ts";
import SearchPanelComponent from "@/components/SearchPanelComponent.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import {useUserStore} from "@/stores/users.ts";
import {GroupOutlined} from "@vicons/material";
import {useRouter} from "vue-router";

const RESULT_LIMIT = 10;

const props = defineProps({
  groupChat: Object as PropType<ChatEntity>
})

onMounted(() => {
  console.log("groupChat", props.groupChat);
})

const emit = defineEmits(["onClose"]);

const currentUserStore = useCurrentUserStore();
const userStore = useUserStore();

const groupChat = reactive(new ChatEntity(props.groupChat));
const groupChatMembersSet = reactive(new Map<string, UserProfileEntity>());
const currentUserDocRef = doc(db, "users", currentUserStore.username);

const searchResult = ref<ChatEntity[]>();

const loading = ref(false);

onMounted(() => {
  groupChat.members.forEach(member => {
    const userProfile = userStore.fetchByUsername(member.id);
    groupChatMembersSet.set(member.id, userProfile?.data);
  })

  searchResult.value = getMyUsers();
});

const handleNewAvatarUrl = (url: string) => {
  groupChat.groupImageUrl = url;
}

const handleSearchUpdate = async (value: string) => {
  if (value.length == 0) {
    searchResult.value = getMyUsers();
  } else if (value.length >= 3) {
    searchResult.value = await searchUsers(value);
  }
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
    console.log("removing user", username);
    groupChatMembersSet.delete(username);
    console.log("removed user", groupChatMembersSet.size)
    return;
  }

  const userProfile = searchResult.value.find(chat => chat.otherUserProfile?.username === username)?.otherUserProfile;
  groupChatMembersSet.set(username, userProfile);
  console.log("added user", groupChatMembersSet.size)
}


const isEditButtonDisabled = computed(() => {
  if (loading.value || groupChat.groupName?.length === 0 || groupChatMembersSet.size === 0) {
    console.log(1, groupChat.groupName.length, groupChatMembersSet)
    return true
  }
  if (props.groupChat.groupName !== groupChat.groupName || props.groupChat.groupImageUrl !== groupChat.groupImageUrl) {
    console.log(2, props.groupChat, groupChat)
    return false;
  }

  const newMembers = Array.from(groupChatMembersSet.values()).map(user => user.username);
  const oldMembers = props.groupChat.members.map(member => member.id);

  if (newMembers.length !== oldMembers.length) {
    console.log(3)
    return false;
  }

  const addedMembers = newMembers.filter(member => !oldMembers.includes(member));
  if (addedMembers.length === 0) {
    console.log(4)
    return true
  }

  const removedMembers = oldMembers.filter(member => !newMembers.includes(member));
  console.log(5, removedMembers, removedMembers.length > 0)
  return removedMembers.length === 0;
})

const router = useRouter();

const handleCreateGroup = async () => {
  groupChat.members = Array.from(groupChatMembersSet.values()).map(user => {
    return doc(db, "users", user.username);
  });

  console.log("groupChat", groupChat);

  const chatDocRef = doc(db, "chats", groupChat.id)
  await setDoc(chatDocRef, {
    isGroup: true,
    groupName: groupChat.groupName,
    groupImageUrl: groupChat.groupImageUrl || '',
    members: groupChat.members,
    createdBy: currentUserDocRef,
  });

  const userChatDocRef = doc(db, "userChats", currentUserStore.username, "chats", groupChat.id);
  await setDoc(userChatDocRef, {
    chat: chatDocRef,
    unreadCount: 0,
    isStarred: false,
  });

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
      <n-button type="primary" @click="handleCreateGroup" :disabled="isEditButtonDisabled" class="me-3">
        Save changes
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