import {createRouter, createWebHistory} from 'vue-router'
import AuthLayout from "@/layouts/AuthLayout.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import CompleteProfileView from "@/views/CompleteProfileView.vue";
import AppLayout from "@/layouts/AppLayout.vue";
import {auth} from "@/firebase";
import AppView from "@/views/AppView.vue";
import ChatView from "@/views/ChatView.vue";
import {useCurrentUserStore} from "@/stores/current-user.ts";
import ChatLayout from "@/layouts/ChatLayout.vue";
import ChatPinnedMessagesView from "@/views/ChatPinnedMessagesView.vue";
import ChatLinksView from "@/views/ChatLinksView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/auth',
            component: AuthLayout,
            children: [
                {
                    name: 'login',
                    path: 'login',
                    component: LoginView
                },
                {
                    name: 'register',
                    path: 'register',
                    component: RegisterView
                },
                {
                    name: 'complete-profile',
                    path: 'complete-profile',
                    meta: {requiresAuth: true},
                    component: CompleteProfileView
                }
            ]
        },
        {
            path: '/',
            component: AppLayout,
            meta: {requiresAuth: true, requireCompleteProfile: true},
            children: [
                {
                    name: 'app',
                    path: '',
                    meta: {requiresAuth: true},
                    component: AppView,
                },
                {
                    path: "chat/:id",
                    component: ChatLayout,
                    meta: {requiresAuth: true},
                    children: [
                        {
                            path: '',
                            name: "chat",
                            component: ChatView,
                        },
                        {
                            path: "pinned-messages",
                            name: "chat-pinned-messages",
                            component: ChatPinnedMessagesView
                        },
                        {
                            path: "links",
                            name: "chat-links",
                            component: ChatLinksView
                        }
                    ]
                }
            ]
        }
    ],
})

router.beforeEach(async (to, from, next) => {
    const currentUserStore = useCurrentUserStore();

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    if (!requiresAuth) {
        next()
        return
    }

    const user = auth.currentUser;
    console.log("Current user", user);
    if (!user) {
        next({name: 'login'})
        return
    }

    const requireCompleteProfile = to.matched.some(record => record.meta.requireCompleteProfile);
    if (requireCompleteProfile) {
        if (user.email === null) {
            console.error("User email is not available");
            next({name: 'complete-profile'})
        }

        const userProfile = await currentUserStore.fetchUserByEmail(user.email);
        console.log("Fetched user profile", userProfile);
        if (!userProfile) {
            next({name: 'complete-profile'})
            return
        }
    }

    next()
})

export default router
