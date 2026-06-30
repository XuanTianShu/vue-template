import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 挂载到app-vue.html的#app节点
app.mount('#app')