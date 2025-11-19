import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'estateportal.theme'
const DEFAULT_THEME = 'light'

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return DEFAULT_THEME
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const readStoredTheme = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    return null
  } catch {
    return null
  }
}

export const ThemeProvider = ({ children }) => {
  const [hasStoredPreference, setHasStoredPreference] = useState(() => readStoredTheme() !== null)
  const [theme, setTheme] = useState(() => readStoredTheme() ?? getSystemTheme())

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const { body, documentElement } = document
    body.dataset.theme = theme
    documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'

    if (typeof window === 'undefined') {
      return undefined
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return undefined
    }

    body.classList.add('theme-transitioning')
    const timeoutId = window.setTimeout(() => {
      body.classList.remove('theme-transitioning')
    }, 520)

    return () => {
      window.clearTimeout(timeoutId)
      body.classList.remove('theme-transitioning')
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (hasStoredPreference) {
        window.localStorage.setItem(STORAGE_KEY, theme)
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore storage errors (e.g., private mode)
    }
  }, [theme, hasStoredPreference])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event) => {
      if (!hasStoredPreference) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [hasStoredPreference])

  const applyTheme = useCallback((value) => {
    setTheme(value === 'dark' ? 'dark' : 'light')
  }, [])

  const setThemePreference = useCallback(
    (value) => {
      setHasStoredPreference(true)
      applyTheme(value)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => {
    setHasStoredPreference(true)
    setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))
  }, [])

  const resetToSystem = useCallback(() => {
    setHasStoredPreference(false)
    setTheme(getSystemTheme())
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme: setThemePreference,
      toggleTheme,
      resetToSystem
    }),
    [resetToSystem, setThemePreference, theme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
