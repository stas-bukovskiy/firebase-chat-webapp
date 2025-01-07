<template>
  <div class="chat-messages">
    <div
        v-for="message in messages"
        :key="message.id"
        class="message"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messages: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  background-color: #e1f5fe;
  padding: 10px;
  border-radius: 8px;
  max-width: 70%;
}
</style>
