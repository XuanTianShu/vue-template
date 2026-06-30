import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/index.vue'
import PostDetailView from '@/views/post-detail/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '首页 - 匿名留言板'
    }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetailView,
    meta: {
      title: '帖子详情 - 匿名留言板'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫，设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router