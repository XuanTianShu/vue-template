<script setup lang="ts">
import { ref } from 'vue'
import type { SubmitResult } from '../types'

const props = defineProps<{
  show: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', content: string): Promise<SubmitResult>
}>()

const newPostContent = ref('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')

function handleClose() {
  newPostContent.value = ''
  feedbackMessage.value = ''
  feedbackType.value = ''
  emit('close')
}

async function handleSubmit() {
  if (!newPostContent.value.trim()) {
    showFeedback('请输入帖子内容', 'error')
    return
  }
  
  isSubmitting.value = true
  feedbackMessage.value = ''
  
  try {
    const result = await emit('submit', newPostContent.value.trim())
    
    if (result.success) {
      showFeedback(result.message, 'success')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } else {
      showFeedback(result.message, 'error')
    }
  } catch (err) {
    showFeedback('发布失败，请重试', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function showFeedback(message: string, type: 'success' | 'error') {
  feedbackMessage.value = message
  feedbackType.value = type
}
</script>

<template>
  <teleport to="body">
    <div 
      id="post-modal-overlay" 
      class="modal-overlay"
      :class="{ hidden: !props.show }"
    >
      <div class="modal-content">
        <button id="modal-close-btn" class="modal-close-btn" @click="handleClose">
          &times;
        </button>
        <h3>Create a New Post</h3>
        <textarea 
          v-model="newPostContent" 
          placeholder="What's on your mind?"
          :disabled="isSubmitting || (props.loading ?? false)"
        ></textarea>
        <button 
          id="submit-post-btn" 
          @click="handleSubmit"
          :disabled="isSubmitting || (props.loading ?? false)"
        >
          {{ (isSubmitting || (props.loading ?? false)) ? '发布中...' : '发布' }}
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
  </teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-overlay.hidden {
  display: none !important;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}

.modal-close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.modal-content textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.modal-content textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

#submit-post-btn {
  width: 100%;
  padding: 0.875rem;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

#submit-post-btn:hover:not(:disabled) {
  background: #40a9ff;
}

#submit-post-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.feedback-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
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
</style>