/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型定义
interface ImportMetaEnv {
  // 应用名称
  readonly VITE_APP_TITLE: string
  // API基础地址
  readonly VITE_API_BASE_URL: string
  // 是否开启调试模式
  readonly VITE_DEBUG: string
  // 网站域名
  readonly VITE_APP_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}