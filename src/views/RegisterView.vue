<script setup lang="ts">
import RegisterSteps from "@/components/RegisterSteps.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <div class="container d-flex flex-column justify-content-center align-items-center rounded-5 p-5">
    <div class="d-flex align-items-center mb-3">
      <img src = "@/assets/logo.svg" alt="logo" width="42" height="42">
    </div>
    <h1 class="mb-2">Join us today!</h1>
    <h3 class="mb-3 text-muted">Create your account</h3>
    <RegisterSteps/>
    <div class="mt-4">
      Already have an account?
      <n-button text @click="goToLogin" type="primary">
        Login here
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: var(--cs-card-bg-color);;
  min-width: 400px;
  width: 500px;
  max-width: 600px;
}
</style>