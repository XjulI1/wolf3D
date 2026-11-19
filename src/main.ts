import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'
import App from './App.vue'
import { createUpdateState } from './pwa/updateState'
import './style.css'

const updates = createUpdateState(import.meta.env.PROD && 'serviceWorker' in navigator ? registerSW : undefined)

createApp(App, { updates }).mount('#app')
