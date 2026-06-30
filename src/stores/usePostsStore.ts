import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post, Comment } from '../types'
import { checkRateLimit, updateLastPostTime } from '../utils/rateLimit'

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 初始化模拟数据
const initialPosts: Post[] = [
  {
    id: generateId(),
    content: '欢迎来到这个社区！这是一个匿名分享的平台，你可以在这里发布任何想法。',
    createdAt: new Date(Date.now() - 3600000),
    likes: 12,
    commentCount: 3,
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: generateId(),
    content: 'Vue 3的Composition API真的太好用了，代码组织变得更加清晰。',
    createdAt: new Date(Date.now() - 7200000),
    likes: 28,
    commentCount: 5,
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: generateId(),
    content: 'TypeScript让JavaScript开发变得更加可靠，大型项目维护起来轻松很多。',
    createdAt: new Date(Date.now() - 86400000),
    likes: 45,
    commentCount: 8,
    image: 'https://picsum.photos/400/300?random=3'
  }
]

// 初始化模拟评论数据
const commentsMap: Map<string, Comment[]> = new Map()
commentsMap.set(initialPosts[0].id, [
  {
    id: generateId(),
    content: '说得真好！支持你',
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: generateId(),
    content: '我也这么认为',
    createdAt: new Date(Date.now() - 900000)
  }
])

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([...initialPosts])
  const currentPost = ref<Post | null>(null)
  const currentPostComments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 初始化 - 加载本地数据
  async function initialize() {
    isLoading.value = true
    error.value = null
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      isLoading.value = false
    } catch (err) {
      error.value = '加载失败'
      isLoading.value = false
    }
  }

  // View post details and load its comments
  async function viewPostDetail(post: Post) {
    currentPost.value = post
    window.scrollTo(0, 0)
    
    // 从本地map加载评论
    const comments = commentsMap.get(post.id) || []
    currentPostComments.value = comments
  }

  // Go back to home page
  function goBackHome() {
    currentPost.value = null
    currentPostComments.value = []
  }

  // Create a new post with rate limiting
  async function createNewPost(content: string): Promise<{ success: boolean; message: string }> {
    if (!checkRateLimit()) {
      return { success: false, message: '发布过于频繁，请5分钟后再试' }
    }
    
    try {
      const newPost: Post = {
        id: generateId(),
        content,
        createdAt: new Date(),
        likes: 0,
        commentCount: 0,
        image: `https://picsum.photos/400/300?random=${Date.now()}`
      }
      
      // 添加到帖子列表开头
      posts.value.unshift(newPost)
      // 初始化该帖子的评论数组
      commentsMap.set(newPost.id, [])
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
      const newComment: Comment = {
        id: generateId(),
        content,
        createdAt: new Date()
      }
      
      // 添加到当前帖子的评论列表
      currentPostComments.value.push(newComment)
      
      // 更新map中的评论数据
      const existingComments = commentsMap.get(postId) || []
      existingComments.push(newComment)
      commentsMap.set(postId, existingComments)
      
      // 更新帖子的评论数量
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.commentCount++
      }
      
      updateLastPostTime()
      return { success: true, message: '评论成功！' }
    } catch (err) {
      return { success: false, message: '评论失败，请重试' }
    }
  }

  return {
    // State
    posts,
    currentPost,
    currentPostComments,
    isLoading,
    error,
    
    // Actions
    initialize,
    viewPostDetail,
    goBackHome,
    createNewPost,
    addNewComment
  }
})