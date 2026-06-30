<script setup lang="ts">
import type { Post } from '@/types'
import { onMounted, ref } from 'vue'
import PostMeta from './PostMeta.vue' // 导入新的Meta组件

const props = defineProps<{
  post: Post
  index: number
}>()

const emit = defineEmits<{
  (e: 'view-detail', post: Post): void
}>()

const isVisible = ref(false)

onMounted(() => {
  // 确保动画在组件挂载后执行
  setTimeout(() => {
    isVisible.value = true
  }, 50) // 稍作延迟以确保CSS transition生效
})

function handleViewDetail() {
  emit('view-detail', props.post)
}
</script>

<template>
  <div 
    class="post-item" 
    :class="{ 'is-visible': isVisible }"
    :style="{ '--index': index }"
    @click="handleViewDetail"
  >
    <img :src="post.imageUrl" :alt="post.title || 'Post image'" class="post-image">
    <div class="post-content">
      <p>{{ post.content }}</p>
    </div>
    <PostMeta :likes="post.likes" :comments-count="post.commentsCount" @click.stop />
  </div>
</template>

<style scoped lang="scss">


.post-item {
  background-color: var(--card-bg-color, var(--panel-bg-color, #ffffff));
  border-radius: var(--border-radius, 8px);
  border: 1px solid var(--border-color, #dee2e6);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);

  // 动画效果，与ui.html逻辑一致
  &.is-visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index, 0) * 0.05s); // 使用CSS变量实现动态延迟
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover, 0 10px 20px rgba(0, 0, 0, 0.08));
  }
}

.post-image {
  width: 100%;
  height: 180px;
  object-fit: cover; // 确保图片不变形
}

.post-content {
  padding: $spacing-md;
  flex-grow: 1; // 让内容区域占据剩余空间

  p {
    margin: 0;
    color: var(--text-color);
    line-height: 1.6;
    // 限制显示行数，超出部分显示省略号
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 72px; // 3行的大致高度
  }
}
</style>