<script setup lang="ts">
import {RouterView} from 'vue-router'
import {darkTheme, type GlobalThemeOverrides} from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontSize: '1rem',
    primaryColor: '#fca311',
    primaryColorHover: '#FDB035',
    primaryColorPressed: '#FDA10D',
  },
  Button: {
    fontSizeMedium: '1rem',
    fontSizeLarge: '1.1rem',
    borderRadiusMedium: '6px',
    borderRadiusLarge: '8px',
  },
  Input: {
    borderRadius: '6px',
    fontSizeMedium: '1rem',
    fontSizeLarge: '1rem',
  },
  Tooltip: {
    color: 'var(--cs-sub-card-bg-color)',
    borderRadius: '6px',
  },
  Notification: {
    borderRadius: '8px',
    color: 'var(--cs-sub-card-bg-color)',
  },
  Badge: {
    fontSize: '0.8rem',
  },
  Dialog: {
    borderRadius: '10px',
    color: 'var(--cs-sub-card-bg-color)',
    lineHeight: '1.4rem',
    iconMargin: '0 0.8rem 0 0',
    iconSize: '2.2rem',
    titleFontWeight: 'bold',
  },
  Progress: {
    fillColor: '#fca311',
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
