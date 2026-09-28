import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import {
  Grid,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Monitor,
  Palette,
  Terminal,
  Folder,
  FileText,
  StickyNote,
  Info,
  ExternalLink,
  Edit2,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Eye,
  Lock,
  Sliders,
} from 'lucide-react'
import { useDesktopStore } from '../../stores/desktopStore'
import { useWindowStore } from '../../stores/windowStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { ContextMenuItem } from './ContextMenuItem'
import { ContextSubmenu } from './ContextSubmenu'
import './contextMenu.css'

export function ContextMenu() {
  const contextMenu = useDesktopStore((s) => s.contextMenu)
  const closeContextMenu = useDesktopStore((s) => s.closeContextMenu)
  const iconSize = useDesktopStore((s) => s.iconSize)
  const setIconSize = useDesktopStore((s) => s.setIconSize)
  const showDesktopIcons = useDesktopStore((s) => s.showDesktopIcons)
  const toggleShowDesktopIcons = useDesktopStore((s) => s.toggleShowDesktopIcons)
  const snapToGrid = useDesktopStore((s) => s.snapToGrid)
  const toggleSnapToGrid = useDesktopStore((s) => s.toggleSnapToGrid)
  const sortBy = useDesktopStore((s) => s.sortBy)
  const setSortBy = useDesktopStore((s) => s.setSortBy)
  const sortOrder = useDesktopStore((s) => s.sortOrder)
  const setSortOrder = useDesktopStore((s) => s.setSortOrder)
  const refreshDesktop = useDesktopStore((s) => s.refreshDesktop)
  const createDesktopFolder = useDesktopStore((s) => s.createDesktopFolder)
  const createDesktopFile = useDesktopStore((s) => s.createDesktopFile)
  const createDesktopNote = useDesktopStore((s) => s.createDesktopNote)
  const setRenamingId = useDesktopStore((s) => s.setRenamingId)
  const deleteDesktopItem = useDesktopStore((s) => s.deleteDesktopItem)
  const setPropertiesItem = useDesktopStore((s) => s.setPropertiesItem)
  const copyDesktopItem = useDesktopStore((s) => s.copyDesktopItem)
  const cutDesktopItem = useDesktopStore((s) => s.cutDesktopItem)
  const pasteDesktopItem = useDesktopStore((s) => s.pasteDesktopItem)
  const clipboard = useDesktopStore((s) => s.clipboard)

  const openWindow = useWindowStore((s) => s.openWindow)
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace)
  const lockSession = useOSStore((s) => s.lockSession)
  const wallpaperBlur = useSettingsStore((s) => s.wallpaperBlur)
  const toggleWallpaperBlur = useSettingsStore((s) => s.toggleWallpaperBlur)

  const menuRef = useRef(null)
  const [activeSubmenu, setActiveSubmenu] = useState(null) // 'view' | 'sort' | 'new' | 'more' | 'openWith'
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const submenuTimeoutRef = useRef(null)

  // Layout positioning calculation
  useLayoutEffect(() => {
    if (!contextMenu.isOpen) return
    const width = 240
    const height = contextMenu.context === 'desktop' ? 320 : 340
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    let left = contextMenu.x
    let top = contextMenu.y

    if (left + width > viewportW - 8) {
      left = Math.max(8, viewportW - width - 8)
    }
    if (top + height > viewportH - 8) {
      top = Math.max(8, viewportH - height - 8)
    }

    setPosition({ top, left })
    setFocusedIndex(-1)
    setActiveSubmenu(null)
  }, [contextMenu.isOpen, contextMenu.x, contextMenu.y, contextMenu.context])

  // Close handlers & outside click
  useEffect(() => {
    if (!contextMenu.isOpen) return

    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeContextMenu()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu.isOpen, closeContextMenu])

  if (!contextMenu.isOpen) return null

  // Helpers to open applications
  const launchApp = (appId, params = {}) => {
    closeContextMenu()
    const app = appRegistry.get(appId)
    if (app) {
      openWindow(app, params)
    }
  }

  // Submenu hover management
  const handleMouseEnterItem = (submenuName) => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    if (submenuName) {
      setActiveSubmenu(submenuName)
    } else {
      submenuTimeoutRef.current = setTimeout(() => {
        setActiveSubmenu(null)
      }, 150)
    }
  }

  // Is Desktop Context or Item Context
  const isDesktopContext = contextMenu.context === 'desktop'
  const targetItem = contextMenu.target

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Context Menu"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 min-w-[220px] max-w-[260px] w-58 p-1.5 rounded-xl nova-context-menu-surface nova-context-menu-enter select-none font-sans"
    >
      {isDesktopContext ? (
        <>
          {/* 1. View Submenu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnterItem('view')}
            onMouseLeave={() => handleMouseEnterItem(null)}
          >
            <ContextMenuItem
              icon={Grid}
              label="View"
              hasSubmenu
              isFocused={activeSubmenu === 'view'}
              onClick={() => setActiveSubmenu(activeSubmenu === 'view' ? null : 'view')}
            />
            <ContextSubmenu isOpen={activeSubmenu === 'view'}>
              <ContextMenuItem
                label="Large Icons"
                checked={iconSize === 'large'}
                checkType="radio"
                onClick={() => {
                  setIconSize('large')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Medium Icons"
                checked={iconSize === 'medium'}
                checkType="radio"
                onClick={() => {
                  setIconSize('medium')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Small Icons"
                checked={iconSize === 'small'}
                checkType="radio"
                onClick={() => {
                  setIconSize('small')
                  closeContextMenu()
                }}
              />
              <div className="my-1 border-t border-white/10" />
              <ContextMenuItem
                label="Show Desktop Icons"
                checked={showDesktopIcons}
                checkType="checkbox"
                onClick={() => {
                  toggleShowDesktopIcons()
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Snap to Grid"
                checked={snapToGrid}
                checkType="checkbox"
                onClick={() => {
                  toggleSnapToGrid()
                  closeContextMenu()
                }}
              />
            </ContextSubmenu>
          </div>

          {/* 2. Sort by Submenu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnterItem('sort')}
            onMouseLeave={() => handleMouseEnterItem(null)}
          >
            <ContextMenuItem
              icon={ArrowUpDown}
              label="Sort by"
              hasSubmenu
              isFocused={activeSubmenu === 'sort'}
              onClick={() => setActiveSubmenu(activeSubmenu === 'sort' ? null : 'sort')}
            />
            <ContextSubmenu isOpen={activeSubmenu === 'sort'}>
              <ContextMenuItem
                label="Name"
                checked={sortBy === 'name'}
                checkType="radio"
                onClick={() => {
                  setSortBy('name')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Type"
                checked={sortBy === 'type'}
                checkType="radio"
                onClick={() => {
                  setSortBy('type')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Date Modified"
                checked={sortBy === 'date'}
                checkType="radio"
                onClick={() => {
                  setSortBy('date')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Size"
                checked={sortBy === 'size'}
                checkType="radio"
                onClick={() => {
                  setSortBy('size')
                  closeContextMenu()
                }}
              />
              <div className="my-1 border-t border-white/10" />
              <ContextMenuItem
                label="Ascending"
                checked={sortOrder === 'asc'}
                checkType="radio"
                onClick={() => {
                  setSortOrder('asc')
                  closeContextMenu()
                }}
              />
              <ContextMenuItem
                label="Descending"
                checked={sortOrder === 'desc'}
                checkType="radio"
                onClick={() => {
                  setSortOrder('desc')
                  closeContextMenu()
                }}
              />
            </ContextSubmenu>
          </div>

          {/* 3. Refresh */}
          <ContextMenuItem
            icon={RefreshCw}
            label="Refresh"
            onClick={() => {
              refreshDesktop(true)
              closeContextMenu()
            }}
          />

          <div className="my-1 border-t border-white/10" />

          {/* 4. New Submenu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnterItem('new')}
            onMouseLeave={() => handleMouseEnterItem(null)}
          >
            <ContextMenuItem
              icon={Plus}
              label="New"
              hasSubmenu
              isFocused={activeSubmenu === 'new'}
              onClick={() => setActiveSubmenu(activeSubmenu === 'new' ? null : 'new')}
            />
            <ContextSubmenu isOpen={activeSubmenu === 'new'}>
              <ContextMenuItem
                icon={Folder}
                label="Folder"
                onClick={async () => {
                  closeContextMenu()
                  await createDesktopFolder()
                }}
              />
              <ContextMenuItem
                icon={FileText}
                label="Text File"
                onClick={async () => {
                  closeContextMenu()
                  await createDesktopFile()
                }}
              />
              <ContextMenuItem
                icon={StickyNote}
                label="Note"
                onClick={async () => {
                  closeContextMenu()
                  await createDesktopNote()
                  launchApp('notes')
                }}
              />
            </ContextSubmenu>
          </div>

          <div className="my-1 border-t border-white/10" />

          {/* 5. Display Settings */}
          <ContextMenuItem
            icon={Monitor}
            label="Display Settings"
            onClick={() => launchApp('settings', { section: 'desktop' })}
          />

          {/* 6. Personalize */}
          <ContextMenuItem
            icon={Palette}
            label="Personalize"
            onClick={() => launchApp('settings', { section: 'appearance' })}
          />

          <div className="my-1 border-t border-white/10" />

          {/* 7. Open in Terminal */}
          <ContextMenuItem
            icon={Terminal}
            label="Open in Terminal"
            onClick={() => launchApp('terminal', { initialDir: '/Desktop' })}
          />

          <div className="my-1 border-t border-white/10" />

          {/* 8. Blur Wallpaper Toggle */}
          <ContextMenuItem
            icon={Sliders}
            label="Blur Wallpaper"
            checked={wallpaperBlur}
            checkType="checkbox"
            onClick={() => {
              toggleWallpaperBlur()
              closeContextMenu()
            }}
          />

          {/* 9. Lock Screen */}
          <ContextMenuItem
            icon={Lock}
            label="Lock Screen"
            shortcut="Ctrl+Alt+L"
            onClick={() => {
              closeContextMenu()
              lockSession()
            }}
          />
        </>
      ) : (
        /* ITEM CONTEXT MENU (File / Folder) */
        <>
          <ContextMenuItem
            icon={Eye}
            label="Open"
            onClick={() => {
              closeContextMenu()
              if (targetItem.type === 'folder') {
                launchApp('files', { initialFolderId: targetItem.id, initialPath: targetItem.path })
              } else {
                launchApp('files', { initialPath: targetItem.path, previewId: targetItem.id })
              }
            }}
          />

          {/* Open With Submenu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnterItem('openWith')}
            onMouseLeave={() => handleMouseEnterItem(null)}
          >
            <ContextMenuItem
              icon={ExternalLink}
              label="Open With"
              hasSubmenu
              isFocused={activeSubmenu === 'openWith'}
              onClick={() => setActiveSubmenu(activeSubmenu === 'openWith' ? null : 'openWith')}
            />
            <ContextSubmenu isOpen={activeSubmenu === 'openWith'}>
              <ContextMenuItem
                icon={Folder}
                label="Files App"
                onClick={() => launchApp('files', { initialPath: targetItem.path })}
              />
              <ContextMenuItem
                icon={Terminal}
                label="Terminal Shell"
                onClick={() => launchApp('terminal', { initialDir: targetItem.path })}
              />
              {targetItem.type === 'file' && (
                <ContextMenuItem
                  icon={StickyNote}
                  label="Notes App"
                  onClick={() => launchApp('notes')}
                />
              )}
            </ContextSubmenu>
          </div>

          <div className="my-1 border-t border-white/10" />

          <ContextMenuItem
            icon={Scissors}
            label="Cut"
            onClick={() => {
              cutDesktopItem(targetItem)
              closeContextMenu()
            }}
          />

          <ContextMenuItem
            icon={Copy}
            label="Copy"
            onClick={() => {
              copyDesktopItem(targetItem)
              closeContextMenu()
            }}
          />

          <ContextMenuItem
            icon={Clipboard}
            label="Paste"
            disabled={!clipboard}
            onClick={async () => {
              await pasteDesktopItem()
              closeContextMenu()
            }}
          />

          <div className="my-1 border-t border-white/10" />

          <ContextMenuItem
            icon={Edit2}
            label="Rename"
            shortcut="F2"
            onClick={() => {
              closeContextMenu()
              setRenamingId(targetItem.id, targetItem.name)
            }}
          />

          <ContextMenuItem
            icon={Trash2}
            label="Delete"
            danger
            onClick={async () => {
              closeContextMenu()
              await deleteDesktopItem(targetItem.id)
            }}
          />

          <div className="my-1 border-t border-white/10" />

          <ContextMenuItem
            icon={Info}
            label="Properties"
            onClick={() => {
              closeContextMenu()
              setPropertiesItem(targetItem)
            }}
          />
        </>
      )}
    </div>
  )
}
