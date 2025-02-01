import {h} from 'vue'
import {useNotification} from 'naive-ui'
import {useRoute, useRouter} from 'vue-router'
import Avatar from '@/components/Avatar.vue'
import {useChatStore} from "@/stores/chats.ts";
import type {ChatAggregate} from "@/services/entities.ts";

export function useChatNotification() {
    const notification = useNotification()
    const router = useRouter()
    const chatStore = useChatStore()
    const route = useRoute()

    const chatNotificationMap = new Map<string, Function[]>();

    /**
     * Shows a notification for a chat message.
     *
     * Example structure:
     * {
     *   id: 'chat123',
     *   sender: {
     *     name: 'John Doe',
     *     avatar: 'https://example.com/avatar.jpg'
     *   },
     *   message: 'Hello, check out this message!'
     * }
     * @param params
     */
    function showChatNotification(params: {
        data: {
            chatId: string,
        },
        notification: {
            title: string,
            body: string
        }
    }) {
        const chatAgg: ChatAggregate = chatStore.getChatByChatId(params.data.chatId)
        if (!chatAgg) {
            console.error('Chat not found:', params.data.chatId)
            return
        }

        const userChatId = chatAgg.userChat.id;

        if (route.path.includes(`/chat/${userChatId}`)) {
            console.log('Chat is already open:', userChatId)
            return
        }

        const { destroy } = notification.create({
            duration: 5000,
            content: () => {
                return h(
                    'div',
                    {
                        // Style for layout and to indicate it's clickable
                        style: {
                            display: 'flex',
                            alignItems: 'start',
                            cursor: 'pointer'
                        },
                        // Handle click to navigate to the chat page
                        onClick: async () => {
                            await router.push(`/chat/${userChatId}`)
                            // Destroy all notifications for this chat
                            if (chatNotificationMap[userChatId]) {
                                chatNotificationMap[userChatId].forEach(destroy => destroy())
                                chatNotificationMap[userChatId] = []
                            }
                        }
                    },
                    [
                        // Avatar component with a small margin
                        h(Avatar, {
                            chatAgg: chatAgg,
                            size: 'small',
                            class: 'me-3 mt-2'
                        }),
                        // A container for sender's name and message text
                        h(
                            'div',
                            {},
                            [
                                h('div', {
                                    style: {
                                        fontWeight: 'var(--n-title-font-weight)',
                                        fontSize: 'var(--n-title-font-size)',
                                    }
                                }, params.notification.title),
                                h('div', {
                                    class: 'mt-2'
                                }, params.notification.body)
                            ]
                        )
                    ]
                )
            }
        })

        // Save the notification key for the given chatId
        if (!chatNotificationMap[userChatId]) {
            chatNotificationMap[userChatId] = []
        }
        chatNotificationMap[userChatId].push(destroy)
    }

    return {
        showChatNotification
    }
}
