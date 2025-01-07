<script setup lang="ts">
import {ref} from "vue";
import {Attach24Filled, ArrowUp12Filled} from "@vicons/fluent";

const newMessage = ref('');

const emits = defineEmits(['sendMessage']);

const adjustTextareaHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
};

const submitMessage = () => {
  if (newMessage.value.trim()) {
    emits('sendMessage', {id: Date.now(), text: newMessage.value});
    newMessage.value = '';
  }
};
</script>

<template>
  <div class="message-input d-flex px-4 py-3">
    <n-button tertiary circle size="large">
      <template #icon>
        <n-icon>
          <Attach24Filled/>
        </n-icon>
      </template>
    </n-button>

    <textarea
        class="mx-3"
        v-model="newMessage"
        placeholder="Type a message..."
        rows="1"
        @input="adjustTextareaHeight"
        @keydown.enter.prevent="submitMessage"
    />

    <n-button type="primary" size="large" @click="submitMessage">
      <template #icon>
        <n-icon>
          <ArrowUp12Filled/>
        </n-icon>
      </template>
    </n-button>
  </div>
</template>

<style scoped>
.message-input {
  border-top: 2px solid var(--cs-sub-card-bg-color);
}

textarea {
  resize: none;
  overflow: hidden;
  width: 100%;
  font-size: 1rem;
  padding: 8px;
  border: 1px solid var(--cs-sub-card-bg-color);
  background-color: var(--cs-sub-card-bg-color);
}

textarea:focus {
  outline: none;
  border-color: var(--cs-primary-color);
}

textarea:focus {
  outline: none;
  border-color: var(--cs-primary-color);
}

</style>
