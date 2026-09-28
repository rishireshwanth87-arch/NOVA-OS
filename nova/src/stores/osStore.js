import { create } from 'zustand'

export const useOSStore = create((set, get) => ({
  bootState: 'booting', // 'booting' | 'ready'
  bootProgress: 0,
  bootMessage: 'Initializing NOVA Kernel...',
  
  systemMenuOpen: false,
  spotlightOpen: false,
  appSwitcherOpen: false,
  appsLauncherOpen: false,
  quickSettingsOpen: false,
  
  // Hardware & Display simulation
  brightness: 100,
  nightLight: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isFullscreen: false,
  
  // Session Lock Screen & User Profile
  isLocked: true,
  currentUser: 'Admin',
  lockSession: () => set({ isLocked: true }),
  unlockSession: () => set({ isLocked: false }),
  toggleLock: () => set((state) => ({ isLocked: !state.isLocked })),
  setCurrentUser: (user) => set({ currentUser: user }),

  toggleQuickSettings: () => set((state) => ({ quickSettingsOpen: !state.quickSettingsOpen })),
  closeQuickSettings: () => set({ quickSettingsOpen: false }),
  setBrightness: (brightness) => set({ brightness }),
  toggleNightLight: () => set((state) => ({ nightLight: !state.nightLight })),
  toggleWifi: () => set((state) => ({ wifiEnabled: !state.wifiEnabled })),
  toggleBluetooth: () => set((state) => ({ bluetoothEnabled: !state.bluetoothEnabled })),
  
  completeBoot: () => set({ bootState: 'ready', bootProgress: 100 }),
  
  setBootProgress: (progress, message) => set({ bootProgress: progress, bootMessage: message }),
  
  toggleSystemMenu: () => set((state) => ({ systemMenuOpen: !state.systemMenuOpen })),
  closeSystemMenu: () => set({ systemMenuOpen: false }),
  
  toggleSpotlight: () => set((state) => ({ spotlightOpen: !state.spotlightOpen })),
  closeSpotlight: () => set({ spotlightOpen: false }),
  
  toggleAppSwitcher: () => set((state) => ({ appSwitcherOpen: !state.appSwitcherOpen })),
  closeAppSwitcher: () => set({ appSwitcherOpen: false }),

  toggleAppsLauncher: () => set((state) => ({ appsLauncherOpen: !state.appsLauncherOpen })),
  closeAppsLauncher: () => set({ appsLauncherOpen: false }),
  openAppsLauncher: () => set({ appsLauncherOpen: true }),
  
  closeAllOverlays: () => set({ systemMenuOpen: false, spotlightOpen: false, appSwitcherOpen: false, appsLauncherOpen: false }),
  
  setOnlineStatus: (status) => set({ isOnline: status }),
  setFullscreenStatus: (status) => set({ isFullscreen: status }),
}))
