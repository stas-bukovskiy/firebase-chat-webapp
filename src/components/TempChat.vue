<template>
  <div class="chat-layout">
    <!-- Chat Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <ChatMessages :messages="messages" />
    </div>

    <!-- Input for New Messages -->
    <div class="input-container">
      <textarea
          v-model="newMessage"
          placeholder="Type a message..."
          rows="1"
          @input="adjustTextareaHeight"
          @keydown.enter.prevent="sendMessage"
      ></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import ChatMessages from "@/components/ChatMessages.vue"; // Your chat message component

export default {
  components: {ChatMessages},
  data() {
    return {
      messages: [
        { id: 1, text: 'Hello!' },
        { id: 2, text: 'How are you?' },
      ],
      newMessage: '',
    };
  },
  methods: {
    adjustTextareaHeight(event) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({ id: Date.now(), text: this.newMessage });
        this.newMessage = '';
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
  },
};
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

.input-container {
  display: flex;
  align-items: flex-end;
  padding: 10px;
  border-top: 1px solid #ccc;
  background-color: #fff;
}

textarea {
  flex-grow: 1;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-size: 16px;
  max-height: 150px;
  overflow-y: auto;
}

button {
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
