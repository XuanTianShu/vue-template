<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getComments } from '../services/firebase'
import type { Post, Comment, SubmitResult } from '../types'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'add-comment', postId: string, content: string): Promise<SubmitResult>
}>()

const comments = ref<Comment[]>([])
const newCommentContent = ref('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')
let commentsUnsubscribe: (() => void) | null = null

// Load comments when component mounts
onMounted(async () => {
  commentsUnsubscribe = await getComments(props.post.id, (newComments) => {
    comments.value = newComments
  })
})

onUnmounted(() => {
  if (commentsUnsubscribe) {
    commentsUnsubscribe()
  }
})

function handleBack() {
  emit('back')
}

async function handleSubmitComment() {
  if (!newCommentContent.value.trim()) {
    showFeedback('请输入评论内容', 'error')
    return
  }
  
  isSubmitting.value = true
  feedbackMessage.value = ''
  
  try {
    const result = await emit('add-comment', props.post.id, newCommentContent.value.trim())
    
    if (result.success) {
      showFeedback(result.message, 'success')
      newCommentContent.value = ''
    } else {
      showFeedback(result.message, 'error')
    }
  } catch (err) {
    showFeedback('评论失败，请重试', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function showFeedback(message: string, type: 'success' | 'error') {
  feedbackMessage.value = message
  feedbackType.value = type
  
  // Clear feedback after 3 seconds
  setTimeout(() => {
    feedbackMessage.value = ''
    feedbackType.value = ''
  }, 3000)
}

// Format date for display
function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) {
    return '刚刚'
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<template>
  <div class="page-detail-container">
    <div class="page-intro">
      <a href="#" class="back-link" @click.prevent="handleBack">
        <i class="fa-solid fa-arrow-left"></i> Back to all posts
      </a>
    </div>
    
    <div class="post-detail-layout">
      <div class="post-detail-main">
        <img :src="post.image" alt="Post image" class="detail-post-image" />
        <div class="post-full-content">
          <p>{{ post.content }}</p>
          <div class="post-meta">
            <span><i class="fa-solid fa-heart"></i> {{ post.likes }}</span>
            <span><i class="fa-solid fa-comment"></i> {{ comments.length }} comments</span>
          </div>
        </div>
        
        <hr>
        
        <div class="comments-section">
          <h2><span>{{ comments.length }}</span> Comments</h2>
          
          <div id="comment-list">
            <div class="comment-item" v-for="comment in comments" :key="comment.id">
              <p>{{ comment.content }}</p>
              <span class="comment-meta">{{ formatDate(comment.createdAt) }}</span>
            </div>
            
            <!-- Empty comments state -->
            <div v-if="comments.length === 0" class="empty-comments">
              <p>暂无评论，来抢沙发吧！</p>
            </div>
          </div>
          
          <div class="comment-form-container">
            <h3>Leave a Comment</h3>
            <div class="comment-form">
              <img src="https://i.pravatar.cc/50?u=current_user" alt="Your avatar" class="comment-avatar" />
              <textarea 
                v-model="newCommentContent" 
                placeholder="Add to the discussion..."
                :disabled="isSubmitting"
              ></textarea>
            </div>
            <button 
              id="submit-comment-btn" 
              @click="handleSubmitComment"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '发布中...' : 'Comment' }}
            </button>
            <p 
              v-if="feedbackMessage" 
              class="feedback-message"
              :class="{ success: feedbackType === 'success', error: feedbackType === 'error' }"
            >
              {{ feedbackMessage }}
            </p>
          </div>
        </div>
      </div>
      
      <aside class="post-detail-sidebar">
        <div class="sidebar-block author-block">
          <h3>Author</h3>
          <div class="author-info">
            <img src="https://i.pravatar.cc/80?u=post_author" alt="Author's avatar" class="author-avatar" />
            <h4>AnonymousUser</h4>
            <p>Just a voice in the void. Sharing thoughts and finding connections.</p>
            <button class="follow-btn">Follow</button>
          </div>
        </div>
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
</template>

<style scoped>
.page-detail-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-intro {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1890ff;
}

.post-detail-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}

.post-detail-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

.post-full-content {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.post-full-content p {
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: #888;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

hr {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 1rem 0;
}

.comments-section {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comments-section h2 {
  margin-top: 0;
  font-size: 1.4rem;
}

#comment-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.comment-item {
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
}

.comment-item p {
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
  color: #333;
}

.comment-meta {
  font-size: 0.85rem;
  color: #888;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #fafafa;
  border-radius: 8px;
}

.comment-form-container {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e5e5;
}

.comment-form-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.comment-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.comment-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-form textarea {
  flex: 1;
  min-height: 80px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
}

.comment-form textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

#submit-comment-btn {
  padding: 0.75rem 2rem;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

#submit-comment-btn:hover:not(:disabled) {
  background: #40a9ff;
}

#submit-comment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.feedback-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.feedback-message.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.feedback-message.error {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.post-detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-block {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sidebar-block h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.author-info {
  text-align: center;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.author-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.author-info p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.follow-btn {
  padding: 0.5rem 1.5rem;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.follow-btn:hover {
  background: #40a9ff;
}

.related-posts-block ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-posts-block li {
  margin-bottom: 0.75rem;
}

.related-posts-block li:last-child {
  margin-bottom: 0;
}

.related-posts-block a {
  color: #666;
  text-decoration: none;
  line-height: 1.4;
  transition: color 0.2s;
}

.related-posts-block a:hover {
  color: #1890ff;
}

@media (max-width: 992px) {
  .post-detail-layout {
    grid-template-columns: 1fr;
  }
  
  .post-detail-sidebar {
    display: none;
  }
}
</style>