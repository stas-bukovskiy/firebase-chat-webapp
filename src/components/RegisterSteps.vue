<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {type FormInst} from "naive-ui";
import {ArrowRight24Regular} from '@vicons/fluent'
import {containerLowercase, containsUppercase, validateEmail} from "@/utils/validations.ts";
import {useRouter} from "vue-router";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {db, auth} from "@/firebase";
import {doc} from "firebase/firestore";
import {runTransaction} from "firebase/firestore";
import {notifyError, UsernameAlreadyInUseError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";
import UploadAvatar from "@/components/UploadAvatar.vue";
import {generateUserKeywords} from "@/utils/keywords.ts";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {generateDisplayName} from "@/utils/avatars.ts";

const props = defineProps({
  initialState: {
    type: Number,
    default: 1
  }
});

const current = ref(props.initialState);
const isCredentialsStep = computed(() => current.value === 1)

const credentialsParams = reactive({
  email: 'test.user.1@mail.com',
  password: 'Password',
  confirmPassword: 'Password'
})

const profileParams = reactive({
  firstName: 'TestUser1',
  lastName: '',
  username: 'test.user.1',
  photoUrl: null
})

const credentialsFormRef = ref<FormInst | null>(null)
const profileParamsFormRef = ref<FormInst | null>(null)
const rules = {
  firstName: {
    required: true,
    message: 'Please input your first name',
    trigger: 'blur'
  },
  email: {
    required: true,
    message: 'Please input your email',
    trigger: 'blur'
  },
  username: {
    required: true,
    message: 'Please input your username',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: 'blur'
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your password',
    trigger: 'blur'
  }
}

const emailValidationStatus = computed(() => {
  return credentialsParams.email === '' || validateEmail(credentialsParams.email) ? undefined : 'error'
})

const emailFeedback = computed(() => {
  return credentialsParams.email === '' || validateEmail(credentialsParams.email) ? undefined : 'Invalid email format. Please check and try again.'
})

const passwordValidationStatus = computed(() => {
  const password = credentialsParams.password
  if (password.length === 0) {
    return undefined
  }
  return password.length >= 6 && containsUppercase(password) && containerLowercase(password) ? undefined : 'error'
})

const passwordFeedback = computed(() => {
  const password = credentialsParams.password
  if (password.length === 0) {
    return undefined
  } else if (password.length < 6) {
    return 'Password must be at least 6 characters long'
  } else if (!containsUppercase(password)) {
    return 'Password must contain at least one uppercase letter'
  } else if (!containerLowercase(password)) {
    return 'Password must contain at least one lowercase letter'
  }
})

const emailOptions = computed(() => {
  return ['@gmail.com', '@mail.com'].map((suffix) => {
    const prefix = credentialsParams.email.split('@')[0]
    return {
      label: prefix + suffix,
      value: prefix + suffix
    }
  })
})

const confirmPasswordValidationStatus = computed(() => {
  return credentialsParams.confirmPassword === '' || credentialsParams.password === credentialsParams.confirmPassword ? undefined : 'error'
})

const confirmPasswordFeedback = computed(() => {
  return credentialsParams.confirmPassword === '' || credentialsParams.password === credentialsParams.confirmPassword ? undefined : 'Passwords do not match'
})

const createUserProfile = async () => {
  const userWithSameUsernameRef = doc(db, "users", profileParams.username);

  return await runTransaction(db, async (transaction) => {
    // Check if the username is already in use
    const userWithSameUsername = await transaction.get(userWithSameUsernameRef);
    if (userWithSameUsername.data() !== undefined) {
      return Promise.reject(UsernameAlreadyInUseError);
    }

    // Add user data to the Firestore 'users' collection
    const userDocRef = doc(db, "users", profileParams.username);
    const userToCreate = {
      username: profileParams.username,
      firstName: profileParams.firstName,
      lastName: profileParams.lastName,
      keywords: generateUserKeywords(profileParams),
      email: auth.currentUser.email,
      uid: auth.currentUser.uid,
      photoUrl: profileParams.photoUrl,
      createdAt: nowToUTCTimestamp(),
    };
    transaction.set(userDocRef, userToCreate);
    return userToCreate;
  });
}

const notification = useNotification();
const loading = ref(false)
const router = useRouter();

const displayName = computed(() => {
  return generateDisplayName(profileParams);
})

const handleCreateUserClick = (e: MouseEvent) => {
  e.preventDefault()
  credentialsFormRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      createUserWithEmailAndPassword(auth, credentialsParams.email, credentialsParams.password)
          .then(() => {
            current.value = 2
          })
          .catch((error) => {
            notifyError(notification, error)
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}

const handleNewAvatarUrl = (url: string) => {
  console.log('New avatar URL:', url)
  profileParams.photoUrl = url
}

const currentUserStore = useCurrentUserStore()

const handleCreateProfileDetailsClick = (e: MouseEvent) => {
  e.preventDefault()
  profileParamsFormRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      createUserProfile()
          .then((user) => {
            console.log("set user", user)
            currentUserStore.setUser(user)
            router.push('/')
          })
          .then(updateProfile(auth.currentUser, {
            displayName: profileParams.username,
            photoURL: profileParams.photoUrl,
          }))
          .catch((error) => {
            notifyError(notification, error)
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center" style="width: 100%">
    <!-- Stepper -->
    <div class="mt-2 mb-4">
      <n-steps :current="current as number">
        <n-step title="Credentials"/>
        <n-step title="Profile Details"/>
      </n-steps>
    </div>

    <!-- First step: Credentials -->
    <div v-if="isCredentialsStep" style="width: 100%;">
      <n-form
          ref="credentialsFormRef"
          :model="credentialsParams"
          :rules="rules"
          size="large"
          style="width: 100%"
      >
        <n-form-item label="Email" path="email" :validation-status="emailValidationStatus" :feedback="emailFeedback">
          <n-auto-complete v-model:value="credentialsParams.email" placeholder="example@mail.com"
                           :options="emailOptions"/>
        </n-form-item>
        <n-form-item path="password" label="Password" :validation-status="passwordValidationStatus"
                     :feedback="passwordFeedback">
          <n-input v-model:value="credentialsParams.password" type="password" placeholder="Password"
                   show-password-on="click" minlength="6"/>
        </n-form-item>
        <n-form-item path="confirmPassword" label="Confirm password"
                     :validation-status="confirmPasswordValidationStatus"
                     :feedback="confirmPasswordFeedback">
          <n-input v-model:value="credentialsParams.confirmPassword" type="password" placeholder="Password"
                   show-password-on="click" minlength="6"/>
        </n-form-item>
        <div class="d-flex align-items-center justify-content-center">
          <n-button class="py-0" type="primary" @click="handleCreateUserClick" :loading="loading" icon-placement="right"
                    size="large">
            <template #icon>
              <n-icon>
                <ArrowRight24Regular/>
              </n-icon>
            </template>
            Next Step
          </n-button>
        </div>
      </n-form>
    </div>

    <!-- Second step: Profile details -->
    <div v-else-if="!isCredentialsStep">
      <n-form
          ref="profileParamsFormRef"
          :model="profileParams"
          :rules="rules"
          size="large"
          style="width: 100%"
      >
        <div class="row row-cols-auto">
          <div class="col-4 d-flex align-items-center justify-content-center">
            <div>
              <UploadAvatar :display-name="displayName" :avatar-key="auth.currentUser?.uid"
                            @new-avatar-url="handleNewAvatarUrl" @update:is-loading="loading = $event"/>
            </div>
          </div>
          <div class="col-8">
            <n-form-item label="First name" path="firstName">
              <n-input v-model:value="profileParams.firstName" placeholder="John"/>
            </n-form-item>
            <n-form-item label="Last name">
              <n-input v-model:value="profileParams.lastName" placeholder="Smith"/>
            </n-form-item>
          </div>
        </div>
        <n-form-item label="Username" path="username">
          <n-input v-model:value="profileParams.username" placeholder="john.smith"/>
        </n-form-item>
        <div class="d-flex align-items-center justify-content-center">
          <n-button class="py-0" type="primary" @click="handleCreateProfileDetailsClick" :loading="loading"
                    icon-placement="right"
                    size="large">
            <template #icon>
              <n-icon>
                <ArrowRight24Regular/>
              </n-icon>
            </template>
            Complete
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<style scoped>

</style>