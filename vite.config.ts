import {fileURLToPath, URL} from 'node:url'

import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import fs from 'fs'
import path from 'path'

export default defineConfig(({mode}) => {
    loadEnv(mode, process.cwd(), '');
    return {
        server: {
            https: {
                key: fs.readFileSync(path.resolve(__dirname, '.certs/localhost-key.pem')),
                cert: fs.readFileSync(path.resolve(__dirname, '.certs/localhost.pem'))
            },
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
