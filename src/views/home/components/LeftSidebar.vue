<script setup lang="ts">
import type { CategoryItem } from '@/types'

const props = defineProps<{
  selectedCategory: string
}>()

const emit = defineEmits<{
  (e: 'category-change', category: string): void
}>()

// 分类列表 - 与原始UI完全一致
const categories: CategoryItem[] = [
  { id: 'all', name: 'All', icon: 'fa-bars' },
  { id: 'articles', name: 'Articles', icon: 'fa-file-alt' },
  { id: 'videos', name: 'Videos', icon: 'fa-video' },
  { id: 'pictures', name: 'Pictures', icon: 'fa-image' },
  { id: 'audio', name: 'Audio', icon: 'fa-music' }
]

// 热门趋势 - 与原始UI完全一致
const trendingPosts = [
  '#1 - The state of web development in 2026',
  '#2 - Is pixel art making a comeback?',
  '#3 - My journey into brutalist design',
  '#4 - Tips for staying anonymous online'
]

function handleCategoryClick(category: string) {
  emit('category-change', category)
}
</script>

<template>
  <aside class="sidebar-left">
    <!-- 分类区块 - 与原始UI完全一致 -->
    <div class="sidebar-block category-block">
      <h3>Categories</h3>
      <ul>
        <li 
          v-for="item in categories" 
          :key="item.id"
          :class="{ active: selectedCategory === item.id }"
          @click="handleCategoryClick(item.id)"
        >
          <i :class="['fa-solid', item.icon]"></i>
          <a href="#">{{ item.name }}</a>
        </li>
      </ul>
    </div>
    
    <!-- 热门趋势区块 - 与原始UI完全一致 -->
    <div class="sidebar-block ranking-block">
      <h3>Trending</h3>
      <ul>
        <li v-for="(post, index) in trendingPosts" :key="index">
          <a href="#">{{ post }}</a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped lang="scss">


.sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sidebar-block {
  border: 1px solid var(--border-color, #eee);
  border-radius: var(--border-radius, 8px);
  padding: 15px;
  background-color: var(--card-bg-color, var(--panel-bg-color, #ffffff));
  
  h3 {
    font-size: 1.1em;
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color, #eee);
    margin-bottom: 15px;
    color: var(--text-color);
    font-weight: 600;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: $spacing-sm $spacing-xs;
      margin-bottom: $spacing-xs;
      border-radius: var(--border-radius-sm, 4px);
      cursor: pointer;
      transition: $transition-base;
      color: var(--text-color);
      font-size: $font-size-sm;
      
      &:hover, &.active {
        background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
        color: var(--primary-color, #007bff);
      }
      
      i {
        margin-right: $spacing-sm;
      }
      
      a {
        color: inherit;
        text-decoration: none;
        transition: $transition-base;
        
        &:hover {
          color: $primary-color;
        }
      }
    }
  }
}
</style>