import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 配置多入口：保留原始设计图index.html不受影响，提供Vue版本的app-vue.html
  build: {
    rollupOptions: {
      input: {
        // 原始设计图文件 - 保持完全不动，作为参考原型
        design: resolve(__dirname, 'index.html'),
        // Vue技术栈重新实现的版本 - 新的入口
        vueapp: resolve(__dirname, 'app-vue.html')
      }
    }
  },
  server: {
    port: 3000,
    open: '/app-vue.html', // 开发服务器默认打开Vue实现版本
  },
})