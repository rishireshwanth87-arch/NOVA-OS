import React, { useEffect } from 'react'
import { BootScreen } from './components/boot/BootScreen'
import { Desktop } from './components/desktop/Desktop'
import { LockScreen } from './components/lockscreen/LockScreen'
import { JarvisHUD } from './components/jarvis/JarvisHUD'
import { useTheme } from './hooks/useTheme'
import { useOSStore } from './stores/osStore'
import { useNotificationStore } from './stores/notificationStore'
import { useJarvisStore } from './stores/jarvisStore'
import { initFilesystem } from './storage/filesystem'
import { restoreSession, initSessionAutosave } from './core/session/sessionService'

export default function App() {
  useTheme()

  const setOnlineStatus = useOSStore((s) => s.setOnlineStatus)
  const closeAllOverlays = useOSStore((s) => s.closeAllOverlays)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const toggleJarvis = useJarvisStore((s) => s.toggleJarvis)

  useEffect(() => {
    // Initialize Virtual Filesystem & Restore Session
    initFilesystem().then(() => {
      restoreSession()
      initSessionAutosave()
    })

    const handleOnline = () => {
      setOnlineStatus(true)
      addNotification({
        title: 'Network Restored',
        message: 'Browser connection is now online.',
        type: 'success',
      })
    }

    const handleOffline = () => {
      setOnlineStatus(false)
      addNotification({
        title: 'Network Offline',
        message: 'NOVA operating environment is now running in offline mode.',
        type: 'warning',
      })
    }

    const handleKeyDown = (e) => {
      // Escape closes all overlays
      if (e.key === 'Escape') {
        closeAllOverlays()
        useJarvisStore.getState().closeJarvis()
      }

      // Ctrl + Space or Meta + Space: Toggle JARVIS
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault()
        toggleJarvis()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setOnlineStatus, closeAllOverlays, addNotification, toggleJarvis])

  return (
    <div
      style={{ backgroundColor: '#0b0c10', width: '100vw', height: '100vh', overflow: 'hidden' }}
      className="w-screen h-screen overflow-hidden relative bg-[#0B0C10] font-sans antialiased text-slate-100"
    >
      <BootScreen />
      <Desktop />
      <LockScreen />
      <JarvisHUD />
    </div>
  )
}
