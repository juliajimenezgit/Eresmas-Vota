import { useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light'

const THEME_STORAGE_KEY = 'eresmas_theme_mode'

function getStoredTheme(): ThemeMode | null {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  if (raw === 'dark' || raw === 'light') {
    return raw
  }
  return null
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme() ?? 'dark')

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return {
    theme,
    toggleTheme,
  }
}
