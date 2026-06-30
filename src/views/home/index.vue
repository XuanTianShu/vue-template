<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { usePostsStore } from '@/stores/modules/posts'
import { useThemeStore } from '@/stores/modules/theme'
import { InfoFilled, Plus } from '@element-plus/icons-vue'
import PostCard from './components/PostCard.vue'
import LeftSidebar from './components/LeftSidebar.vue'
import CreatePostModal from '@/components/CreatePostModal.vue'
import type { Post } from '@/types'
import { ElMessage, ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
const postsStore = usePostsStore()
const themeStore = useThemeStore()
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')
const selectedCategory = ref('all')
const showCreateModal = ref(false)
const isSubmitting = ref(false)

// 分页参数
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 计算属性
const posts = computed(() => postsStore.posts)
const isLoading = computed(() => postsStore.isLoading)
const error = computed(() => postsStore.error)

// 防抖搜索 - 使用vueuse的useDebounceFn
const handleSearch = useDebounceFn((keyword: string) => {
  postsStore.fetchPosts({
    page: pagination.value.page,
    size: pagination.value.size,
    keyword,
    category: selectedCategory.value
  })
}, 300)

// 分类切换
function handleCategoryChange(category: string) {
  selectedCategory.value = category
  postsStore.fetchPosts({
    page: 1,
    size: pagination.value.size,
    keyword: searchKeyword.value,
    category
  })
}

// 创建新帖子
async function handleCreatePost(content: string) {
  isSubmitting.value = true
  try {
    const result = await postsStore.createNewPost(content)
    if (result.success) {
      showCreateModal.value = false
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
    return result
  } finally {
    isSubmitting.value = false
  }
}

// 查看帖子详情
function handleViewPost(post: Post) {
  // 使用Vue Router的push方法进行客户端路由跳转
  router.push(`/post/${post.id}`)
}

// 回到顶部相关状态
const showBackToTop = ref(false)

// 滚动监听
function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

// 回到顶部
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 打开创建弹窗
function openCreateModal() {
  showCreateModal.value = true
}

// 页面初始化
onMounted(async () => {
  await postsStore.initialize()
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时清理监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="home-page">
    <div class="home-layout">
      <!-- 左侧边栏 -->
      <LeftSidebar 
        :selected-category="selectedCategory"
        @category-change="handleCategoryChange"
      />
      
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 通知提示 - 与原始UI完全一致 -->
        <div class="content-notification">
          <i class="fa-solid fa-circle-info"></i>
          <span>Please be discerning and verify information. Don't be misled. To post, please use the official client.</span>
        </div>
        
        <!-- 帖子列表 - 与原始UI完全一致 -->
        <div class="post-list-container">
          <h2>Latest Posts</h2>
          <el-empty v-if="!isLoading && posts.length === 0" description="No posts yet" />
          
          <div id="post-list" v-loading="isLoading" class="posts-container">
            <PostCard 
              v-for="(post, index) in posts" 
              :key="post.id"
              :post="post"
              :index="index"
              @view-detail="handleViewPost"
            />
          </div>
          
          <!-- 分页 -->
          <el-pagination
            v-if="pagination.total > 0"
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            @size-change="handleSearch(searchKeyword)"
            @current-change="handleSearch(searchKeyword)"
            class="pagination"
          />
        </div>
      </div>
    </div>
    
    <!-- 创建帖子弹窗 -->
    <CreatePostModal
      :show="showCreateModal"
      :loading="isSubmitting"
      @close="showCreateModal = false"
      @submit="handleCreatePost"
    />
    
    <!-- 浮动操作按钮 FAB -->
    <div class="fab-container">
      <button 
        id="fab-back-to-top" 
        class="fab" 
        :class="{ 'fab-hidden': !showBackToTop }"
        @click="scrollToTop"
        aria-label="回到顶部"
      >
        <!-- 使用内联SVG以精确匹配UI -->
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M512 320 192 704h640L512 320z"></path></svg>
      </button>
      <button 
        id="fab-create-post" 
        class="fab"
        @click="openCreateModal"
        aria-label="创建新帖子"
      >
        <el-icon :size="24"><Plus /></el-icon>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">


.home-page {
  padding: $spacing-md;
  min-height: calc(100vh - 120px);
  background-color: var(--bg-color);
}

.home-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.content-notification {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 8px);
  padding: 15px 20px;
  margin-bottom: 30px;
  font-size: 0.95em;
  
  span {
    color: var(--text-color);
  }
}

.post-list-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  h2 {
    margin: 0;
    color: var(--text-color);
    font-size: $font-size-xl;
    font-weight: 600;
  }
  
  #post-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0;
    border: none;
    
    // 为每个帖子添加渐进式延迟，与原始ui.html动画逻辑完全一致
    .post-item:nth-child(1) { transition-delay: 0.1s; }
    .post-item:nth-child(2) { transition-delay: 0.2s; }
    .post-item:nth-child(3) { transition-delay: 0.3s; }
    .post-item:nth-child(4) { transition-delay: 0.4s; }
    .post-item:nth-child(5) { transition-delay: 0.5s; }
    .post-item:nth-child(6) { transition-delay: 0.6s; }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: $spacing-lg;
  }
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
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transform: translateY(-3px);
  }
}

#fab-create-post {
  background-color: #007bff;
}

#fab-back-to-top {
  background-color: #6c757d;
}

.hidden {
  display: none !important;
}



// 错误状态样式
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  text-align: center;
  
  .error-text {
    color: $danger-color;
    margin-bottom: $spacing-md;
  }
}
</style>