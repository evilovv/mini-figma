import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'mini-figma:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const LIGHT_META = '#fafafa'
const DARK_META = '#0a0a0a'

type Theme = 'light' | 'dark'

function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'light' || raw === 'dark' ? raw : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', theme === 'dark' ? DARK_META : LIGHT_META)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (readStoredTheme() !== null || typeof matchMedia !== 'function') return
    const media = matchMedia(DARK_QUERY)
    const onChange = () => setTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        return next
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
