<script setup lang="ts">

import Avatar from "@/components/Avatar.vue";
import {ref} from "vue";

const props = defineProps({
  uid: String,
  displayName: String,
  username: String,
  avatarUrl: {
    type: String,
    default: null
  },
  avatarKey: String,
  isOnline: {
    type: Boolean,
    default: true
  },
  unreadMessagesCount: {
    type: Number,
    default: 0
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["click"]);

const isHover = ref(props.isCurrent);

const handleClick = () => {
  emits("click", props.uid);
};

</script>

<template>
  <div
      class="chat-item d-flex w-100 align-items-center" @mouseover="isHover = true" @mouseleave="isHover = false"
      @click="handleClick" :style="{ backgroundColor: isHover || props.isCurrent ? '#293632' : '' }"
  >
    <div>
      <Avatar :displayName="props.displayName" :avatarKey="props.avatarKey" :avatarUrl="props.avatarUrl"
              :isOnline="props.isOnline" :isCurrent="isHover || props.isCurrent"
      />
    </div>
    <div class="ms-3 d-flex align-items-center justify-content-between" style="width: 100%">
      <h5 class="mb-0">{{ props.displayName }}</h5>
      <n-badge :value="props.unreadMessagesCount" :max="15"/>
    </div>
  </div>
</template>

<style scoped>
.chat-item {
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #293632;
}
</style>
