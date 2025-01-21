<script lang="ts" setup>
import {type PropType} from 'vue';
import AttachmentComponent from "@/components/AttachmentComponent.vue";
import type {AttachmentParams} from "@/services/models.ts";

const props = defineProps({
  chatId: String,
  attachments: Array as PropType<AttachmentParams[]>,
  onRemove: Function as () => (index: number) => void,
});

const emit = defineEmits(["update:isLoading", "addAttachmentUrl"]);

const removeFile = (index: number) => {
  props.onRemove(index);
};

const handleLoadingUpdate = (isLoading: boolean) => {
  emit('update:isLoading', isLoading);
};

</script>

<template>
  <div class="d-flex flex-wrap gap-2">
    <AttachmentComponent v-for="attachment in props.attachments"
                         :key="attachment.key"
                         :isEditable="true"
                         :chatId="props.chatId"
                         :file="attachment.file"
                         @removed="removeFile(attachment.key)"
                         @addAttachmentUrl="emit('addAttachmentUrl', $event)"
                         @update:isLoading="handleLoadingUpdate"/>
  </div>
</template>

<style scoped>

</style>
