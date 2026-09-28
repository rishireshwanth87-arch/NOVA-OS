/**
 * Controlled Action Abstraction Layer for ASTER Web Browser
 * Prepares clean programmatic interfaces for NOVA Command Center & future JARVIS integration.
 */

import { useAsterStore } from './asterStore'
import { useWindowStore } from '../../stores/windowStore'
import { appRegistry } from '../../core/app-registry/appRegistry'

export function ensureAsterWindowOpen() {
  const windowStore = useWindowStore.getState()
  const asterApp = appRegistry.get('aster')
  if (!asterApp) return null

  const existingWin = windowStore.windows.find((w) => w.appId === 'aster')
  if (existingWin) {
    if (existingWin.minimized) {
      windowStore.restoreWindow(existingWin.id)
    } else {
      windowStore.focusWindow(existingWin.id)
    }
    return existingWin.id
  } else {
    return windowStore.openWindow(asterApp)
  }
}

export const asterActions = {
  openTab: (url = 'aster://newtab', isPrivate = false) => {
    ensureAsterWindowOpen()
    return useAsterStore.getState().createTab(url, isPrivate)
  },

  closeTab: (tabId) => {
    useAsterStore.getState().closeTab(tabId)
  },

  switchTab: (tabId) => {
    useAsterStore.getState().switchTab(tabId)
  },

  navigate: (url) => {
    ensureAsterWindowOpen()
    const activeTabId = useAsterStore.getState().activeTabId
    if (activeTabId) {
      useAsterStore.getState().navigateTab(activeTabId, url)
    }
  },

  goBack: () => {
    const activeTabId = useAsterStore.getState().activeTabId
    if (activeTabId) useAsterStore.getState().goBack(activeTabId)
  },

  goForward: () => {
    const activeTabId = useAsterStore.getState().activeTabId
    if (activeTabId) useAsterStore.getState().goForward(activeTabId)
  },

  reload: () => {
    const activeTabId = useAsterStore.getState().activeTabId
    if (activeTabId) useAsterStore.getState().reloadTab(activeTabId)
  },

  bookmarkTab: () => {
    useAsterStore.getState().toggleBookmarkActiveTab()
  },

  search: (query) => {
    ensureAsterWindowOpen()
    const activeTabId = useAsterStore.getState().activeTabId
    if (activeTabId) {
      useAsterStore.getState().navigateTab(activeTabId, query)
    }
  },

  openHistory: () => {
    ensureAsterWindowOpen()
    useAsterStore.getState().openView('history')
  },

  openBookmarks: () => {
    ensureAsterWindowOpen()
    useAsterStore.getState().openView('bookmarks')
  },

  openDownloads: () => {
    ensureAsterWindowOpen()
    useAsterStore.getState().openView('downloads')
  },

  openSettings: () => {
    ensureAsterWindowOpen()
    useAsterStore.getState().openView('settings')
  },
}
