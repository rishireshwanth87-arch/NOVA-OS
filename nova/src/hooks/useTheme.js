import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { applyTheme, listenToSystemThemeChange } from '../core/theme/themeManager'

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme)
  const accentColor = useSettingsStore((s) => s.accentColor)

  useEffect(() => {
    applyTheme(theme, accentColor)

    if (theme === 'system') {
      const cleanup = listenToSystemThemeChange(() => {
        applyTheme('system', accentColor)
      })
      return cleanup
    }
  }, [theme, accentColor])
}
