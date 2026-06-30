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

<style scoped>
.site-header {
  background: inherit;
  border-bottom: 1px solid inherit;
  padding: 1rem 20px;
}

.header-content {
  max-width: 1400px;
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
}

.search-container {
  display: flex;
  flex: 1;
  max-width: 400px;
  gap: 0.5rem;
}

.search-container input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-container button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: #f5f5f5;
}

.theme-switcher select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  cursor: pointer;
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