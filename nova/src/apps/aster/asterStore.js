import { create } from 'zustand'
import { addHistoryEntry } from './services/historyService'
import { addBookmark, removeBookmarkByUrl, isBookmarked } from './services/bookmarkService'
import { useNotificationStore } from '../../stores/notificationStore'

const DEFAULT_NEW_TAB_URL = 'aster://newtab'

const normalizeUrlOrQuery = (input, searchEngine = 'duckduckgo') => {
  if (!input || !input.trim()) return DEFAULT_NEW_TAB_URL
  const trimmed = input.trim()

  if (trimmed.startsWith('aster://') || trimmed.startsWith('about:')) {
    return trimmed
  }

  // URL pattern matching
  const hasProtocol = /^https?:\/\//i.test(trimmed)
  const isDomain =
    /^([a-z0-9]+[a-z0-9.-]*\.[a-z]{2,})(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^localhost(:\d+)?(\/.*)?$/i.test(trimmed)

  if (hasProtocol) {
    return trimmed
  } else if (isDomain) {
    return `https://${trimmed}`
  } else {
    // Search query
    const encoded = encodeURIComponent(trimmed)
    switch (searchEngine) {
      case 'google':
        return `https://www.google.com/search?q=${encoded}`
      case 'wikipedia':
        return `https://en.wikipedia.org/wiki/Special:Search?search=${encoded}`
      case 'duckduckgo':
      default:
        return `https://duckduckgo.com/?q=${encoded}`
    }
  }
}

const createTabObject = (url = DEFAULT_NEW_TAB_URL, isPrivate = false) => {
  const id = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const normalized = url.startsWith('aster://') ? url : normalizeUrlOrQuery(url)
  return {
    id,
    title: url === DEFAULT_NEW_TAB_URL ? 'New Tab' : normalized,
    url: normalized,
    favicon: '',
    loading: false,
    historyStack: [normalized],
    historyIndex: 0,
    isPrivate,
    useProxy: true,
    zoomLevel: 100,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
}

const initialTab = createTabObject()

export const useAsterStore = create((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  closedTabs: [],
  defaultSearchEngine: 'duckduckgo',
  showBookmarksBar: true,
  compactTabs: false,
  activeView: null, // null | 'history' | 'bookmarks' | 'downloads' | 'settings' | 'find'
  findQuery: '',

  // Create New Tab
  createTab: (url = DEFAULT_NEW_TAB_URL, isPrivate = false) => {
    const newTab = createTabObject(url, isPrivate)
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }))
    return newTab
  },

  // Close Tab
  closeTab: (tabId) => {
    const { tabs, activeTabId, closedTabs } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (!target) return

    const remaining = tabs.filter((t) => t.id !== tabId)
    let nextActiveId = activeTabId

    if (activeTabId === tabId) {
      if (remaining.length > 0) {
        nextActiveId = remaining[remaining.length - 1].id
      } else {
        const fallback = createTabObject()
        remaining.push(fallback)
        nextActiveId = fallback.id
      }
    }

    set({
      tabs: remaining,
      activeTabId: nextActiveId,
      closedTabs: target.isPrivate ? closedTabs : [target, ...closedTabs].slice(0, 10),
    })
  },

  // Switch Tab
  switchTab: (tabId) => {
    const { tabs } = get()
    if (!tabs.some((t) => t.id === tabId)) return
    set({
      activeTabId: tabId,
      tabs: tabs.map((t) => (t.id === tabId ? { ...t, lastActiveAt: new Date().toISOString() } : t)),
    })
  },

  // Duplicate Tab
  duplicateTab: (tabId) => {
    const { tabs, createTab } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (target) {
      createTab(target.url, target.isPrivate)
    }
  },

  // Reopen Closed Tab
  reopenClosedTab: () => {
    const { closedTabs, createTab } = get()
    if (!closedTabs.length) return
    const [reopen, ...rest] = closedTabs
    set({ closedTabs: rest })
    createTab(reopen.url, reopen.isPrivate)
  },

  // Update Tab Attributes
  updateTab: (tabId, updates) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
    }))
  },

  // Navigate Tab to URL / Search Query
  navigateTab: async (tabId, rawUrlOrQuery) => {
    const { tabs, defaultSearchEngine, updateTab } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (!target) return

    const targetUrl = normalizeUrlOrQuery(rawUrlOrQuery, defaultSearchEngine)
    const newStack = target.historyStack.slice(0, target.historyIndex + 1)
    newStack.push(targetUrl)

    updateTab(tabId, {
      url: targetUrl,
      title: targetUrl.startsWith('aster://') ? 'New Tab' : targetUrl,
      loading: !targetUrl.startsWith('aster://'),
      historyStack: newStack,
      historyIndex: newStack.length - 1,
    })

    // Record History if not private and not internal
    if (!target.isPrivate && !targetUrl.startsWith('aster://')) {
      await addHistoryEntry(targetUrl, targetUrl)
    }
  },

  // Back / Forward / Reload
  goBack: (tabId) => {
    const { tabs, updateTab } = get()
    const t = tabs.find((item) => item.id === tabId)
    if (t && t.historyIndex > 0) {
      const nextIndex = t.historyIndex - 1
      const prevUrl = t.historyStack[nextIndex]
      updateTab(tabId, {
        url: prevUrl,
        title: prevUrl,
        historyIndex: nextIndex,
        loading: !prevUrl.startsWith('aster://'),
      })
    }
  },

  goForward: (tabId) => {
    const { tabs, updateTab } = get()
    const t = tabs.find((item) => item.id === tabId)
    if (t && t.historyIndex < t.historyStack.length - 1) {
      const nextIndex = t.historyIndex + 1
      const nextUrl = t.historyStack[nextIndex]
      updateTab(tabId, {
        url: nextUrl,
        title: nextUrl,
        historyIndex: nextIndex,
        loading: !nextUrl.startsWith('aster://'),
      })
    }
  },

  reloadTab: (tabId) => {
    const { tabs, updateTab } = get()
    const t = tabs.find((item) => item.id === tabId)
    if (t) {
      updateTab(tabId, { loading: true })
      setTimeout(() => updateTab(tabId, { loading: false }), 800)
    }
  },

  // Bookmarks Toggle for Active Tab
  toggleBookmarkActiveTab: async () => {
    const { tabs, activeTabId } = get()
    const current = tabs.find((t) => t.id === activeTabId)
    if (!current || !current.url || current.url.startsWith('aster://')) return

    const alreadyBmk = await isBookmarked(current.url)
    if (alreadyBmk) {
      await removeBookmarkByUrl(current.url)
      useNotificationStore.getState().addNotification({
        title: 'ASTER Bookmarks',
        message: 'Bookmark removed',
        type: 'info',
      })
    } else {
      await addBookmark(current.title || current.url, current.url, current.favicon)
      useNotificationStore.getState().addNotification({
        title: 'ASTER Bookmarks',
        message: 'Page bookmarked successfully',
        type: 'success',
      })
    }
  },

  // Views & Overlay Management
  openView: (viewName) => set({ activeView: viewName }),
  closeView: () => set({ activeView: null }),

  // Toggle CORS Proxy mode for tab
  toggleProxyForTab: (tabId) => {
    const { tabs, updateTab } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (target) {
      updateTab(tabId, { useProxy: !target.useProxy })
    }
  },

  // Zoom Controls
  zoomIn: (tabId) => {
    const { tabs, updateTab } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (target) {
      const current = target.zoomLevel || 100
      const next = Math.min(200, current + 10)
      updateTab(tabId, { zoomLevel: next })
    }
  },

  zoomOut: (tabId) => {
    const { tabs, updateTab } = get()
    const target = tabs.find((t) => t.id === tabId)
    if (target) {
      const current = target.zoomLevel || 100
      const next = Math.max(50, current - 10)
      updateTab(tabId, { zoomLevel: next })
    }
  },

  resetZoom: (tabId) => {
    const { updateTab } = get()
    updateTab(tabId, { zoomLevel: 100 })
  },

  setDefaultSearchEngine: (engine) => set({ defaultSearchEngine: engine }),
  setShowBookmarksBar: (show) => set({ showBookmarksBar: show }),
  setCompactTabs: (compact) => set({ compactTabs: compact }),
}))
