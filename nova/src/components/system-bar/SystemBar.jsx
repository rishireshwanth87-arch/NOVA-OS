import React, { useState } from 'react'
import { Wifi, WifiOff, Moon, Sun, Layers, Bell } from 'lucide-react'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useWindowStore } from '../../stores/windowStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { NovaLogo } from '../brand/NovaLogo'
import { Clock } from './Clock'
import { SystemMenu } from './SystemMenu'
import { NetworkPanel } from './NetworkPanel'
import { NotificationCenter } from '../notifications/NotificationCenter'

export function SystemBar() {
  const toggleSystemMenu = useOSStore((s) => s.toggleSystemMenu)
  const isOnline = useOSStore((s) => s.isOnline)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  const showSystemTrayNetwork = useSettingsStore((s) => s.showSystemTrayNetwork)
  const showSystemTrayNotifications = useSettingsStore((s) => s.showSystemTrayNotifications)
  const showSystemTrayClock = useSettingsStore((s) => s.showSystemTrayClock)
  const showWorkspaceIndicator = useSettingsStore((s) => s.showWorkspaceIndicator)

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)

  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const windows = useWindowStore((s) => s.windows)
  const activeWindow = windows.find((w) => w.id === activeWindowId)

  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const toggleNotificationCenter = useNotificationStore((s) => s.toggleNotificationCenter)

  const [networkPanelOpen, setNetworkPanelOpen] = useState(false)

  const handleThemeToggle = () => {
    if (theme === 'dark') setTheme('light')
    else setTheme('dark')
  }

  return (
    <header className="nova-systembar relative z-40 h-9 w-full bg-[#12131C]/90 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between text-xs text-slate-200 select-none shrink-0">
      {/* Left: Branding & System Menu button */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSystemMenu}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#00F0FF]"
          aria-label="Open System Menu"
        >
          <NovaLogo size={18} />
          <span className="font-semibold tracking-wider text-white text-xs uppercase font-sans">
            NOVA
          </span>
        </button>
      </div>

      {/* Center: Current Workspace & Active Window */}
      {showWorkspaceIndicator && (
        <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/30 border border-white/10 text-[11px]">
          <div className="flex items-center gap-1 text-[#00F0FF] font-medium">
            <Layers size={12} />
            <span>{activeWorkspace ? activeWorkspace.name : 'Desktop'}</span>
          </div>
          {activeWindow && (
            <>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300 truncate max-w-[180px] font-normal">
                {activeWindow.title}
              </span>
            </>
          )}
        </div>
      )}

      {/* Right: Quick Controls, Notifications & Clock */}
      <div className="flex items-center gap-1.5">
        {/* Connection status button -> opens NetworkPanel */}
        {showSystemTrayNetwork && (
          <button
            onClick={() => setNetworkPanelOpen(!networkPanelOpen)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            title={isOnline ? 'Network Panel (Online)' : 'Network Panel (Offline)'}
            aria-label="Toggle Network Panel"
          >
            {isOnline ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-amber-400" />
            )}
          </button>
        )}

        {/* Notifications Button */}
        {showSystemTrayNotifications && (
          <button
            onClick={toggleNotificationCenter}
            className="relative p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            title="Notification Center"
            aria-label="Toggle Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00F0FF] ring-2 ring-[#12131C]" />
            )}
          </button>
        )}

        {/* Quick Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Live Clock */}
        {showSystemTrayClock && <Clock />}
      </div>

      {/* Popovers */}
      <SystemMenu />
      <NetworkPanel isOpen={networkPanelOpen} onClose={() => setNetworkPanelOpen(false)} />
      <NotificationCenter />
    </header>
  )
}
