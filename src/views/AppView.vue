<script setup lang="ts">

import {signOut} from 'firebase/auth'
import {auth} from "@/firebase";
import {useRouter} from "vue-router";

const router = useRouter()

const logOut = async () => {
  signOut(auth)
      .then(router.push({name: 'login'}))
}

import { useChatNotification } from '@/hooks/useChatNotification'

const { showChatNotification } = useChatNotification()

function handleNewMessage() {
  // Example chat data. In a real application, this data may come from a websocket or API.
  const chat = {
    data: {
      chatId: 'QW3kqMpSrnYpMYu8IEyc'
    },
    notification: {
      title: 'New Message',
      body: 'Hello, check out this message!'
    }
  }

  showChatNotification(chat)
}

</script>

<template>
  Open the chat to start messaging...
  <n-button type="primary" @click="logOut">
    Log out
  </n-button>
  <n-button @click="handleNewMessage">Simulate New Chat Message</n-button>

</template>

<style scoped>

</style>