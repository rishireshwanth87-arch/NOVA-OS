import { saveToAsterStore, getFromAsterStore } from './asterDB'
import { useAsterStore } from '../asterStore'

const ASTER_SESSION_KEY = 'current_session'

export async function saveAsterSession() {
  try {
    const { tabs, activeTabId, defaultSearchEngine, showBookmarksBar, compactTabs } =
      useAsterStore.getState()

    // Filter out private tabs before persisting
    const publicTabs = tabs
      .filter((t) => !t.isPrivate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        favicon: t.favicon,
        historyStack: t.historyStack || [t.url],
        historyIndex: t.historyIndex || 0,
        zoomLevel: t.zoomLevel || 100,
        createdAt: t.createdAt,
        lastActiveAt: t.lastActiveAt,
      }))

    const sessionState = {
      id: ASTER_SESSION_KEY,
      activeTabId,
      tabs: publicTabs,
      settings: {
        defaultSearchEngine,
        showBookmarksBar,
        compactTabs,
      },
      savedAt: new Date().toISOString(),
    }

    await saveToAsterStore('tabs', sessionState)
  } catch (e) {
    console.error('Failed to save ASTER session:', e)
  }
}

export async function restoreAsterSession() {
  try {
    const sessionState = await getFromAsterStore('tabs', ASTER_SESSION_KEY)
    if (!sessionState || !Array.isArray(sessionState.tabs) || sessionState.tabs.length === 0) {
      return false
    }

    const restoredTabs = sessionState.tabs.map((t) => ({
      ...t,
      loading: false,
      isPrivate: false,
    }))

    const activeId = restoredTabs.some((t) => t.id === sessionState.activeTabId)
      ? sessionState.activeTabId
      : restoredTabs[0].id

    useAsterStore.setState({
      tabs: restoredTabs,
      activeTabId: activeId,
      ...(sessionState.settings || {}),
    })

    return true
  } catch (e) {
    console.error('Failed to restore ASTER session safely, falling back to new tab:', e)
    return false
  }
}
