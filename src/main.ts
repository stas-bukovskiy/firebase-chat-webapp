import {createApp, markRaw} from 'vue'
import {createPinia} from 'pinia'

import {auth} from "@/firebase";
import {onAuthStateChanged} from "firebase/auth";

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css'

import naive from 'naive-ui'
import router from './router'
import {VueFire} from 'vuefire'
import {app as firebaseApp} from './firebase'

import {install as installDirectives} from "@/directives/intersect.ts";

import App from './App.vue'
import {useCurrentUserStore} from "@/stores/current-user.ts";


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope)
        })
        .catch((err) => {
            console.error('Service Worker registration failed:', err)
        })
}


let appMounted = false;

onAuthStateChanged(auth, user => {
    const pinia = createPinia()
    pinia.use(({store}) => {
        store.router = markRaw(router);
    })

    // populate your store with the user (or clear it)
    const store = useCurrentUserStore(pinia);
    store.setRawUser(user);

    // mount app once
    if (!appMounted) {
        const app = createApp(App)
            .use(pinia)
            .use(router)
            .use(naive)
            .use(VueFire, {
                firebaseApp,
                modules: [],
            });

        installDirectives(app);

        app.mount("#app");

        appMounted = true;
    }
});
