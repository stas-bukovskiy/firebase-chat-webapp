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
    <h1 class="mb-2">Join us today!</h1>
    <h3 class="mb-3 text-muted">Create your account</h3>
    <RegisterSteps/>
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