<script lang="ts" setup>
import {type PropType} from 'vue';
import AttachmentComponent from "@/components/AttachmentComponent.vue";
import type {AttachmentParams} from "@/services/models.ts";

const props = defineProps({
  chatId: String,
  attachments: Array as PropType<AttachmentParams[]>,
  onRemove: Function as () => (index: string) => void,
});

const emit = defineEmits(["update:isLoading", "addAttachmentUrl"]);

const removeFile = (fileKey: string) => {
  props.onRemove(fileKey);
};

const handleLoadingUpdate = (isLoading: boolean) => {
  emit('update:isLoading', isLoading);
};

const handleAddAttachmentUrl = (key: string, url: string) => {
  emit('addAttachmentUrl', key, url);
};

</script>

<template>
  <div class="d-flex flex-wrap gap-2">
    <AttachmentComponent v-for="attachment in props.attachments"
                         :key="attachment.key"
                         :fileKey="attachment.key"
                         :isEditable="true"
                         :chatId="props.chatId"
                         :file="attachment.file"
                         @removed="removeFile(attachment.key)"
                         @addAttachmentUrl="handleAddAttachmentUrl"
                         @update:isLoading="handleLoadingUpdate"/>
  </div>
</template>

<style scoped>

</style>
