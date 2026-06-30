import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 挂载到index.html的#app节点
app.mount('#app')