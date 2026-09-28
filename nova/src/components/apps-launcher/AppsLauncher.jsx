import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  RotateCcw,
  Moon,
  Sun,
  Lock,
  Check,
  LogOut,
  RefreshCw,
  Power,
  Zap,
} from 'lucide-react'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { useWindowStore } from '../../stores/windowStore'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { AppIcon } from './AppIcons'

export function AppsLauncher() {
  const isOpen = useOSStore((s) => s.appsLauncherOpen)
  const closeLauncher = useOSStore((s) => s.closeAppsLauncher)
  const openWindow = useWindowStore((s) => s.openWindow)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef(null)
  const searchInputRef = useRef(null)

  // Ordered list of apps matching the exact screenshot layout:
  // Row 1: Browser, Calculator, Camera, Files, Gallery, Musicplr, Settings, Store
  // Row 2: Studio, Text, Time (and others)
  const orderedAppIds = [
    'aster',
    'calculator',
    'camera',
    'files',
    'gallery',
    'music',
    'settings',
    'store',
    'studio',
    'notes',
    'calendar',
    'terminal',
    'system-monitor',
  ]

  const allApps = appRegistry.getAll()
  // Map and sort according to orderedAppIds
  const displayApps = orderedAppIds
    .map((id) => allApps.find((a) => a.id === id))
    .filter(Boolean)

  const filteredApps = displayApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      // Don't close if clicked on the dock launcher toggle button
      const isDockToggle = e.target.closest('#nova-dock-launcher-btn')
      if (menuRef.current && !menuRef.current.contains(e.target) && !isDockToggle) {
        closeLauncher()
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLauncher()
      }
    }
    window.addEventListener('pointerdown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeLauncher])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLaunch = (app) => {
    openWindow(app)
    closeLauncher()
  }

  const handleRestart = () => {
    closeLauncher()
    useOSStore.setState({
      bootState: 'booting',
      bootProgress: 0,
      bootMessage: 'Restarting NOVA Kernel...',
    })
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLockSession = () => {
    closeLauncher()
    useOSStore.getState().lockSession()
  }

  const handleStatusCheck = () => {
    addNotification({
      title: 'System Health',
      message: 'Kernel running smoothly. All services nominal.',
      type: 'success',
    })
  }

  return (
    <div
      ref={menuRef}
      className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-50 w-[670px] max-w-[95vw] bg-[#14151e]/96 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none animate-in fade-in zoom-in-95 duration-200 flex flex-col font-sans overflow-hidden"
    >
      {/* Top Title: Apps */}
      <div className="pt-5 pb-1 text-center">
        <h2 className="text-2xl font-normal text-slate-200 tracking-wide font-sans">Apps</h2>
      </div>

      {/* App Grid: 8 Columns */}
      <div className="px-6 py-5 min-h-[170px]">
        <div className="grid grid-cols-8 gap-y-6 gap-x-2">
          {filteredApps.map((app) => {
            // Label override to match exact screenshot typography ("Calcul...", "Musicplr", etc.)
            let displayLabel = app.name
            if (app.id === 'calculator') displayLabel = 'Calcul...'
            if (app.id === 'aster') displayLabel = 'Browser'
            if (app.id === 'notes') displayLabel = 'Text'
            if (app.id === 'calendar') displayLabel = 'Time'

            return (
              <button
                key={app.id}
                onClick={() => handleLaunch(app)}
                className="flex flex-col items-center justify-start group focus:outline-none p-1 rounded-xl hover:bg-white/5 transition-colors"
                title={app.description || app.name}
              >
                <AppIcon id={app.id} size={42} />
                <span className="text-[11px] font-normal text-slate-200 mt-2 text-center truncate w-full group-hover:text-white transition-colors">
                  {displayLabel}
                </span>
              </button>
            )
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            No applications match "{searchQuery}"
          </div>
        )}
      </div>

      {/* Bottom Action / Search Bar */}
      <div className="h-12 px-4 bg-[#0d0e14]/90 border-t border-white/5 flex items-center justify-between">
        {/* Search Input on Left */}
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-28 focus:w-40 h-7 pl-2.5 pr-6 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-[#00F0FF]/50 rounded-lg text-xs text-white placeholder-slate-500 outline-none transition-all font-sans"
          />
          <Search size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
        </div>

        {/* Quick System Action Icons in Center */}
        <div className="flex items-center gap-3 text-slate-400">
          <button
            onClick={handleRestart}
            className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
            title="Restart NOVA Kernel"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleToggleTheme}
            className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <button
            onClick={handleLockSession}
            className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
            title="Lock Session"
          >
            <Lock size={14} />
          </button>

          <button
            onClick={handleStatusCheck}
            className="p-1 rounded hover:text-emerald-400 hover:bg-white/10 transition-colors"
            title="System Status"
          >
            <Check size={14} className="text-emerald-400 stroke-[2.5]" />
          </button>
        </div>

        {/* Exit / Power on Right */}
        <button
          onClick={handleRestart}
          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
          title="Shutdown / Exit NOVA"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  )
}
