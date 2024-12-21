<script setup lang="ts">
import RegisterSteps from "@/components/RegisterSteps.vue";
</script>

<template>
  <div class="container d-flex flex-column justify-content-center align-items-center rounded-5 p-5">
    <h1 class="mb-2">Join us today!</h1>
    <h3 class="mb-3 text-muted">Complete registration</h3>
    <RegisterSteps :initial-state="2"/>
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