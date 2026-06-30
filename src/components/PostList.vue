<script setup lang="ts">
import type { Post } from '../types'

const props = defineProps<{
  posts: Post[]
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'view-detail', post: Post): void
}>()

const categories = [
  { icon: 'fa-bars', label: 'All', active: true },
  { icon: 'fa-file-alt', label: 'Articles', active: false },
  { icon: 'fa-video', label: 'Videos', active: false },
  { icon: 'fa-image', label: 'Pictures', active: false },
  { icon: 'fa-music', label: 'Audio', active: false },
]

const trending = [
  '#1 - The state of web development in 2026',
  '#2 - Is pixel art making a comeback?',
  '#3 - My journey into brutalist design',
  '#4 - Tips for staying anonymous online',
]

function handleViewDetails(post: Post) {
  emit('view-detail', post)
}
</script>

<template>
  <div class="home-layout">
    <!-- Left Sidebar -->
    <aside class="sidebar-left">
      <div class="sidebar-block category-block">
        <h3>Categories</h3>
        <ul>
          <li v-for="cat in categories" :key="cat.label" :class="{ active: cat.active }">
            <a href="#"><i :class="`fa-solid ${cat.icon}`"></i> {{ cat.label }}</a>
          </li>
        </ul>
      </div>
      <div class="sidebar-block ranking-block">
        <h3>Trending</h3>
        <ul>
          <li v-for="item in trending" :key="item">
            <a href="#">{{ item }}</a>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="content-notification">
        <i class="fa-solid fa-circle-info"></i>
        <span>Please be discerning and verify information. Don't be misled. To post, please use the official client.</span>
      </div>
      <div class="post-list-container">
        <h2>Latest Posts</h2>
        
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <p>正在加载中...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <p>加载失败，请检查网络...</p>
        </div>
        
        <!-- Posts list -->
        <div id="post-list" v-else>
          <div 
            class="post-item" 
            :data-id="post.id" 
            v-for="post in posts" 
            :key="post.id"
          >
            <img :src="post.image" alt="Post image" class="post-image" />
            <div class="post-content">
              <p>{{ post.content }}</p>
              <div class="post-meta">
                <span><i class="fa-solid fa-heart"></i> {{ post.likes }}</span>
                <span><i class="fa-solid fa-comment"></i> {{ post.commentsCount }} comments</span>
                <a href="#" class="view-details-link" @click.prevent="handleViewDetails(post)">View Details</a>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-if="posts.length === 0" class="empty-state">
            <p>暂无帖子，来发布第一条吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-block {
  padding: 1.5rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sidebar-block h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-block ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-block li {
  margin-bottom: 0.75rem;
}

.sidebar-block li:last-child {
  margin-bottom: 0;
}

.sidebar-block a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.sidebar-block a:hover {
  color: #1890ff;
}

.sidebar-block li.active a {
  color: #1890ff;
  font-weight: 500;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-notification {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #e6f7ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 0.9rem;
}

.post-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-list-container h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

#post-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.post-image {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.post-content p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #333;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #888;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.view-details-link {
  margin-left: auto;
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.loading-state, .error-state, .empty-state {
  padding: 3rem;
  text-align: center;
  color: #666;
  background: #fafafa;
  border-radius: 12px;
}

@media (max-width: 992px) {
  .home-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar-left {
    display: none;
  }
  
  .post-item {
    flex-direction: column;
  }
  
  .post-image {
    width: 100%;
    height: 200px;
  }
}
</style>