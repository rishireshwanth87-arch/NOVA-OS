import React, { useState, useEffect } from 'react'
import {
  Search,
  AppWindow,
  Sparkles,
} from 'lucide-react'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { useWindowStore } from '../../stores/windowStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useOSStore } from '../../stores/osStore'
import { useCommandCenterStore } from '../../stores/commandCenterStore'
import { useJarvisStore } from '../../stores/jarvisStore'
import { AppIcon } from '../apps-launcher/AppIcons'
import { NovaBirdIcon } from '../brand/NovaLogo'

export function Dock() {
  const apps = appRegistry.getAll()
  const windows = useWindowStore((s) => s.windows)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const openWindow = useWindowStore((s) => s.openWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)

  const appsLauncherOpen = useOSStore((s) => s.appsLauncherOpen)
  const toggleAppsLauncher = useOSStore((s) => s.toggleAppsLauncher)
  const openCommandCenter = useCommandCenterStore((s) => s.openCommandCenter)

  // Settings
  const dockPosition = useSettingsStore((s) => s.dockPosition)
  const dockAlignment = useSettingsStore((s) => s.dockAlignment)
  const dockSize = useSettingsStore((s) => s.dockSize)
  const dockAutoHide = useSettingsStore((s) => s.dockAutoHide)
  const dockStyle = useSettingsStore((s) => s.dockStyle)
  const dockTransparency = useSettingsStore((s) => s.dockTransparency)
  const showPinnedApps = useSettingsStore((s) => s.showPinnedApps)
  const showRunningApps = useSettingsStore((s) => s.showRunningApps)
  const activeIndicatorStyle = useSettingsStore((s) => s.activeIndicatorStyle)

  const [isHovered, setIsHovered] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(54)
  const [batteryCharging, setBatteryCharging] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  // Battery monitoring
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then((b) => {
        const update = () => {
          setBatteryLevel(Math.round(b.level * 100))
          setBatteryCharging(b.charging)
        }
        update()
        b.addEventListener('levelchange', update)
        b.addEventListener('chargingchange', update)
      }).catch(() => {})
    }
  }, [])

  // Clock & Date monitoring (matches screenshot: 10:38 AM / 10-09-2026)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      setCurrentTime(timeStr)
      setCurrentDate(`${day}-${month}-${year}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAppClick = (app) => {
    const existingWindow = windows.find((w) => w.appId === app.id)

    if (!existingWindow) {
      openWindow(app)
    } else if (existingWindow.minimized) {
      restoreWindow(existingWindow.id)
    } else if (existingWindow.id === activeWindowId) {
      minimizeWindow(existingWindow.id)
    } else {
      focusWindow(existingWindow.id)
    }
  }

  // Pinned priority apps matching screenshot: Store, Files, Settings (plus running apps)
  const defaultPinnedIds = ['store', 'files', 'settings']
  const visibleApps = apps.filter((app) => {
    const isRunning = windows.some((w) => w.appId === app.id)
    if (isRunning && showRunningApps) return true
    if (defaultPinnedIds.includes(app.id)) return true
    return false
  })

  // Sizing helper
  const iconSize = dockSize === 'compact' ? 24 : dockSize === 'large' ? 36 : 30
  const buttonPadding = dockSize === 'compact' ? 'p-1' : dockSize === 'large' ? 'p-2' : 'p-1.5'

  // Position & Layout Container Class
  let containerPositionClass = 'fixed z-40 select-none transition-all duration-300 '
  const isVertical = dockPosition === 'left' || dockPosition === 'right'

  switch (dockPosition) {
    case 'top':
      containerPositionClass += 'top-11 '
      if (dockAlignment === 'left') containerPositionClass += 'left-4'
      else if (dockAlignment === 'right') containerPositionClass += 'right-4'
      else containerPositionClass += 'left-1/2 -translate-x-1/2'
      break
    case 'left':
      containerPositionClass += 'left-3 top-1/2 -translate-y-1/2'
      break
    case 'right':
      containerPositionClass += 'right-3 top-1/2 -translate-y-1/2'
      break
    case 'bottom':
    default:
      containerPositionClass += 'bottom-3 '
      if (dockAlignment === 'left') containerPositionClass += 'left-4'
      else if (dockAlignment === 'right') containerPositionClass += 'right-4'
      else containerPositionClass += 'left-1/2 -translate-x-1/2'
      break
  }

  // Auto-hide translate state
  let autoHideClass = ''
  if (dockAutoHide && !isHovered) {
    switch (dockPosition) {
      case 'bottom':
        autoHideClass = 'translate-y-16 opacity-20'
        break
      case 'top':
        autoHideClass = '-translate-y-16 opacity-20'
        break
      case 'left':
        autoHideClass = '-translate-x-16 opacity-20'
        break
      case 'right':
        autoHideClass = 'translate-x-16 opacity-20'
        break
    }
  }

  // Style & Transparency helper
  let styleClass = ''
  switch (dockStyle) {
    case 'flush':
      styleClass = 'rounded-none border-x-0 bg-[#0E0F17]'
      break
    case 'solid':
      styleClass = 'rounded-2xl border border-white/20 bg-[#12131C] shadow-2xl'
      break
    case 'neon':
      styleClass =
        'rounded-2xl border border-[#00F0FF]/60 bg-[#0A0B12]/95 shadow-[0_0_25px_rgba(0,240,255,0.3)]'
      break
    case 'floating':
    default:
      styleClass = 'rounded-2xl border border-white/15 shadow-2xl backdrop-blur-xl '
      if (dockTransparency === 'opaque') styleClass += 'bg-[#12131C]'
      else if (dockTransparency === 'clear') styleClass += 'bg-[#12131C]/50'
      else styleClass += 'bg-[#12131C]/90'
      break
  }

  return (
    <nav
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${containerPositionClass} ${autoHideClass}`}
    >
      <div
        className={`nova-dock flex ${
          isVertical ? 'flex-col gap-2 px-2 py-3' : 'items-center gap-1.5 px-3 py-1.5'
        } ${styleClass} transition-all`}
      >
        {/* Pinned & Running Apps */}
        {visibleApps.map((app) => {
          const appWindow = windows.find((w) => w.appId === app.id)
          const isOpen = Boolean(appWindow)
          const isFocused = isOpen && appWindow.id === activeWindowId
          const isMinimized = isOpen && appWindow.minimized

          return (
            <div key={app.id} className="relative group flex flex-col items-center">
              {/* Tooltip */}
              <div
                className={`absolute ${
                  dockPosition === 'top'
                    ? 'top-12'
                    : dockPosition === 'left'
                    ? 'left-12'
                    : dockPosition === 'right'
                    ? 'right-12'
                    : '-top-10'
                } scale-90 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 px-2.5 py-1 bg-slate-900/90 text-slate-100 text-[11px] font-medium rounded-md shadow-lg border border-white/10 whitespace-nowrap z-50`}
              >
                {app.name}
              </div>

              {/* Dock Icon Button */}
              <button
                onClick={() => handleAppClick(app)}
                className={`relative ${buttonPadding} rounded-xl transition-all duration-200 ease-out focus:outline-none flex items-center justify-center ${
                  isFocused
                    ? 'bg-white/20 scale-110 shadow-lg text-white'
                    : isOpen
                    ? 'bg-white/10 text-slate-200 hover:scale-105 hover:bg-white/15'
                    : 'text-slate-400 hover:text-white hover:scale-105 hover:bg-white/10'
                }`}
                aria-label={`Launch or switch to ${app.name}`}
              >
                <AppIcon id={app.id} size={iconSize} />
              </button>

              {/* Active Indicator Styling */}
              <div className="h-1 flex items-center justify-center mt-0.5">
                {isFocused ? (
                  activeIndicatorStyle === 'line' ? (
                    <span className="w-5 h-0.5 bg-[#00F0FF] rounded-full" />
                  ) : activeIndicatorStyle === 'pulse' ? (
                    <span className="w-2 h-2 bg-[#00F0FF] rounded-full animate-ping" />
                  ) : activeIndicatorStyle === 'dot' ? (
                    <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full" />
                  ) : (
                    <span className="w-2.5 h-1 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
                  )
                ) : isMinimized ? (
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                ) : isOpen ? (
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                ) : null}
              </div>
            </div>
          )
        })}

        {/* Center: NOVA Eagle Apps Launcher Toggle Button */}
        <div className="relative group flex flex-col items-center">
          <button
            id="nova-dock-launcher-btn"
            onClick={toggleAppsLauncher}
            className={`w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center focus:outline-none ${
              appsLauncherOpen
                ? 'bg-[#E01A22]/25 text-[#E01A22] border border-[#E01A22]/40 shadow-[0_0_15px_rgba(224,26,34,0.4)] scale-105'
                : 'text-white hover:bg-white/10 hover:scale-105'
            }`}
            title="Apps Launcher"
            aria-label="Open Apps Launcher"
          >
            <NovaBirdIcon size={22} color={appsLauncherOpen ? '#E01A22' : '#FFFFFF'} />
          </button>
        </div>

        {/* Search (Magnifier) Button */}
        <div className="relative group flex flex-col items-center">
          <button
            onClick={() => openCommandCenter()}
            className="w-9 h-9 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none"
            title="Search / Command Center (Ctrl+K)"
            aria-label="Search"
          >
            <Search size={17} />
          </button>
        </div>

        {/* JARVIS AI Voice Assistant Button */}
        <div className="relative group flex flex-col items-center">
          <button
            onClick={() => useJarvisStore.getState().toggleJarvis()}
            className="w-9 h-9 rounded-xl text-[#00F0FF] hover:text-[#33F3FF] hover:bg-[#00F0FF]/15 hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none"
            title="JARVIS AI Voice Assistant (Ctrl+Space)"
            aria-label="JARVIS AI Assistant"
          >
            <Sparkles size={17} className="animate-pulse" />
          </button>
        </div>

        {/* Right Status Group: Battery & Quick Settings Toggle */}
        <button
          id="nova-dock-tray-btn"
          onClick={() => useOSStore.getState().toggleQuickSettings()}
          className="flex items-center hover:bg-white/10 p-1 rounded-xl transition-all duration-150 focus:outline-none cursor-pointer group"
          title="Quick Settings & Control Center"
          aria-label="Open Quick Settings"
        >
          {/* Battery Indicator */}
          <div className="flex flex-col items-center justify-center px-1.5 py-0.5 text-slate-300 select-none">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-3.5 stroke-current stroke-2">
              <rect x="2" y="6" width="16" height="12" rx="2" ry="2" />
              <line x1="20" y1="10" x2="20" y2="14" />
              <rect
                x="4"
                y="8"
                width={Math.max(2, (12 * batteryLevel) / 100)}
                height="8"
                fill={batteryCharging ? '#10B981' : '#00F0FF'}
                stroke="none"
              />
            </svg>
            <span className="text-[9px] leading-none mt-0.5 text-slate-300 group-hover:text-white">
              {batteryLevel}%
            </span>
          </div>

          {/* Clock & Date */}
          <div className="flex flex-col items-center justify-center px-2 text-[10px] leading-tight text-slate-300 select-none border-l border-white/10 pl-2">
            <span className="font-semibold text-white tracking-tight group-hover:text-[#00F0FF] transition-colors">{currentTime || '10:38 AM'}</span>
            <span className="text-slate-400 text-[9px] tracking-tight">{currentDate || '10-09-2026'}</span>
          </div>
        </button>
      </div>
    </nav>
  )
}
