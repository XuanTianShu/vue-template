<script setup lang="ts">
import { Star, ChatDotRound } from '@element-plus/icons-vue'

defineProps<{
  likes: number
  commentsCount: number
}>()
</script>

<template>
  <div class="post-meta">
    <span class="meta-item">
      <el-icon><Star /></el-icon>
      <span>{{ likes }}</span>
    </span>
    <span class="meta-item">
      <el-icon><ChatDotRound /></el-icon>
      <span>{{ commentsCount }} comments</span>
    </span>
    <a href="#" class="view-details-link" @click.prevent>View Details</a>
  </div>
</template>

<style scoped lang="scss">
.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $font-size-sm;
  color: var(--subtle-text-color, #6c757d);
  border-top: 1px solid var(--border-color, #dee2e6);
  padding: $spacing-sm $spacing-md;
  margin-top: auto; // 将meta部分推到底部
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .el-icon {
    font-size: 16px;
  }
}

.view-details-link {
  color: var(--primary-color, #007bff);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    // 使用rgba叠加实现变暗效果，避免Sass编译时处理CSS变量
    color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.8);
  }
}
</style>