import { create } from 'zustand'
import { useWorkspaceStore } from './workspaceStore'

export const useWindowStore = create((set, get) => ({
  windows: [],
  activeWindowId: null,
  maxZIndex: 100,

  openWindow: (app, params = {}) => {
    const { windows, maxZIndex, focusWindow } = get()
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId

    // Handle singleton applications
    if (app.singleton) {
      const existing = windows.find((w) => w.appId === app.id)
      if (existing) {
        if (existing.minimized) {
          get().restoreWindow(existing.id)
        } else {
          focusWindow(existing.id)
        }
        return existing.id
      }
    }

    const windowId = `win-${app.id}-${Date.now()}`
    const newZIndex = maxZIndex + 1

    // Default window position offsets to stagger multiple windows
    const windowCount = windows.length
    const offsetX = 60 + (windowCount % 8) * 30
    const offsetY = 60 + (windowCount % 8) * 30

    const newWindow = {
      id: windowId,
      appId: app.id,
      title: app.name,
      iconName: app.iconName,
      x: params.x ?? offsetX,
      y: params.y ?? offsetY,
      width: app.defaultWidth || 720,
      height: app.defaultHeight || 480,
      minWidth: app.minWidth || 360,
      minHeight: app.minHeight || 240,
      zIndex: newZIndex,
      minimized: false,
      maximized: false,
      focused: true,
      workspaceId: activeWorkspaceId,
      params,
    }

    // Unfocus other windows and add new window
    const updatedWindows = windows.map((w) => ({ ...w, focused: false }))

    set({
      windows: [...updatedWindows, newWindow],
      activeWindowId: windowId,
      maxZIndex: newZIndex,
    })

    return windowId
  },

  closeWindow: (id) => {
    const { windows, activeWindowId } = get()
    const remaining = windows.filter((w) => w.id !== id)
    
    let nextActiveId = null;
    if (activeWindowId === id) {
      // Focus the highest zIndex remaining window that is not minimized
      const visible = remaining.filter((w) => !w.minimized)
      if (visible.length > 0) {
        const sorted = [...visible].sort((a, b) => b.zIndex - a.zIndex)
        nextActiveId = sorted[0].id
      }
    } else {
      nextActiveId = activeWindowId
    }

    set({
      windows: remaining.map((w) => ({ ...w, focused: w.id === nextActiveId })),
      activeWindowId: nextActiveId,
    })
  },

  focusWindow: (id) => {
    const { windows, maxZIndex, activeWindowId } = get()
    if (activeWindowId === id) return

    const newZIndex = maxZIndex + 1
    const updated = windows.map((w) => {
      if (w.id === id) {
        return { ...w, focused: true, minimized: false, zIndex: newZIndex }
      }
      return { ...w, focused: false }
    })

    set({
      windows: updated,
      activeWindowId: id,
      maxZIndex: newZIndex,
    })
  },

  minimizeWindow: (id) => {
    const { windows } = get()
    const updated = windows.map((w) => {
      if (w.id === id) {
        return { ...w, minimized: true, focused: false }
      }
      return w
    })

    // Find new active window if minimized window was focused
    const visible = updated.filter((w) => !w.minimized)
    let nextActiveId = null
    if (visible.length > 0) {
      const sorted = [...visible].sort((a, b) => b.zIndex - a.zIndex)
      nextActiveId = sorted[0].id
    }

    set({
      windows: updated.map((w) => ({ ...w, focused: w.id === nextActiveId })),
      activeWindowId: nextActiveId,
    })
  },

  restoreWindow: (id) => {
    get().focusWindow(id)
  },

  maximizeWindow: (id) => {
    const { windows } = get()
    set({
      windows: windows.map((w) => (w.id === id ? { ...w, maximized: true } : w)),
    })
    get().focusWindow(id)
  },

  unmaximizeWindow: (id) => {
    const { windows } = get()
    set({
      windows: windows.map((w) => (w.id === id ? { ...w, maximized: false } : w)),
    })
    get().focusWindow(id)
  },

  toggleMaximizeWindow: (id) => {
    const target = get().windows.find((w) => w.id === id)
    if (!target) return
    if (target.maximized) {
      get().unmaximizeWindow(id)
    } else {
      get().maximizeWindow(id)
    }
  },

  snapWindow: (id, snapState) => {
    const { windows } = get()
    set({
      windows: windows.map((w) => {
        if (w.id === id) {
          const preSnap = w.snapState === 'normal' || !w.preSnapState
            ? { x: w.x, y: w.y, width: w.width, height: w.height }
            : w.preSnapState

          return {
            ...w,
            snapState,
            preSnapState: preSnap,
            maximized: snapState === 'maximized' || snapState === 'top',
          }
        }
        return w
      }),
    })
    get().focusWindow(id)
  },

  setWindows: (newWindows) => {
    set({ windows: newWindows })
  },

  moveWindow: (id, x, y) => {
    const { windows } = get()
    set({
      windows: windows.map((w) => (w.id === id ? { ...w, x, y, snapState: 'normal' } : w)),
    })
  },

  resizeWindow: (id, width, height) => {
    const { windows } = get()
    set({
      windows: windows.map((w) => {
        if (w.id === id) {
          const newW = Math.max(width, w.minWidth || 300)
          const newH = Math.max(height, w.minHeight || 200)
          return { ...w, width: newW, height: newH, snapState: 'normal' }
        }
        return w
      }),
    })
  },
}))
