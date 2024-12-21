import {createRouter, createWebHistory} from 'vue-router'
import AuthLayout from "@/AuthLayout.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import CompleteProfileView from "@/views/CompleteProfileView.vue";

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
    ],
})

export default router
