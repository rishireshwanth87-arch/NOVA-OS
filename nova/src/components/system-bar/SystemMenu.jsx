import React from 'react'
import {
  Moon,
  Sun,
  Monitor,
  Maximize,
  Minimize,
  RefreshCw,
  Settings as SettingsIcon,
  Check,
  Globe,
  Layers,
  Search,
} from 'lucide-react'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useWindowStore } from '../../stores/windowStore'
import { useCommandCenterStore } from '../../stores/commandCenterStore'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { NovaLogo } from '../brand/NovaLogo'

export function SystemMenu() {
  const isOpen = useOSStore((s) => s.systemMenuOpen)
  const closeMenu = useOSStore((s) => s.closeSystemMenu)

  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const setAccentColor = useSettingsStore((s) => s.setAccentColor)

  const isOnline = useOSStore((s) => s.isOnline)
  const isFullscreen = useOSStore((s) => s.isFullscreen)
  const setFullscreenStatus = useOSStore((s) => s.setFullscreenStatus)

  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace)

  const openWindow = useWindowStore((s) => s.openWindow)

  if (!isOpen) return null

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreenStatus(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreenStatus(false)).catch(() => {})
    }
  }

  const handleRestartBoot = () => {
    closeMenu()
    useOSStore.setState({ bootState: 'booting', bootProgress: 0, bootMessage: 'Restarting NOVA Kernel...' })
  }

  const handleOpenSettings = () => {
    closeMenu()
    const settingsApp = appRegistry.get('settings')
    if (settingsApp) {
      openWindow(settingsApp)
    }
  }

  return (
    <>
      {/* Backdrop overlay for closing menu */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={closeMenu} />

      {/* System Popover Container */}
      <div className="absolute left-3 top-10 z-50 w-72 bg-[#12131C]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 text-xs text-slate-200 select-none space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <NovaLogo size={28} />
          <div>
            <h3 className="font-semibold text-white tracking-wide">NOVA WebOS</h3>
            <p className="text-[10px] text-slate-400">v1.0.0 • Production Kernel</p>
          </div>
        </div>

        {/* Workspace Quick Switch */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Layers size={13} />
            <span>Workspaces</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                  activeWorkspaceId === ws.id
                    ? 'bg-[var(--nova-accent,#00F0FF)]/15 border-[var(--nova-accent,#00F0FF)]/50 text-white font-medium'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                {activeWorkspaceId === ws.id && <Check size={12} className="text-[var(--nova-accent,#00F0FF)] shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-400">Appearance Mode</div>
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-1 py-1 rounded-md transition-all ${
                theme === 'dark' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon size={12} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-1 py-1 rounded-md transition-all ${
                theme === 'light' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun size={12} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-1 py-1 rounded-md transition-all ${
                theme === 'system' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={12} />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-400">Accent Color</div>
          <div className="flex items-center justify-between px-1">
            {[
              { id: 'cyan', color: '#00F0FF' },
              { id: 'indigo', color: '#6366F1' },
              { id: 'emerald', color: '#10B981' },
              { id: 'amber', color: '#F59E0B' },
            ].map((acc) => (
              <button
                key={acc.id}
                onClick={() => setAccentColor(acc.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-transform ${
                  accentColor === acc.id ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: acc.color }}
              >
                {accentColor === acc.id && <Check size={12} className="text-black font-bold" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quick System Actions */}
        <div className="pt-2 border-t border-white/10 space-y-1">
          <button
            onClick={() => {
              closeMenu()
              useCommandCenterStore.getState().openCommandCenter()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-[#00F0FF]" />
              <span>Command Center</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+K</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">F11</span>
          </button>

          <button
            onClick={handleRestartBoot}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={13} />
              <span>Reboot OS Session</span>
            </div>
          </button>

          <button
            onClick={handleOpenSettings}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={13} />
              <span>System Settings</span>
            </div>
          </button>
        </div>

        {/* Footer Status */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Globe size={11} className={isOnline ? 'text-emerald-400' : 'text-amber-400'} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <span>IndexedDB Ready</span>
        </div>
      </div>
    </>
  )
}
