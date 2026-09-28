import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  notificationCenterOpen: false,

  addNotification: ({ title, message, type = 'info' }) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const newNotif = {
      id,
      title,
      message,
      type, // 'info' | 'success' | 'warning' | 'error'
      timestamp: new Date().toISOString(),
      read: false,
    }

    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      get().dismissToast(id)
    }, 5000)

    return id
  },

  dismissToast: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, toastDismissed: true } : n
      ),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  toggleNotificationCenter: () => {
    const isOpen = get().notificationCenterOpen
    if (!isOpen) {
      get().markAllAsRead()
    }
    set({ notificationCenterOpen: !isOpen })
  },

  closeNotificationCenter: () => set({ notificationCenterOpen: false }),
}))
