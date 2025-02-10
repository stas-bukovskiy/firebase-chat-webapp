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
  Tooltip: {
    color: 'var(--cs-sub-card-bg-color)',
    borderRadius: '6px',
  },
  Notification: {
    borderRadius: '8px',
    color: 'var(--cs-sub-card-bg-color)',
}
}

</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-modal-provider>
        <n-dialog-provider>
          <RouterView/>
        </n-dialog-provider>
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
