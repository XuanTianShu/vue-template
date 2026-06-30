<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePostsStore, useThemeStore } from '@/stores'
import type { ThemeValue } from './types'
import CreatePostModal from './components/CreatePostModal.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'

// Initialize stores
const postsStore = usePostsStore()
const themeStore = useThemeStore()

// Local UI state only (no shared state here)
const showCreateModal = ref(false)
const isSubmitting = ref(false)

// Initialize app
onMounted(async () => {
  await postsStore.initialize()
})

// Computed state from stores
const currentTheme = computed(() => themeStore.currentTheme)

// Theme switching - delegate to store
function setTheme(theme: ThemeValue) {
  themeStore.setTheme(theme)
}

// Create post - delegate to store
async function handleCreatePost(content: string): Promise<{ success: boolean; message: string }> {
  isSubmitting.value = true
  try {
    const result = await postsStore.createNewPost(content)
    if (result.success) {
      showCreateModal.value = false
    }
    return result
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <Header 
      :current-theme="currentTheme" 
      @theme-change="setTheme"
    />
    
    <main>
      <!-- 路由视图，由vue-router管理页面切换 -->
      <RouterView />
    </main>
    
    <Footer />
    
    <!-- Create Post Modal -->
    <CreatePostModal 
      :show="showCreateModal"
      :loading="isSubmitting"
      @close="showCreateModal = false"
      @submit="handleCreatePost"
    />
    
  </div>
</template>

<style>
/* 全局基础重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  width: 100%;
  margin: 0;
  padding-bottom: 80px; /* 给所有页面添加底部padding，避免被固定footer遮挡 */
}

/* 全局工具类 */
.hidden {
  display: none !important;
}
</style>