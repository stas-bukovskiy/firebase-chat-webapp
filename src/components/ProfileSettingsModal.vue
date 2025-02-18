<script setup lang="ts">
import {CloseOutlined, GroupAddOutlined} from "@vicons/material";
import UploadAvatar from "@/components/UploadAvatar.vue";
import {computed, reactive, ref} from "vue";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {generateDisplayName} from "@/utils/avatars.ts";
import {type FormInst, useNotification} from "naive-ui";
import {notifyError, UsernameAlreadyInUseError} from "@/utils/errors.ts";
import {auth, db} from "@/firebase";
import {doc, runTransaction} from "firebase/firestore";
import {generateUserKeywords} from "@/utils/keywords.ts";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

const emit = defineEmits(["onClose"]);

const currentUserStore = useCurrentUserStore();
const currentUser = currentUserStore.user;

const loading = ref(false);

const profileParams = reactive({
  firstName: currentUser?.firstName,
  lastName: currentUser?.lastName,
  username: currentUser?.username,
  photoUrl: currentUser?.photoUrl,
})

const profileParamsFormRef = ref<FormInst | null>(null)
const rules = {
  firstName: {
    required: true,
    message: 'Please input your first name',
    trigger: 'blur'
  },
  username: {
    required: true,
    message: 'Please input your username',
    trigger: 'blur'
  },
}

const displayName = computed(() => {
  return generateDisplayName(profileParams);
})

const handleNewAvatarUrl = (url: string) => {
  profileParams.photoUrl = url;
}

const isSaveButtonDisabled = computed(() => {
  if (!profileParams.firstName || !profileParams.username || loading.value) {
    return true;
  }

  return profileParams.firstName === currentUser?.firstName &&
      profileParams.lastName === currentUser?.lastName &&
      profileParams.username === currentUser?.username &&
      profileParams.photoUrl === currentUser?.photoUrl;
})


const notification = useNotification();
const handleSaveProfile = (e: MouseEvent) => {
  e.preventDefault()
  profileParamsFormRef.value?.validate((errors) => {
    if (!errors) {
      if (!profileParams.lastName) {
        delete profileParams.lastName;
      }

      updateUserProfile().then(() => {
        emit('onClose')
      }).catch((error) => {
        notifyError(notification, error)
      })
    }
  })
}

const updateUserProfile = async () => {
  const userWithSameUsernameRef = doc(db, "users", profileParams.username);

  await runTransaction(db, async (transaction) => {
    // Check if the username is already in use
    if (profileParams.username !== currentUser?.username) {
      const userWithSameUsername = await transaction.get(userWithSameUsernameRef);
      if (userWithSameUsername.data() !== undefined) {
        return Promise.reject(UsernameAlreadyInUseError);
      }

      await transaction.set(userWithSameUsernameRef, {
        username: profileParams.username,
        firstName: profileParams.firstName,
        lastName: profileParams.lastName || "",
        keywords: generateUserKeywords(profileParams),
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        photoUrl: profileParams.photoUrl || "",
        createdAt: currentUser.createdAt,
      });
      await transaction.delete(doc(db, "users", currentUser.username));
      return
    }

    await transaction.update(doc(db, "users", currentUser.username), {
      firstName: profileParams.firstName,
      lastName: profileParams.lastName || "",
      keywords: generateUserKeywords(profileParams),
      photoUrl: profileParams.photoUrl || "",
      updatedAt: nowToUTCTimestamp(),
    });
  });
}

</script>

<template>
  <div class="modal-card" role="dialog" aria-modal="true" style="padding: 0;">
    <div class="px-4 py-3 d-flex justify-content-between align-items-center bordered-bottom">
      <div class="d-flex align-items-center">
        <n-icon class="d-flex align-items-center h4 mb-0 me-3">
          <GroupAddOutlined/>
        </n-icon>
        <h4 class="h4 mb-0">Profile settings</h4>
      </div>

      <n-button text @click="emit('onClose')">
        <n-icon class="h4">
          <CloseOutlined/>
        </n-icon>
      </n-button>
    </div>
    <div class="row px-4 py-3">
      <div class="col-3 d-flex justify-content-center align-items-center">
        <UploadAvatar size="large" :display-name="displayName" :avatar-key="currentUser.uid"
                      @new-avatar-url="handleNewAvatarUrl" @update:is-loading="loading = $event"/>
      </div>
      <div class="col-9">
        <n-form ref="profileParamsFormRef" :model="profileParams" :rules="rules">
          <div class="row">
            <div class="col-6">
              <n-form-item label="First name" path="firstName">
                <n-input v-model:value="profileParams.firstName" placeholder="John"/>
              </n-form-item>
            </div>
            <div class="col-6">
              <n-form-item label="Last name">
                <n-input v-model:value="profileParams.lastName" placeholder="Smith"/>
              </n-form-item>
            </div>
          </div>

          <n-form-item label="Username" path="username">
            <n-input v-model:value="profileParams.username" placeholder="john.smith"/>
          </n-form-item>
        </n-form>
      </div>
    </div>

    <div class="d-flex justify-content-end align-items-center w-100 px-4 pb-3">
      <n-button type="primary" @click="handleSaveProfile" :disabled="isSaveButtonDisabled" class="me-3">
        Save
      </n-button>
      <n-button type="tertiary" @click="emit('onClose')" :disabled="loading">Cancel</n-button>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  padding: 0;
  min-width: 500px;
  width: 50%;
  max-width: 600px;
  margin-top: 15vh;
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
  height: 100%;
}
</style>