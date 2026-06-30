import request from '@/utils/request'
import type { Post, Comment, SubmitResult } from '@/types'

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 静态模拟数据 - 纯前端项目使用
const staticPosts: Post[] = [
  {
    id: generateId(),
    userId: 1,
    title: '欢迎来到这个社区！',
    content: '欢迎来到这个匿名社区！这是一个安全的空间，你可以在这里分享任何想法、经历或者创意。无论是技术讨论、生活感悟还是艺术创作，都欢迎大家踊跃发布。让我们一起构建一个包容友好的交流平台。',
    createdAt: new Date(Date.now() - 3600000),
    likes: 42,
    commentsCount: 8,
    author: '社区管理员',
    avatar: 'https://i.pravatar.cc/40?u=admin',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 2,
    title: 'Vue 3.4 新特性体验',
    content: '最近升级到Vue 3.4，发现defineModel真的太香了！还有响应式系统的性能提升，开发体验提升了一个档次。特别是<scipt setup>的语法糖越来越完善，代码写起来越来越简洁优雅。',
    createdAt: new Date(Date.now() - 7200000),
    likes: 89,
    commentsCount: 15,
    author: '前端老司机',
    avatar: 'https://i.pravatar.cc/40?u=vuefan',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 3,
    title: 'TypeScript 大型项目实践',
    content: '在团队中推行TypeScript已经两年了，从最开始的抵触到现在离不开。类型系统确实能在编译阶段捕获很多潜在bug，代码的可维护性提升非常明显。推荐所有中大型项目都尽早接入。',
    createdAt: new Date(Date.now() - 86400000),
    likes: 156,
    commentsCount: 32,
    author: '架构师小王',
    avatar: 'https://i.pravatar.cc/40?u=tslover',
    imageUrl: 'https://images.unsplash.com/photo-1592609931095-54a2168ae893?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 4,
    title: 'AI时代，我们该如何自处？',
    content: 'ChatGPT、Midjourney、Sora...AI的发展速度远超想象。作为开发者，我们是该焦虑还是拥抱变化？分享一些我的思考：保持学习的心态，把AI作为提升效率的工具，而不是竞争对手。',
    createdAt: new Date(Date.now() - 172800000),
    likes: 234,
    commentsCount: 67,
    author: '深度思考者',
    avatar: 'https://i.pravatar.cc/40?u=thinker',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 5,
    title: '《沙丘2》观影体验',
    content: '周末去看了《沙丘2》，维伦纽瓦真的是科幻片大师！视听语言太震撼了，电影院里的杜比全景声效果绝了。尤其是沙虫出场的那段，鸡皮疙瘩都起来了。强烈推荐去IMAX厅观看！',
    createdAt: new Date(Date.now() - 259200000),
    likes: 178,
    commentsCount: 45,
    author: '电影发烧友',
    avatar: 'https://i.pravatar.cc/40?u=moviebuff',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=725&q=80'
  },
  {
    id: generateId(),
    userId: 6,
    title: '上海的夜景真的太美了',
    content: '在外滩拍的夜景，浦东的摩天大楼灯火辉煌，陆家嘴的天际线真的是世界级的。作为一个在上海打拼了五年的外地人，这座城市既有冷漠的一面，也有温暖的时刻。',
    createdAt: new Date(Date.now() - 345600000),
    likes: 312,
    commentsCount: 89,
    author: '城市夜归人',
    avatar: 'https://i.pravatar.cc/40?u=nightcrawler',
    imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80'
  },
  {
    id: generateId(),
    userId: 7,
    title: '分享一套提升效率的VS Code插件',
    content: '整理了一些我日常开发中必不可少的VS Code插件，从代码格式化到Git集成，从调试工具到主题美化，这些插件几乎每天都在帮我节省时间。特别是Copilot和Error Lens，简直是开发神器。',
    createdAt: new Date(Date.now() - 432000000),
    likes: 445,
    commentsCount: 123,
    author: '效率控',
    avatar: 'https://i.pravatar.cc/40?u=efficiency',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  },
  {
    id: generateId(),
    userId: 8,
    title: '独居的第三年，我学会了这些',
    content: '一个人在大城市打拼，从最开始的手忙脚乱到现在的从容应对，学会了做饭、修理家电、独立面对各种困难。独居不是孤独，而是给自己与自己对话的机会。',
    createdAt: new Date(Date.now() - 518400000),
    likes: 567,
    commentsCount: 156,
    author: '独居青年',
    avatar: 'https://i.pravatar.cc/40?u=solo',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'
  }
]

// 获取帖子列表 - 支持搜索和分页过滤
export function getPosts(params?: { page?: number; size?: number; keyword?: string; category?: string }) {
  return new Promise<{ list: Post[]; total: number }>((resolve) => {
    setTimeout(() => {
      let filteredList = [...staticPosts]
      
      // 关键词搜索过滤
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(post => 
          post.title.toLowerCase().includes(keyword) || 
          post.content.toLowerCase().includes(keyword)
        )
      }
      
      // 分页处理
      const page = params?.page || 1
      const size = params?.size || 10
      const start = (page - 1) * size
      const paginatedList = filteredList.slice(start, start + size)
      
      resolve({
        list: paginatedList,
        total: filteredList.length
      })
    }, 300)
  })
}

// 获取单个帖子详情
export function getPostDetail(id: string) {
  return new Promise<{ post: Post; comments: Comment[] }>((resolve, reject) => {
    setTimeout(() => {
      const post = staticPosts.find(p => p.id === id)
      if (post) {
        // 模拟一些评论数据
        const mockComments: Comment[] = [
          {
            id: generateId(),
            content: '写得太好了，受益匪浅！',
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            id: generateId(),
            content: '同意你的观点，说的很有道理',
            createdAt: new Date(Date.now() - 1800000)
          },
          {
            id: generateId(),
            content: '学到了，感谢分享',
            createdAt: new Date(Date.now() - 900000)
          }
        ]
        resolve({
          post,
          comments: mockComments
        })
      } else {
        reject(new Error('帖子不存在'))
      }
    }, 300)
  })
}

// 创建新帖子
export function createPost(data: { content: string }) {
  // return request.post('/posts', data)
  return new Promise<SubmitResult>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '发布成功'
      })
    }, 300)
  })
}

// 添加评论
export function addComment(postId: string, data: { content: string }) {
  // return request.post(`/posts/${postId}/comments`, data)
  return new Promise<SubmitResult>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '评论成功'
      })
    }, 300)
  })
}

// 删除帖子
export function deletePost(id: string) {
  // return request.delete(`/posts/${id}`)
  return new Promise<SubmitResult>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '删除成功'
      })
    }, 300)
  })
}