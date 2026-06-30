import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { Post, Comment } from '../types'
import { initFirebase, getPosts, getComments, createPost, addComment } from '../services/firebase'
import { checkRateLimit, updateLastPostTime } from '../utils/rateLimit'

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const currentPostComments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const firebaseReady = ref(false)
  
  // Unsubscribe functions
  let postsUnsubscribe: (() => void) | null = null
  let commentsUnsubscribe: (() => void) | null = null

  // Initialize Firebase and start listening to posts
  async function initialize() {
    const result = await initFirebase()
    firebaseReady.value = result.ready
    
    if (result.ready) {
      postsUnsubscribe = await getPosts((newPosts) => {
        posts.value = newPosts
      })
    }
  }

  // Cleanup subscriptions
  function cleanup() {
    if (postsUnsubscribe) {
      postsUnsubscribe()
      postsUnsubscribe = null
    }
    if (commentsUnsubscribe) {
      commentsUnsubscribe()
      commentsUnsubscribe = null
    }
  }

  // View post details and load its comments
  async function viewPostDetail(post: Post) {
    currentPost.value = post
    window.scrollTo(0, 0)
    
    // Load comments for this post
    if (firebaseReady.value) {
      commentsUnsubscribe = await getComments(post.id, (comments) => {
        currentPostComments.value = comments
      })
    }
  }

  // Go back to home page
  function goBackHome() {
    currentPost.value = null
    currentPostComments.value = []
    if (commentsUnsubscribe) {
      commentsUnsubscribe()
      commentsUnsubscribe = null
    }
  }

  // Create a new post with rate limiting
  async function createNewPost(content: string): Promise<{ success: boolean; message: string }> {
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

  // Add comment to current post
  async function addNewComment(postId: string, content: string): Promise<{ success: boolean; message: string }> {
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

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    posts,
    currentPost,
    currentPostComments,
    isLoading,
    error,
    firebaseReady,
    
    // Actions
    initialize,
    cleanup,
    viewPostDetail,
    goBackHome,
    createNewPost,
    addNewComment
  }
})