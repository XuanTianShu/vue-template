import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post, Comment } from '../../types'
import { checkRateLimit, updateLastPostTime } from '../../utils/rateLimit'
import { getPosts, getPostDetail, createPost, addComment } from '@/api/posts'

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 初始化模拟数据
const initialPosts: Post[] = [
  {
    id: generateId(),
    userId: 1,
    title: '欢迎来到这个社区！',
    content: '欢迎来到这个社区！这是一个匿名分享的平台，你可以在这里发布任何想法。',
    createdAt: new Date(Date.now() - 3600000),
    likes: 12,
    commentsCount: 3,
    author: 'Admin',
    avatar: 'https://i.pravatar.cc/40?u=admin',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 2,
    title: 'Vue 3 Composition API',
    content: 'Vue 3的Composition API真的太好用了，代码组织变得更加清晰。',
    createdAt: new Date(Date.now() - 7200000),
    likes: 28,
    commentsCount: 5,
    author: 'VueFan',
    avatar: 'https://i.pravatar.cc/40?u=vuefan',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 3,
    title: 'TypeScript 的优势',
    content: 'TypeScript让JavaScript开发变得更加可靠，大型项目维护起来轻松很多。',
    createdAt: new Date(Date.now() - 86400000),
    likes: 45,
    commentsCount: 8,
    author: 'TSLover',
    avatar: 'https://i.pravatar.cc/40?u=tslover',
    imageUrl: 'https://images.unsplash.com/photo-1592609931095-54a2168ae893?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 4,
    title: '关于未来的思考',
    content: '人工智能会取代我们的工作吗？这是一个值得深思的问题。',
    createdAt: new Date(Date.now() - 172800000),
    likes: 102,
    commentsCount: 25,
    author: 'Thinker',
    avatar: 'https://i.pravatar.cc/40?u=thinker',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 5,
    title: '一部电影的观后感',
    content: '昨天看了一部非常棒的科幻电影，推荐给大家！视觉效果和剧情都堪称一流。',
    createdAt: new Date(Date.now() - 259200000),
    likes: 76,
    commentsCount: 15,
    author: 'MovieBuff',
    avatar: 'https://i.pravatar.cc/40?u=moviebuff',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=725&q=80'
  },
  {
    id: generateId(),
    userId: 6,
    title: '城市夜景',
    content: '夜晚的城市总是那么迷人，灯火辉煌，车水马龙。',
    createdAt: new Date(Date.now() - 345600000),
    likes: 98,
    commentsCount: 18,
    author: 'NightCrawler',
    avatar: 'https://i.pravatar.cc/40?u=nightcrawler',
    imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80'
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

  // 获取帖子列表 - 支持分页、搜索、分类筛选
  async function fetchPosts(params: { page?: number; size?: number; keyword?: string; category?: string } = {}) {
    isLoading.value = true
    error.value = null
    try {
      const result = await getPosts(params)
      posts.value = result.list
      return { success: true, data: result }
    } catch (err) {
      error.value = '加载帖子列表失败'
      return { success: false, message: '加载失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个帖子详情
  async function fetchPostDetail(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await getPostDetail(id)
      currentPost.value = result.post
      currentPostComments.value = result.comments
      return { success: true, data: result }
    } catch (err) {
      error.value = '加载帖子详情失败'
      return { success: false, message: '加载失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 初始化 - 加载本地数据
  async function initialize() {
    await fetchPosts()
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
        userId: 0, // Or a proper user ID
        title: '', // Add a title
        author: 'CurrentUser', // Or a dynamic author
        avatar: 'https://i.pravatar.cc/40?u=currentuser', // Or a dynamic avatar
        content,
        createdAt: new Date(),
        likes: 0,
        commentsCount: 0,
        imageUrl: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80`
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
        post.commentsCount++
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
    fetchPosts,
    fetchPostDetail,
    viewPostDetail,
    goBackHome,
    createNewPost,
    addNewComment
  }
})