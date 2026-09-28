import { create } from 'zustand'

const RECENT_COMMANDS_KEY = 'nova_recent_commands'

const getInitialRecentActions = () => {
  try {
    const saved = localStorage.getItem(RECENT_COMMANDS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to parse recent commands:', e)
  }
  return [
    { id: 'app-terminal', title: 'Terminal', category: 'Application', type: 'app', targetId: 'terminal' },
    { id: 'app-files', title: 'Files', category: 'Application', type: 'app', targetId: 'files' },
    { id: 'app-settings', title: 'Settings', category: 'Application', type: 'app', targetId: 'settings' },
  ]
}

export const useCommandCenterStore = create((set, get) => ({
  isOpen: false,
  recentActions: getInitialRecentActions(),

  openCommandCenter: () => set({ isOpen: true }),
  closeCommandCenter: () => set({ isOpen: false }),
  toggleCommandCenter: () => set((s) => ({ isOpen: !s.isOpen })),

  addRecentAction: (action) => {
    const current = get().recentActions
    const filtered = current.filter((item) => item.id !== action.id)
    const updated = [action, ...filtered].slice(0, 8)
    set({ recentActions: updated })
    try {
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save recent actions:', e)
    }
  },
}))
