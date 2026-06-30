// Shared theme configuration - centralized to avoid duplication
export const AVAILABLE_THEMES = [
  { value: 'modern', label: 'Modern' },
  { value: 'cyberpunk_new', label: 'Cyberpunk' },
  { value: 'neumorphism', label: 'Neumorphism' },
] as const

export type ThemeValue = typeof AVAILABLE_THEMES[number]['value']

// Default theme if none is selected
export const DEFAULT_THEME: ThemeValue = 'cyberpunk_new'

// Theme stylesheet path generator
export function getThemePath(themeName: ThemeValue): string {
  return `css/theme_${themeName}.css`
}