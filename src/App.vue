<script setup lang="ts">
import {RouterView} from 'vue-router'
import {darkTheme} from 'naive-ui'
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-notification-provider>
      <RouterView/>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
