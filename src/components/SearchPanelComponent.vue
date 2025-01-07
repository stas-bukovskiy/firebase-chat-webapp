<script setup lang="ts">
import {Search24Filled} from '@vicons/fluent';

const emit = defineEmits<{
  searchValueUpdated: (value: string) => void;
}>();

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('searchValueUpdated', target.value);
};

</script>

<template>
  <div class="d-flex align-items-center">
    <n-input placeholder="Start typing to search..." class="w-100" size="large" :oninput="handleSearchInput">
      <template #prefix>
        <n-icon :component="Search24Filled"/>
      </template>
    </n-input>
  </div>
</template>

<style scoped>

</style>