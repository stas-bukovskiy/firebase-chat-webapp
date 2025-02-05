import {createApp, markRaw} from 'vue'
import {createPinia} from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css'

import naive from 'naive-ui'
import router from './router'
import VueChatScroll from 'vue3-chat-scroll';
import {VueFire} from 'vuefire'
import {app as firebaseApp} from './firebase'

import App from './App.vue'


const app = createApp(App)

app.use(naive)
app.use(router)

const pinia = createPinia()
pinia.use(({ store }) => {
    store.router = markRaw(router);
})
app.use(pinia)

app.use(VueChatScroll)
app.use(VueFire, {
    firebaseApp,
    modules: [],
})

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//         .register('/firebase-messaging-sw.js')
//         .then((registration) => {
//             console.log('Service Worker registered with scope:', registration.scope)
//         })
//         .catch((err) => {
//             console.error('Service Worker registration failed:', err)
//         })
// }

app.mount('#app')
