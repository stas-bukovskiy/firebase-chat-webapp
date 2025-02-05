<script setup lang="ts">
import {Search24Filled} from '@vicons/fluent';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Start typing to search...'
  }
});

const emit = defineEmits<{
  searchValueUpdated: (value: string) => void;
}>();

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('searchValueUpdated', target.value.toLowerCase());
};

</script>

<template>
  <div class="d-flex align-items-center">
    <n-input :placeholder="props.placeholder" class="w-100" :oninput="handleSearchInput">
      <template #prefix >
        <n-icon class="d-flex align-items-center" :component="Search24Filled"/>
      </template>
    </n-input>
  </div>
</template>

<style scoped>

</style>