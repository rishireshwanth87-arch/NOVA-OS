/**
 * Theme Manager Core Service
 * Manages document class updates and media query listeners for dark/light/system theme.
 */

export function applyTheme(theme, accentColor = 'cyan') {
  const root = document.documentElement

  // Set accent attribute
  root.setAttribute('data-accent', accentColor)

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (theme === 'dark' || (theme === 'system' && isSystemDark)) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

export function listenToSystemThemeChange(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = (e) => callback(e.matches ? 'dark' : 'light')
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener)
  } else {
    mediaQuery.addListener(listener)
  }

  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', listener)
    } else {
      mediaQuery.removeListener(listener)
    }
  }
}
