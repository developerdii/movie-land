import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import '@/assets/scss/app.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')


