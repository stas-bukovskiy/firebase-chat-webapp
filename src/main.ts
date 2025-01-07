import {createApp} from 'vue'
import {createPinia} from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css';

import './assets/main.css'

import naive from 'naive-ui'

import App from './App.vue'
import router from './router'

import VueChatScroll from 'vue3-chat-scroll';


const app = createApp(App)

app.use(createPinia())
app.use(naive)
app.use(router)
app.use(VueChatScroll)

app.mount('#app')
