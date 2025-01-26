<script setup lang="ts">

const props = defineProps({
  isClickable: {
    type: Boolean,
    default: true,
  }
});

defineEmits("click");
</script>

<template>
  <div class="px-4 py-2 d-flex align-items-center" style="width: 100%"
       :class="isClickable ? 'item-clickable' : ''">
    <div class="item-icon">
      <slot name="icon"/>
    </div>

    <div class="d-flex justify-content-between" style="width: 100%">
      <span style="font-size: 1.1rem"><slot/></span>
      <slot name="right-section"/>
    </div>
  </div>
</template>

<style scoped>
.item-clickable {
  cursor: pointer;
  transition: background-color 0.3s;
}

.item-clickable:hover {
  background-color: var(--cs-badge-current-bg-color);
}

.item-icon {
  min-width: 10%;
  width: fit-content;
  max-width: 20%;
}
</style>