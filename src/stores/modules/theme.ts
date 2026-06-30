import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { AVAILABLE_THEMES, DEFAULT_THEME, type ThemeValue } from '../../constants/themes'

export const useThemeStore = defineStore('theme', () => {
  // Load theme from localStorage
  const storedTheme = localStorage.getItem('selectedTheme')
  const isValidTheme = (theme: string | null): theme is ThemeValue => {
    return AVAILABLE_THEMES.some(t => t.value === theme)
  }
  
  // State
  const currentTheme = ref<ThemeValue>(isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME)

  // Actions
  function setTheme(theme: ThemeValue) {
    currentTheme.value = theme
    localStorage.setItem('selectedTheme', theme)
  }

  // 监听主题变化，更新根元素的 class
  watchEffect(() => {
    // 移除所有主题类
    AVAILABLE_THEMES.forEach(t => {
      document.documentElement.classList.remove(t.value)
    })
    // 添加当前主题类
    document.documentElement.classList.add(currentTheme.value)
  })

  return {
    // State
    currentTheme,
    // 导出可用主题列表供 UI 使用
    AVAILABLE_THEMES,
    
    // Actions
    setTheme
  }
})