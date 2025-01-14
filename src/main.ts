import {createApp} from 'vue'
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

app.use(createPinia())
app.use(naive)
app.use(router)
app.use(VueChatScroll)
app.use(VueFire, {
    firebaseApp,
    modules: [],
})

app.mount('#app')
