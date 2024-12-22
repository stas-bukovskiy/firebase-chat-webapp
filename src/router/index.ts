import {createRouter, createWebHistory} from 'vue-router'
import AuthLayout from "@/layouts/AuthLayout.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import CompleteProfileView from "@/views/CompleteProfileView.vue";
import AppLayout from "@/layouts/AppLayout.vue";
import {auth} from "@/firebase";
import {useUserStore} from "@/stores/user.ts";
import AppView from "@/views/AppView.vue";

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
                    path: 'app',
                    component: AppView,
                },
            ]
        }
    ],
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requireCompleteProfile = to.matched.some(record => record.meta.requireCompleteProfile);
    if (requiresAuth) {
        const user = auth.currentUser;
        if (user) {
            if (requireCompleteProfile) {
                const userProfile = await userStore.fetchUserProfileByEmail(user.email);
                if (!userProfile) {
                    next({name: 'complete-profile'})
                }
            }
            next()
        } else {
            next({name: 'login'})
        }
    } else {
        next()
    }
})

export default router
