import React, { useEffect, useRef, useState } from 'react'
import { Folder, FileText, Image as ImageIcon, File, X, Info } from 'lucide-react'
import { SystemBar } from '../system-bar/SystemBar'
import { Dock } from '../dock/Dock'
import { WindowManager } from '../window/WindowManager'
import { ContextMenu } from '../context-menu/ContextMenu'
import { CommandCenter } from '../command-center/CommandCenter'
import { AppsLauncher } from '../apps-launcher/AppsLauncher'
import { MissionControl } from '../overview/MissionControl'
import { QuickSettingsDrawer } from '../quick-settings/QuickSettingsDrawer'
import { LiveWallpaper } from './LiveWallpaper'
import { useSettingsStore } from '../../stores/settingsStore'
import { useOSStore } from '../../stores/osStore'
import { useDesktopStore } from '../../stores/desktopStore'
import { useWindowStore } from '../../stores/windowStore'
import { useCommandCenterStore } from '../../stores/commandCenterStore'
import { appRegistry } from '../../core/app-registry/appRegistry'
import {
  NOVA_WALLPAPER,
  AURORA_WALLPAPER,
  DEEP_SPACE_WALLPAPER,
  OBSIDIAN_WALLPAPER,
} from '../../assets/branding'

export function Desktop() {
  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const wallpaperBlur = useSettingsStore((s) => s.wallpaperBlur)
  const openWindow = useWindowStore((s) => s.openWindow)
  const brightness = useOSStore((s) => s.brightness)
  const nightLight = useOSStore((s) => s.nightLight)

  // Desktop Store State
  const desktopItems = useDesktopStore((s) => s.desktopItems)
  const iconSize = useDesktopStore((s) => s.iconSize)
  const showDesktopIcons = useDesktopStore((s) => s.showDesktopIcons)
  const selectedIconId = useDesktopStore((s) => s.selectedIconId)
  const setSelectedIconId = useDesktopStore((s) => s.setSelectedIconId)
  const renamingId = useDesktopStore((s) => s.renamingId)
  const renameValue = useDesktopStore((s) => s.renameValue)
  const setRenamingId = useDesktopStore((s) => s.setRenamingId)
  const renameDesktopItem = useDesktopStore((s) => s.renameDesktopItem)
  const propertiesItem = useDesktopStore((s) => s.propertiesItem)
  const setPropertiesItem = useDesktopStore((s) => s.setPropertiesItem)
  const refreshDesktop = useDesktopStore((s) => s.refreshDesktop)
  const openContextMenu = useDesktopStore((s) => s.openContextMenu)
  const closeContextMenu = useDesktopStore((s) => s.closeContextMenu)

  const [editName, setEditName] = useState('')
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Initialize Desktop Files
  useEffect(() => {
    refreshDesktop()
  }, [refreshDesktop])

  useEffect(() => {
    if (renamingId && renameValue) {
      setEditName(renameValue)
    }
  }, [renamingId, renameValue])

  // Track global mouse position for Ctrl + K fallback positioning
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Keyboard Shortcuts: Ctrl + K Command Center, Ctrl + Alt + L Lock Session
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const activeElem = document.activeElement
        const isEditable =
          activeElem &&
          (activeElem.tagName === 'INPUT' ||
            activeElem.tagName === 'TEXTAREA' ||
            activeElem.tagName === 'SELECT' ||
            activeElem.isContentEditable)

        if (!isEditable) {
          e.preventDefault()
          useCommandCenterStore.getState().openCommandCenter()
        }
      }

      // Lock Screen shortcut: Ctrl + Alt + L
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        useOSStore.getState().lockSession()
      }

      // Mission Control / Overview Mode: F3 or Super
      if (e.key === 'F3' || e.key === 'Meta') {
        e.preventDefault()
        useOSStore.getState().toggleAppSwitcher()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getWallpaperUrl = () => {
    switch (wallpaper) {
      case 'aurora':
        return AURORA_WALLPAPER
      case 'deep-space':
        return DEEP_SPACE_WALLPAPER
      case 'minimal':
      case 'graphite':
      case 'cosmic':
      default:
        return OBSIDIAN_WALLPAPER
    }
  }

  // Desktop Background Right-Click
  const handleDesktopContextMenu = (e) => {
    // Only trigger desktop context menu if right clicking desktop background/main area
    if (e.target.closest('.nova-window') || e.target.closest('.nova-dock') || e.target.closest('.nova-system-bar')) {
      return
    }
    e.preventDefault()
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      context: 'desktop',
    })
  }

  // Desktop Item Right-Click
  const handleItemContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIconId(item.id)
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      context: item.type === 'folder' ? 'folder' : 'file',
      target: item,
    })
  }

  // Open item action
  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      const filesApp = appRegistry.get('files')
      if (filesApp) openWindow(filesApp, { initialFolderId: item.id, initialPath: item.path })
    } else {
      const filesApp = appRegistry.get('files')
      if (filesApp) openWindow(filesApp, { initialPath: item.path, previewId: item.id })
    }
  }

  // Icon sizing parameters
  const getIconDimensions = () => {
    switch (iconSize) {
      case 'large':
        return { boxClass: 'w-24 p-3 gap-2', iconSize: 48, textClass: 'text-xs' }
      case 'small':
        return { boxClass: 'w-16 p-1.5 gap-1', iconSize: 28, textClass: 'text-[10px]' }
      case 'medium':
      default:
        return { boxClass: 'w-20 p-2 gap-1.5', iconSize: 38, textClass: 'text-[11px]' }
    }
  }

  const { boxClass, iconSize: sizePx, textClass } = getIconDimensions()

  return (
    <div
      onContextMenu={handleDesktopContextMenu}
      onClick={(e) => {
        // Deselect icon if clicked empty desktop area
        if (e.target === e.currentTarget || e.target.id === 'desktop-area') {
          setSelectedIconId(null)
          closeContextMenu()
        }
      }}
      className="nova-desktop relative w-screen h-screen overflow-hidden flex flex-col select-none transition-all duration-500 bg-[#0B0C10]"
    >
      {/* Desktop Wallpaper Layer with Blur support */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-500 ease-out ${
          wallpaperBlur
            ? 'filter blur-[36px] brightness-75 scale-110 saturate-110'
            : 'filter-none scale-100'
        }`}
        style={{
          backgroundImage: `url(${getWallpaperUrl()})`,
        }}
      />

      {/* Interactive Live Obsidian Specular Lighting Highlights */}
      <LiveWallpaper enabled={!wallpaperBlur} />

      {/* Dark subtle overlay */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Top System Bar */}
      <SystemBar />

      {/* Desktop Main Workspace Area */}
      <main id="desktop-area" className="relative flex-1 w-full h-full overflow-hidden">
        {/* Virtual Desktop Icons Grid */}
        {showDesktopIcons && (
          <div className="absolute top-12 left-4 z-0 flex flex-col flex-wrap max-h-[calc(100vh-140px)] gap-3 p-2 pointer-events-auto">
            {desktopItems.map((item) => {
              const isSelected = selectedIconId === item.id
              const isRenaming = renamingId === item.id
              const isFolder = item.type === 'folder'

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIconId(item.id)
                  }}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  className={`flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer group ${boxClass} ${
                    isSelected
                      ? 'bg-[#00F0FF]/20 border-[#00F0FF]/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-sm'
                      : 'bg-black/10 border-transparent hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {isFolder ? (
                    <Folder size={sizePx} className="text-[#00F0FF] drop-shadow-md shrink-0" />
                  ) : item.mimeType?.startsWith('image/') ? (
                    <ImageIcon size={sizePx} className="text-emerald-400 drop-shadow-md shrink-0" />
                  ) : item.name.endsWith('.txt') ? (
                    <FileText size={sizePx} className="text-indigo-400 drop-shadow-md shrink-0" />
                  ) : (
                    <File size={sizePx} className="text-slate-300 drop-shadow-md shrink-0" />
                  )}

                  {isRenaming ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => renameDesktopItem(item.id, editName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameDesktopItem(item.id, editName)
                      }}
                      autoFocus
                      className="w-full text-center bg-black/80 border border-[#00F0FF] text-xs text-white rounded px-1 py-0.5 outline-none font-mono"
                    />
                  ) : (
                    <span
                      className={`text-center font-medium truncate w-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${textClass}`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Window Manager Layer */}
        <WindowManager />
      </main>

      {/* Floating Desktop Context Menu */}
      <ContextMenu />

      {/* System Command Center Overlay */}
      <CommandCenter />

      {/* Modern Apps Launcher Popover */}
      <AppsLauncher />

      {/* Mission Control Window Overview Mode */}
      <MissionControl />

      {/* Item Properties Modal */}
      {propertiesItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl w-80 p-5 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Info size={16} className="text-[#00F0FF]" />
                <span>Item Properties</span>
              </div>
              <button
                onClick={() => setPropertiesItem(null)}
                className="p-1 rounded hover:bg-white/10 text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-semibold">{propertiesItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white uppercase">{propertiesItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Path:</span>
                <span className="text-[#00F0FF]">{propertiesItem.path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Size:</span>
                <span className="text-white">{propertiesItem.size || 0} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-300">
                  {new Date(propertiesItem.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modified:</span>
                <span className="text-slate-300">
                  {new Date(propertiesItem.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPropertiesItem(null)}
                className="px-4 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Dock */}
      <Dock />

      {/* Quick Settings Drawer Overlay */}
      <QuickSettingsDrawer />

      {/* Hardware Display Brightness Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[95] transition-opacity duration-200"
          style={{ backgroundColor: 'black', opacity: (100 - brightness) / 100 }}
        />
      )}

      {/* Night Light Warm Amber Tint Overlay */}
      {nightLight && (
        <div
          className="fixed inset-0 pointer-events-none z-[94] bg-amber-500/15 mix-blend-color transition-opacity duration-300"
        />
      )}
    </div>
  )
}
