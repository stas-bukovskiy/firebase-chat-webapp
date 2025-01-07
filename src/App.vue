<script setup lang="ts">
import {RouterView} from 'vue-router'
import {darkTheme, type GlobalThemeOverrides} from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontSize: '1rem',
  },
  Button: {
    fontSizeLarge: '1rem',
  },
}

</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-modal-provider>
        <RouterView/>
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
