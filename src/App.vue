<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePostsStore } from './stores/usePostsStore'
import { useThemeStore } from './stores/useThemeStore'
import type { Post, ThemeValue } from './types'
import PostList from './components/PostList.vue'
import PostDetail from './components/PostDetail.vue'
import CreatePostModal from './components/CreatePostModal.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Initialize stores
const postsStore = usePostsStore()
const themeStore = useThemeStore()

// Local UI state only (no shared state here)
const showCreateModal = ref(false)
const currentPage = ref<'home' | 'detail'>('home')

// Initialize app
onMounted(async () => {
  await postsStore.initialize()
})

// Computed state from stores
const currentTheme = computed(() => themeStore.currentTheme)
const posts = computed(() => postsStore.posts)
const selectedPost = computed(() => postsStore.currentPost)
const currentPostComments = computed(() => postsStore.currentPostComments)
const isLoading = computed(() => postsStore.isLoading)
const error = computed(() => postsStore.error)

// Theme switching - delegate to store
function setTheme(theme: ThemeValue) {
  themeStore.setTheme(theme)
}

// Navigation - delegate to store
function viewPostDetail(post: Post) {
  postsStore.viewPostDetail(post)
  currentPage.value = 'detail'
}

function goBackHome() {
  postsStore.goBackHome()
  currentPage.value = 'home'
}

// Create post - delegate to store
async function handleCreatePost(content: string): Promise<{ success: boolean; message: string }> {
  const result = await postsStore.createNewPost(content)
  if (result.success) {
    showCreateModal.value = false
  }
  return result
}

// Add comment - delegate to store
async function handleAddComment(postId: string, content: string): Promise<{ success: boolean; message: string }> {
  return postsStore.addNewComment(postId, content)
}
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