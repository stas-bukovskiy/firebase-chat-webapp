import {fileURLToPath, URL} from 'node:url'

import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import fs from 'fs'
import path from 'path'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            https: {
                key: fs.readFileSync(path.resolve(__dirname, '.certs/localhost-key.pem')),
                cert: fs.readFileSync(path.resolve(__dirname, '.certs/localhost.pem'))
            },
        },
        define: {
            "process.env.FIREBASE_API_KEY": JSON.stringify(env.FIREBASE_API_KEY),
            "process.env.FIREBASE_AUTH_DOMAIN": JSON.stringify(env.FIREBASE_AUTH_DOMAIN),
            "process.env.FIREBASE_PROJECT_ID": JSON.stringify(env.FIREBASE_PROJECT_ID),
            "process.env.FIREBASE_STORAGE_BUCKET": JSON.stringify(env.FIREBASE_STORAGE_BUCKET),
            "process.env.FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID),
            "process.env.FIREBASE_APP_ID": JSON.stringify(env.FIREBASE_APP_ID),
            "process.env.FIREBASE_MEASUREMENT_ID": JSON.stringify(env.FIREBASE_MEASUREMENT_ID),
            "process.env.FIREBASE_VAPID_KEY": JSON.stringify(env.FIREBASE_VAPID_KEY),
        },
        plugins: [
            vue({features: {propsDestructure: true}}),
            vueDevTools(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
    }
})
