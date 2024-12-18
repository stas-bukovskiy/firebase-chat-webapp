<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {type FormInst} from "naive-ui";
import {ArrowRight24Regular} from '@vicons/fluent'
import {validateEmail} from "@/utils/validations.ts";
import {useRouter} from "vue-router";


const loginParams = reactive({
  email: '',
  password: ''
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

const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      console.log("Valid")
    } else {
      console.log(errors)
    }
  })
}

const router = useRouter();
const goToRegistration = () => {
  router.push('/auth/register')
}
</script>

<template>
  <div class="container d-flex flex-column justify-content-center align-items-center rounded-5 p-5">
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
        <n-button class="py-0" type="primary" @click="handleValidateClick" icon-placement="right" size="large">
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
      <n-button text @click="goToRegistration" size="large" type="primary">
        Register here
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