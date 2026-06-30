import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AVAILABLE_THEMES, DEFAULT_THEME, getThemePath, type ThemeValue } from '../constants/themes'

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
    updateThemeStylesheet(theme)
  }

  function updateThemeStylesheet(themeName: ThemeValue) {
    const themePath = getThemePath(themeName)
    let themeLink = document.getElementById('theme-stylesheet-dynamic') as HTMLLinkElement
    
    if (!themeLink) {
      themeLink = document.createElement('link')
      themeLink.rel = 'stylesheet'
      themeLink.id = 'theme-stylesheet-dynamic'
      document.head.appendChild(themeLink)
    }
    themeLink.href = themePath
  }

  // Initialize theme on store creation
  updateThemeStylesheet(currentTheme.value)

  return {
    // State
    currentTheme,
    
    // Actions
    setTheme,
    updateThemeStylesheet
  }
})