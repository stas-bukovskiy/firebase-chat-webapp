<script setup lang="ts">

import type {PropType} from "vue";
import type {AvatarParamsInterface} from "@/services/params.ts";

const props = defineProps({
  avatar: Object as PropType<AvatarParamsInterface>,
});

// TODO: Implement the logic for the ProfileModal component
</script>

<template>

</template>

<style scoped>
.modal-card {
  width: 60%;
  max-width: 600px;
  margin-top: 15vh;
  background-color: var(--cs-card-bg-color);
  border-radius: 16px;
  max-height: 60vh;
  transition: max-height 3s ease-in-out;
}
</style>