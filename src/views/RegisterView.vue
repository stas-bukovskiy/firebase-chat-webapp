<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {type FormInst} from "naive-ui";
import {ArrowRight24Regular} from '@vicons/fluent'
import {containerLowercase, containsUppercase, validateEmail} from "@/utils/validations.ts";
import {useRouter} from "vue-router";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {db, auth} from "@/firebase";
import {doc} from "firebase/firestore";
import {runTransaction} from "firebase/firestore";
import {EmailAlreadyInUseError, notifyError, UsernameAlreadyInUseError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

const registerParams = reactive({
  firstName: 'TestUser1',
  lastName: '',
  username: 'test.user.1',
  email: 'test.user.1@mail.com',
  password: 'Password',
  confirmPassword: 'Password'
})

const formRef = ref<FormInst | null>(null)
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
  return registerParams.email === '' || validateEmail(registerParams.email) ? undefined : 'error'
})

const emailFeedback = computed(() => {
  return registerParams.email === '' || validateEmail(registerParams.email) ? undefined : 'Invalid email format. Please check and try again.'
})

const passwordValidationStatus = computed(() => {
  const password = registerParams.password
  if (password.length === 0) {
    return undefined
  }
  return password.length >= 6 && containsUppercase(password) && containerLowercase(password) ? undefined : 'error'
})

const passwordFeedback = computed(() => {
  const password = registerParams.password
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
    const prefix = registerParams.email.split('@')[0]
    return {
      label: prefix + suffix,
      value: prefix + suffix
    }
  })
})

const confirmPasswordValidationStatus = computed(() => {
  return registerParams.confirmPassword === '' || registerParams.password === registerParams.confirmPassword ? undefined : 'error'
})

const confirmPasswordFeedback = computed(() => {
  return registerParams.confirmPassword === '' || registerParams.password === registerParams.confirmPassword ? undefined : 'Passwords do not match'
})

const registerUser = async (params: {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
}) => {
  const userWithSameUsernameRef = doc(db, "users", params.username);

  await runTransaction(db, async (transaction) => {
    // Check if the username is already in use
    const userWithSameUsername = await transaction.get(userWithSameUsernameRef);
    if (userWithSameUsername.data() !== undefined) {
      return Promise.reject(UsernameAlreadyInUseError);
    }

    // Create the user with email and password
    try {
      await createUserWithEmailAndPassword(auth, params.email, params.password);
    } catch (error) {
      return Promise.reject(EmailAlreadyInUseError);
    }
    const user = auth.currentUser

    // Add user data to the Firestore 'users' collection
    const userDocRef = doc(db, "users", params.username);
    transaction.set(userDocRef, {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      uid: user.uid,
      createdAt: nowToUTCTimestamp(),
    });
  });
}

const notification = useNotification();
const loading = ref(false)
const router = useRouter();

const handleRegisterClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      registerUser(registerParams).then(() => {
        // router.push('/app')
      }).catch((error) => {
        notifyError(notification, error)
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <div class="container d-flex flex-column justify-content-center align-items-center rounded-5 p-5">
    <h1 class="mb-2">Join us today!</h1>
    <h3 class="mb-3 text-muted">Create your account</h3>
    <n-form
        ref="formRef"
        :model="registerParams"
        :rules="rules"
        size="large"
        style="width: 100%"
    >
      <div class="row">
        <div class="col-6">
          <n-form-item label="First name" path="firstName">
            <n-input v-model:value="registerParams.firstName" placeholder="John"/>
          </n-form-item>
        </div>
        <div class="col-6">
          <n-form-item label="Last name">
            <n-input v-model:value="registerParams.lastName" placeholder="Smith"/>
          </n-form-item>
        </div>
      </div>
      <n-form-item label="Email" path="email" :validation-status="emailValidationStatus" :feedback="emailFeedback">
        <n-auto-complete v-model:value="registerParams.email" placeholder="example@mail.com" :options="emailOptions"/>
      </n-form-item>
      <n-form-item label="Username" path="username">
        <n-input v-model:value="registerParams.username" placeholder="john.smith"/>
      </n-form-item>
      <n-form-item path="password" label="Password" :validation-status="passwordValidationStatus"
                   :feedback="passwordFeedback">
        <n-input v-model:value="registerParams.password" type="password" placeholder="Password"
                 show-password-on="click" minlength="6"/>
      </n-form-item>
      <n-form-item path="confirmPassword" label="Confirm password" :validation-status="confirmPasswordValidationStatus"
                   :feedback="confirmPasswordFeedback">
        <n-input v-model:value="registerParams.confirmPassword" type="password" placeholder="Password"
                 show-password-on="click" minlength="6"/>
      </n-form-item>
      <div class="d-flex align-items-center justify-content-center">
        <n-button class="py-0" type="primary" @click="handleRegisterClick" :loading="loading" icon-placement="right"
                  size="large">
          <template #icon>
            <n-icon>
              <ArrowRight24Regular/>
            </n-icon>
          </template>
          Register
        </n-button>
      </div>
    </n-form>

    <div class="mt-4">
      Already have an account?
      <n-button text @click="goToLogin" size="large" type="primary">
        Login here
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #272727;
  min-width: 400px;
  width: 500px;
  max-width: 600px;
}
</style>