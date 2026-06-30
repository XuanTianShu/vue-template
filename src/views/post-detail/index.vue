<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/modules/posts'
import type { Comment } from '@/types'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

// 表单数据
const commentContent = ref('')
const isSubmitting = ref(false)

// 获取路由参数
const postId = computed(() => route.params.id as string)
const currentPost = computed(() => postsStore.currentPost)
const postComments = computed(() => postsStore.currentPostComments)
const isLoading = computed(() => postsStore.isLoading)

// 返回首页
function goBack() {
  router.push('/')
}

// 提交评论
async function handleAddComment() {
  if (!commentContent.value.trim()) {
    ElMessage.warning('Please enter comment content')
    return
  }
  
  isSubmitting.value = true
  try {
    const result = await postsStore.addNewComment(postId.value, commentContent.value)
    if (result.success) {
      commentContent.value = ''
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    isSubmitting.value = false
  }
}

// 页面初始化
onMounted(async () => {
  if (postId.value) {
    await postsStore.fetchPostDetail(postId.value)
  }
})
</script>

<template>
  <div class="detail-page">
    <!-- 页面头部 - 与原始UI完全一致 -->
    <div class="page-intro">
      <a href="#" @click.prevent="goBack" class="back-link">
        <i class="fa-solid fa-arrow-left"></i> Back to all posts
      </a>
    </div>
    
    <div v-if="currentPost" v-loading="isLoading" class="post-detail-card">
      <div class="post-detail-layout">
        <div class="post-detail-main">
          <img 
            v-if="currentPost.imageUrl"
            :src="currentPost.imageUrl"
            alt="Post image"
            class="detail-post-image"
            id="detail-post-image"
          />
            <div class="post-full-content">
              <p>{{ currentPost.content }}</p>
              <div class="post-meta">
                <span>
                  <el-icon><Star /></el-icon>
                  {{ currentPost.likes }}
                </span>
                <span>
                  <el-icon><ChatDotRound /></el-icon>
                  {{ currentPost.commentsCount }} 评论
                </span>
              </div>
            </div>
            
            <hr />
            
            <!-- 评论区 - 与原始UI完全一致 -->
            <div class="comments-section">
              <h2><span id="detail-comment-count">{{ postComments.length }}</span> Comments</h2>
              
              <div id="comment-list" class="comment-list">
                <div 
                  v-for="comment in postComments" 
                  :key="comment.id"
                  class="comment-item"
                >
                  <p>{{ comment.content }}</p>
                  <span class="comment-meta">
                    {{ formatTime(comment.createdAt) }}
                  </span>
                </div>
                
                <el-empty v-if="postComments.length === 0" description="No comments yet. Be the first to comment!" />
              </div>
              
              <!-- 发表评论表单 - 与原始UI一致 -->
              <div class="comment-form-container">
                <h3>Leave a Comment</h3>
                <div class="comment-form">
                  <img src="https://i.pravatar.cc/50?u=current_user" alt="Your avatar" class="comment-avatar" />
                  <textarea 
                    v-model="commentContent"
                    id="new-comment-content"
                    placeholder="Add to the discussion..."
                    :disabled="isSubmitting"
                  ></textarea>
                </div>
                <button 
                  id="submit-comment-btn"
                  @click="handleAddComment"
                  :disabled="isSubmitting || !commentContent.trim()"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
          
          <!-- 右侧边栏 - 与原始UI完全一致 -->
          <aside class="post-detail-sidebar">
            <!-- 作者信息 -->
            <div class="sidebar-block author-block">
              <h3>Author</h3>
              <div class="author-info">
                <img src="https://i.pravatar.cc/80?u=post_author" alt="Author's avatar" class="author-avatar" />
                <h4>AnonymousUser</h4>
                <p>Just a voice in the void. Sharing thoughts and finding connections.</p>
                <button class="follow-btn">Follow</button>
              </div>
            </div>
            
            <!-- 相关帖子 -->
            <div class="sidebar-block related-posts-block">
              <h3>Related Posts</h3>
              <ul>
                <li><a href="#">Exploring the depths of the web</a></li>
                <li><a href="#">The philosophy of anonymity</a></li>
                <li><a href="#">A look at modern UI trends</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    
    <!-- 错误状态 - 与原始UI一致 -->
    <el-empty v-if="!currentPost && !isLoading" description="Post not found or has been deleted">
      <el-button type="primary" @click="goBack">Back to home</el-button>
    </el-empty>
  </div>
</template>

<style scoped lang="scss">


.detail-page {
  padding: $spacing-md;
  min-height: calc(100vh - 120px);
  background-color: $bg-page-color;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-md;
}

.post-detail-card {
  border-radius: $border-radius-md;
  overflow: hidden;
}

.post-detail-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: $spacing-lg;
}

.post-detail-main {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  .detail-post-image {
    width: 100%;
    max-height: 400px;
    border-radius: $border-radius-md;
  }
  
  .post-full-content {
    p {
      color: $text-primary;
      line-height: 1.8;
      font-size: $font-size-md;
      margin: 0 0 $spacing-md 0;
    }
    
    .post-meta {
      display: flex;
      gap: $spacing-lg;
      
      span {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        color: $text-secondary;
        font-size: $font-size-sm;
        
        .el-icon {
          color: $danger-color;
        }
      }
    }
  }
  
  .comments-section {
    h2 {
      margin: $spacing-lg 0 $spacing-md 0;
      color: $text-primary;
      font-size: $font-size-lg;
    }
    
    .comment-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      margin-bottom: $spacing-lg;
      
      .comment-item {
        padding: $spacing-md;
        background-color: $bg-page-color;
        border-radius: $border-radius-sm;
        
        p {
          margin: 0 0 $spacing-xs 0;
          color: $text-primary;
          line-height: 1.6;
        }
        
        .comment-meta {
          color: $text-secondary;
          font-size: $font-size-xs;
        }
      }
    }
    
    .comment-form-container {
      h3 {
        margin: 0 0 $spacing-md 0;
        color: $text-primary;
        font-size: $font-size-md;
      }
      
      .comment-form {
        display: flex;
        gap: $spacing-md;
        margin-bottom: $spacing-md;
        
        .el-avatar {
          flex-shrink: 0;
        }
        
        .el-textarea__inner {
          resize: vertical;
        }
      }
    }
  }
}

.post-detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  
  .sidebar-block {
    background-color: $bg-color;
    border-radius: $border-radius-md;
    padding: $spacing-md;
    box-shadow: $box-shadow-base;
    
    h3 {
      margin: 0 0 $spacing-md 0;
      color: $text-primary;
      font-size: $font-size-md;
      font-weight: 600;
      border-bottom: 1px solid $border-light-color;
      padding-bottom: $spacing-sm;
    }
    
    .author-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: $spacing-sm;
      
      h4 {
        margin: $spacing-sm 0 $spacing-xs 0;
        color: $text-primary;
      }
      
      p {
        margin: 0;
        color: $text-secondary;
        font-size: $font-size-xs;
        line-height: 1.5;
      }
    }
    
    .related-posts-block {
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          padding: $spacing-xs 0;
          
          a {
            color: $text-regular;
            text-decoration: none;
            font-size: $font-size-sm;
            transition: $transition-base;
            
            &:hover {
              color: $primary-color;
            }
          }
        }
      }
    }
  }
}

hr {
  border: none;
  border-top: 1px solid $border-light-color;
  margin: $spacing-lg 0;
}
</style>