<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { initFirebase, createPost, getPosts, addComment } from './services/firebase'
import { checkRateLimit, updateLastPostTime } from './utils/rateLimit'
import { AVAILABLE_THEMES, DEFAULT_THEME, getThemePath, type ThemeValue } from './constants/themes'
import type { Post } from './types'
import PostList from './components/PostList.vue'
import PostDetail from './components/PostDetail.vue'
import CreatePostModal from './components/CreatePostModal.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Current page state
const currentPage = ref<'home' | 'detail'>('home')
const selectedPost = ref<Post | null>(null)
const showCreateModal = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const firebaseReady = ref(false)

// Theme state
const storedTheme = localStorage.getItem('selectedTheme')
const isValidTheme = (theme: string | null): theme is ThemeValue => {
  return AVAILABLE_THEMES.some(t => t.value === theme)
}
const currentTheme = ref<ThemeValue>(isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME)

// Posts state
const posts = ref<Post[]>([])
let postsUnsubscribe: (() => void) | null = null

// Initialize Firebase
onMounted(async () => {
  const result = await initFirebase()
  firebaseReady.value = result.ready
  
  // Load posts
  if (result.ready) {
    postsUnsubscribe = await getPosts((newPosts) => {
      posts.value = newPosts
    })
  }
})

onUnmounted(() => {
  if (postsUnsubscribe) {
    postsUnsubscribe()
  }
})

// Theme switching
function setTheme(theme: ThemeValue) {
  currentTheme.value = theme
  localStorage.setItem('selectedTheme', theme)
  updateThemeStylesheet(theme)
}

function updateThemeStylesheet(themeName: ThemeValue) {
  const themePath = getThemePath(themeName)
  let themeLink = document.getElementById('theme-stylesheet-dynamic') as HTMLLinkElement
  
  if (!themeLink) {
    themeLink = document.createElement('link')
    themeLink.rel = 'stylesheet'
    themeLink.id = 'theme-stylesheet-dynamic'
    document.head.appendChild(themeLink)
  }
  themeLink.href = themePath
}

// Navigation
function viewPostDetail(post: any) {
  selectedPost.value = post
  currentPage.value = 'detail'
  window.scrollTo(0, 0)
}

function goBackHome() {
  currentPage.value = 'home'
  selectedPost.value = null
}

// Create post
async function handleCreatePost(content: string): Promise<{ success: boolean; message: string }> {
  // Check rate limit
  if (!checkRateLimit()) {
    return { success: false, message: '发布过于频繁，请5分钟后再试' }
  }
  
  try {
    await createPost(content)
    updateLastPostTime()
    return { success: true, message: '发布成功！' }
  } catch (err) {
    return { success: false, message: '发布失败，请重试' }
  }
}

// Add comment
async function handleAddComment(postId: string, content: string): Promise<{ success: boolean; message: string }> {
  if (!checkRateLimit()) {
    return { success: false, message: '评论过于频繁，请5分钟后再试' }
  }
  
  try {
    await addComment(postId, content)
    updateLastPostTime()
    return { success: true, message: '评论成功！' }
  } catch (err) {
    return { success: false, message: '评论失败，请重试' }
  }
}

// Initialize theme on mount
onMounted(() => {
  updateThemeStylesheet(currentTheme.value)
})
</script>

<template>
  <div class="app-container">
    <Header 
      :current-theme="currentTheme" 
      @theme-change="setTheme"
    />
    
    <main>
      <!-- Home Page -->
      <div id="page-home" class="page" :class="{ hidden: currentPage !== 'home' }">
        <PostList 
          :posts="posts" 
          :loading="isLoading"
          :error="error"
          @view-detail="viewPostDetail"
        />
      </div>
      
      <!-- Detail Page -->
      <div id="page-detail" class="page" :class="{ hidden: currentPage !== 'detail' }">
        <PostDetail 
          v-if="selectedPost"
          :post="selectedPost"
          @back="goBackHome"
          @add-comment="handleAddComment"
        />
      </div>
    </main>
    
    <Footer />
    
    <!-- Create Post Modal -->
    <CreatePostModal 
      :show="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleCreatePost"
    />
    
    <!-- Floating Action Button to create post -->
    <div class="fab-container">
      <button 
        id="fab-create-post" 
        class="fab" 
        title="Create Post"
        @click="showCreateModal = true"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>
</template>

<style>
/* Basic layout styles that apply to all themes */
body {
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s, color 0.3s;
  margin: 0;
  padding: 0;
}

.hidden {
  display: none !important;
}

.page {
  padding: 20px;
}

.fab-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>