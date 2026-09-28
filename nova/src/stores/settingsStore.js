import { create } from 'zustand'

const STORAGE_KEY = 'nova_os_settings'

const getInitialSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage', e)
  }
  return getDefaultSettings()
}

const getDefaultSettings = () => ({
  // Personalization -> Appearance & Themes
  theme: 'dark', // 'dark' | 'light' | 'system'
  themePreset: 'obsidian', // 'obsidian' | 'cyberpunk' | 'solarized' | 'matrix'
  wallpaper: 'minimal', // 'minimal' | 'graphite' | 'aurora' | 'deep-space'
  wallpaperBlur: false, // Desktop wallpaper blur toggle
  accentColor: 'cyan', // 'cyan' | 'indigo' | 'emerald' | 'amber'

  // Personalization -> Taskbar / Dock Layout
  dockPosition: 'bottom', // 'bottom' | 'top' | 'left' | 'right'
  dockAlignment: 'center', // 'center' | 'left' | 'right'
  dockSize: 'normal', // 'compact' | 'normal' | 'large'
  dockAutoHide: false,
  dockStyle: 'floating', // 'floating' | 'flush' | 'solid' | 'neon'
  dockTransparency: 'balanced', // 'opaque' | 'balanced' | 'clear'

  // Personalization -> App Icons
  showPinnedApps: true,
  showRunningApps: true,
  activeIndicatorStyle: 'pill', // 'dot' | 'pill' | 'line' | 'pulse'

  // Personalization -> System Tray
  showSystemTrayNetwork: true,
  showSystemTrayVolume: true,
  showSystemTrayBattery: true,
  showSystemTrayNotifications: true,
  showSystemTrayClock: true,
  clockFormat: '24h', // '24h' | '12h'
  showClockSeconds: false,

  // Personalization -> Workspace Behavior
  showWorkspaceIndicator: true,

  // Personalization -> Advanced
  lockTaskbar: false,

  // System
  reducedMotion: false,
})

export const useSettingsStore = create((set, get) => ({
  ...getInitialSettings(),

  setTheme: (theme) => {
    set({ theme })
    get().persistSettings()
  },

  setThemePreset: (preset) => {
    switch (preset) {
      case 'obsidian':
        set({ themePreset: 'obsidian', theme: 'dark', accentColor: 'cyan', wallpaper: 'minimal' })
        break
      case 'cyberpunk':
        set({ themePreset: 'cyberpunk', theme: 'dark', accentColor: 'amber', wallpaper: 'aurora' })
        break
      case 'solarized':
        set({ themePreset: 'solarized', theme: 'light', accentColor: 'indigo', wallpaper: 'cosmic' })
        break
      case 'matrix':
        set({ themePreset: 'matrix', theme: 'dark', accentColor: 'emerald', wallpaper: 'deep-space' })
        break
      default:
        set({ themePreset: preset })
    }
    get().persistSettings()
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper })
    get().persistSettings()
  },

  setWallpaperBlur: (wallpaperBlur) => {
    set({ wallpaperBlur })
    get().persistSettings()
  },

  toggleWallpaperBlur: () => {
    set((state) => ({ wallpaperBlur: !state.wallpaperBlur }))
    get().persistSettings()
  },

  setAccentColor: (accentColor) => {
    set({ accentColor })
    get().persistSettings()
  },

  setDockPosition: (dockPosition) => {
    if (get().lockTaskbar) return
    set({ dockPosition })
    get().persistSettings()
  },

  setDockAlignment: (dockAlignment) => {
    set({ dockAlignment })
    get().persistSettings()
  },

  setDockSize: (dockSize) => {
    set({ dockSize })
    get().persistSettings()
  },

  setDockAutoHide: (dockAutoHide) => {
    set({ dockAutoHide })
    get().persistSettings()
  },

  setDockStlye: (dockStyle) => {
    set({ dockStyle })
    get().persistSettings()
  },

  setDockStyle: (dockStyle) => {
    set({ dockStyle })
    get().persistSettings()
  },

  setDockTransparency: (dockTransparency) => {
    set({ dockTransparency })
    get().persistSettings()
  },

  setShowPinnedApps: (showPinnedApps) => {
    set({ showPinnedApps })
    get().persistSettings()
  },

  setShowRunningApps: (showRunningApps) => {
    set({ showRunningApps })
    get().persistSettings()
  },

  setActiveIndicatorStyle: (activeIndicatorStyle) => {
    set({ activeIndicatorStyle })
    get().persistSettings()
  },

  setShowSystemTrayNetwork: (showSystemTrayNetwork) => {
    set({ showSystemTrayNetwork })
    get().persistSettings()
  },

  setShowSystemTrayVolume: (showSystemTrayVolume) => {
    set({ showSystemTrayVolume })
    get().persistSettings()
  },

  setShowSystemTrayBattery: (showSystemTrayBattery) => {
    set({ showSystemTrayBattery })
    get().persistSettings()
  },

  setShowSystemTrayNotifications: (showSystemTrayNotifications) => {
    set({ showSystemTrayNotifications })
    get().persistSettings()
  },

  setShowSystemTrayClock: (showSystemTrayClock) => {
    set({ showSystemTrayClock })
    get().persistSettings()
  },

  setClockFormat: (clockFormat) => {
    set({ clockFormat })
    get().persistSettings()
  },

  toggleShowClockSeconds: () => {
    set((state) => ({ showClockSeconds: !state.showClockSeconds }))
    get().persistSettings()
  },

  setShowWorkspaceIndicator: (showWorkspaceIndicator) => {
    set({ showWorkspaceIndicator })
    get().persistSettings()
  },

  setLockTaskbar: (lockTaskbar) => {
    set({ lockTaskbar })
    get().persistSettings()
  },

  toggleReducedMotion: () => {
    set((state) => ({ reducedMotion: !state.reducedMotion }))
    get().persistSettings()
  },

  persistSettings: () => {
    const state = get()
    try {
      const {
        theme,
        themePreset,
        wallpaper,
        wallpaperBlur,
        accentColor,
        dockPosition,
        dockAlignment,
        dockSize,
        dockAutoHide,
        dockStyle,
        dockTransparency,
        showPinnedApps,
        showRunningApps,
        activeIndicatorStyle,
        showSystemTrayNetwork,
        showSystemTrayVolume,
        showSystemTrayBattery,
        showSystemTrayNotifications,
        showSystemTrayClock,
        clockFormat,
        showClockSeconds,
        showWorkspaceIndicator,
        lockTaskbar,
        reducedMotion,
      } = state

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme,
          themePreset,
          wallpaper,
          wallpaperBlur,
          accentColor,
          dockPosition,
          dockAlignment,
          dockSize,
          dockAutoHide,
          dockStyle,
          dockTransparency,
          showPinnedApps,
          showRunningApps,
          activeIndicatorStyle,
          showSystemTrayNetwork,
          showSystemTrayVolume,
          showSystemTrayBattery,
          showSystemTrayNotifications,
          showSystemTrayClock,
          clockFormat,
          showClockSeconds,
          showWorkspaceIndicator,
          lockTaskbar,
          reducedMotion,
        })
      )
    } catch (e) {
      console.error('Failed to persist settings', e)
    }
  },
}))
