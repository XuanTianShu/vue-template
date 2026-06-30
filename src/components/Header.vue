<script setup lang="ts">
import { AVAILABLE_THEMES, type ThemeValue } from '../constants/themes'

const props = defineProps<{
  currentTheme: ThemeValue
}>()

const emit = defineEmits<{
  (e: 'theme-change', theme: ThemeValue): void
}>()

function handleThemeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  if (target && AVAILABLE_THEMES.some(t => t.value === target.value)) {
    emit('theme-change', target.value as ThemeValue)
  }
}
</script>

<template>
  <header class="site-header">
    <div class="header-content">
      <h1 class="site-title">Anonymous Board</h1>
      <div class="search-container">
        <input type="search" id="search-input" placeholder="Search posts..." />
        <button id="search-btn">
          <i class="fa-solid fa-search"></i>
        </button>
      </div>
      <div class="theme-switcher">
        <select id="theme-selector" :value="currentTheme" @change="handleThemeChange">
          <option v-for="theme in AVAILABLE_THEMES" :key="theme.value" :value="theme.value">
            {{ theme.label }}
          </option>
        </select>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">


.site-header {
  background-color: var(--card-bg-color, var(--panel-bg-color, #ffffff));
  border-bottom: 1px solid var(--border-color, #dee2e6);
  padding: 1rem 20px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.05));
}

.header-content {
  width: calc(100% - 30px); /* 和首页保持一致，左右各留15px */
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  color: var(--text-color);
}

.search-container {
  display: flex;
  flex: 1;
  max-width: 400px;
  gap: 0.5rem;
}

.search-container input {
  width: 100%;
  border-right: none;
  border-radius: var(--border-radius, 6px) 0 0 var(--border-radius, 6px);
  padding: 8px 12px;
  border: 1px solid var(--border-color, #dee2e6);
  font-size: 0.9rem;
  background-color: var(--bg-color, #f8f9fa);
  color: var(--text-color);
  
  &::placeholder {
    color: var(--subtle-text-color, #6c757d);
  }
}

.search-container button {
  border-radius: 0 var(--border-radius, 6px) var(--border-radius, 6px) 0;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #dee2e6);
  cursor: pointer;
  background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
  color: var(--text-color);
  transition: $transition-base;
  
  &:hover {
    background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.2);
  }
}

.theme-switcher select {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius, 6px);
  border: 1px solid var(--border-color, #dee2e6);
  font-size: 0.9rem;
  cursor: pointer;
  background-color: var(--bg-color, #f8f9fa);
  color: var(--text-color);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-container {
    width: 100%;
    max-width: none;
  }
}
</style>