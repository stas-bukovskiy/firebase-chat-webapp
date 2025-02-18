<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {type FormInst, useNotification} from "naive-ui";
import {ArrowRight24Regular} from '@vicons/fluent'
import {validateEmail} from "@/utils/validations.ts";
import {useRouter} from "vue-router";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/firebase";
import {notifyError} from "@/utils/errors.ts";
import Logo from "@/components/Logo.vue";


const loginParams = reactive({
  email: 'test.user.2@mail.com',
  password: 'Password',
})

const formRef = ref<FormInst | null>(null)
const rules = {
  email: {
    required: true,
    message: 'Please input your email',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: 'blur'
  }
}

const emailValidationStatus = computed(() => {
  return loginParams.email === '' || validateEmail(loginParams.email) ? undefined : 'error'
})

const emailFeedback = computed(() => {
  return loginParams.email === '' || validateEmail(loginParams.email) ? undefined : 'Invalid email format. Please check and try again.'
})

const emailOptions = computed(() => {
  return ['@gmail.com', '@mail.com'].map((suffix) => {
    const prefix = loginParams.email.split('@')[0]
    return {
      label: prefix + suffix,
      value: prefix + suffix
    }
  })
})

const notification = useNotification();
const loading = ref(false)
const router = useRouter();

const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      signInWithEmailAndPassword(auth, loginParams.email, loginParams.password)
          .then(() => {
            router.push('/')
          })
          .catch((error) => {
            console.error(error)
            notifyError(notification, error)
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}

const goToRegistration = () => {
  router.push('/auth/register')
}
</script>

<template>
  <div class="container d-flex flex-column justify-content-center align-items-center rounded-5 p-5">
    <div class="d-flex align-items-center mb-3">
      <img src = "@/assets/logo.svg" alt="logo" width="42" height="42">
    </div>
    <h1 class="mb-2">Welcome back!</h1>
    <h3 class="mb-3 text-muted">Login your account</h3>
    <n-form
        ref="formRef"
        :model="loginParams"
        :rules="rules"
        size="large"
        style="width: 100%"
    >
      <n-form-item label="Email" path="email" :validation-status="emailValidationStatus" :feedback="emailFeedback">
        <n-auto-complete v-model:value="loginParams.email" placeholder="example@mail.com" :options="emailOptions"/>
      </n-form-item>
      <n-form-item path="password" label="Password">
        <n-input v-model:value="loginParams.password" type="password" placeholder="Password" show-password/>
      </n-form-item>
      <div class="d-flex align-items-center justify-content-center">
        <n-button class="py-0" type="primary" @click="handleValidateClick" :loading="loading" icon-placement="right"
                  size="large">
          <template #icon>
            <n-icon>
              <ArrowRight24Regular/>
            </n-icon>
          </template>
          Login
        </n-button>
      </div>
    </n-form>

    <div class="mt-4">
      Don't have an account?
      <n-button text @click="goToRegistration" type="primary">
        Register here
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: var(--cs-card-bg-color);
  min-width: 400px;
  width: 500px;
  max-width: 600px;
}
</style>