import { useWindowStore } from '../../stores/windowStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { appRegistry } from '../app-registry/appRegistry'
import { saveAsterSession, restoreAsterSession } from '../../apps/aster/services/sessionService'

const SESSION_STORAGE_KEY = 'nova_os_session'

export function saveSession() {
  try {
    const windows = useWindowStore.getState().windows
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId
    const workspaces = useWorkspaceStore.getState().workspaces

    const sessionData = {
      version: 1,
      savedAt: new Date().toISOString(),
      activeWorkspaceId,
      workspaces,
      windows: windows.map((w) => ({
        id: w.id,
        appId: w.appId,
        title: w.title,
        iconName: w.iconName,
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height,
        minWidth: w.minWidth,
        minHeight: w.minHeight,
        zIndex: w.zIndex,
        minimized: w.minimized,
        maximized: w.maximized,
        snapState: w.snapState || 'normal',
        workspaceId: w.workspaceId,
        params: w.params,
      })),
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
    saveAsterSession().catch((err) => console.error('Error saving ASTER session:', err))
  } catch (e) {
    console.error('Failed to save NOVA session:', e)
  }
}

export function restoreSession() {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY)
    restoreAsterSession().catch((err) => console.error('Error restoring ASTER session:', err))

    if (!saved) return false

    const sessionData = JSON.parse(saved)
    if (!sessionData || !sessionData.windows) return false

    // Validate and filter open windows against appRegistry
    const restoredWindows = sessionData.windows.filter((w) => {
      const app = appRegistry.get(w.appId)
      return !!app
    })

    if (sessionData.workspaces && sessionData.workspaces.length) {
      useWorkspaceStore.setState({
        workspaces: sessionData.workspaces,
        activeWorkspaceId: sessionData.activeWorkspaceId || sessionData.workspaces[0].id,
      })
    }

    if (restoredWindows.length > 0) {
      useWindowStore.getState().setWindows(restoredWindows)
    }

    return true
  } catch (e) {
    console.error('Failed to restore NOVA session:', e)
    return false
  }
}

export function initSessionAutosave() {
  // Listen to store updates or unload to persist session state
  window.addEventListener('beforeunload', () => {
    saveSession()
  })

  // Periodic autosave every 10 seconds
  setInterval(() => {
    saveSession()
  }, 10000)
}
