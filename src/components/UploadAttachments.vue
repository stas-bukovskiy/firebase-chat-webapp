<script lang="ts" setup>
import {computed, type PropType, ref} from 'vue';
import AttachmentComponent from "@/components/AttachmentComponent.vue";
import type {AttachmentParams} from "@/models/models.ts";
import AttachmentPreviewComponent from "@/components/AttachmentPreviewComponent.vue";

const props = defineProps({
  chatId: String,
  attachments: Array as PropType<AttachmentParams[]>,
  onRemove: Function as () => (index: string) => void,
});

const attachmentsUrl = ref<string[]>([]);

const emit = defineEmits(["update:isLoading", "addAttachmentUrl"]);

const removeFile = (key: string, url: string) => {
  console.log('removeFile', key,  url);
  props.onRemove(key);
  if (url) {
    attachmentsUrl.value = attachmentsUrl.value.filter((attachmentUrl) => attachmentUrl !== url);
  }
};

const handleLoadingUpdate = (isLoading: boolean) => {
  emit('update:isLoading', isLoading);
};

const handleAddAttachmentUrl = (key: string, url: string) => {
  attachmentsUrl.value.push(url);
  emit('addAttachmentUrl', key, url);
};

const showAttachmentPreview = ref(false);
const attachmentPreviewUrl = ref<string | undefined>(undefined);

const handleAttachmentPreviewClick = (attachmentUrl: string) => {
  showAttachmentPreview.value = true;
  attachmentPreviewUrl.value = attachmentUrl;
}

const handleAttachmentPreviewClose = () => {
  showAttachmentPreview.value = false;
}
</script>

<template>
  <div class="d-flex flex-wrap gap-2">
    <AttachmentComponent v-for="attachment in props.attachments"
                         :key="attachment.key"
                         :fileKey="attachment.key"
                         :isEditable="true"
                         :chatId="props.chatId"
                         :file="attachment.file"
                         @removed="removeFile"
                         @addAttachmentUrl="handleAddAttachmentUrl"
                         @update:isLoading="handleLoadingUpdate"
                         @preview="handleAttachmentPreviewClick"/>

    <n-modal v-if="attachmentsUrl" v-model:show="showAttachmentPreview">
      <AttachmentPreviewComponent :attachments="attachmentsUrl" :initial-url="attachmentPreviewUrl"
                                  @close="handleAttachmentPreviewClose"/>
    </n-modal>
  </div>
</template>

<style scoped>

</style>
