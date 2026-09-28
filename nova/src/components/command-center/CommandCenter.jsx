import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  AppWindow,
  Folder,
  FileText,
  StickyNote,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  HardDrive,
  Activity,
  Download,
  Upload,
  Bell,
  Lock,
  Layers,
  ChevronRight,
  Sparkles,
  Compass,
  Clock,
  Star,
} from 'lucide-react'
import { useCommandCenterStore } from '../../stores/commandCenterStore'
import { useWindowStore } from '../../stores/windowStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useDesktopStore } from '../../stores/desktopStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { getAllFromStore } from '../../storage/db'
import { getNotes } from '../../storage/notesService'
import { asterActions } from '../../apps/aster/asterActions'

export function CommandCenter() {
  const isOpen = useCommandCenterStore((s) => s.isOpen)
  const closeCommandCenter = useCommandCenterStore((s) => s.closeCommandCenter)
  const recentActions = useCommandCenterStore((s) => s.recentActions)
  const addRecentAction = useCommandCenterStore((s) => s.addRecentAction)

  const openWindow = useWindowStore((s) => s.openWindow)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const refreshDesktop = useDesktopStore((s) => s.refreshDesktop)
  const toggleNotificationCenter = useNotificationStore((s) => s.toggleNotificationCenter)
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // System Action Definitions
  const systemActions = [
    {
      id: 'action-theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'System Action',
      type: 'action',
      icon: theme === 'dark' ? Sun : Moon,
      execute: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      id: 'action-refresh',
      title: 'Refresh Desktop State',
      category: 'System Action',
      type: 'action',
      icon: RefreshCw,
      execute: () => refreshDesktop(true),
    },
    {
      id: 'action-notif',
      title: 'Toggle Notification Center',
      category: 'System Action',
      type: 'action',
      icon: Bell,
      execute: () => toggleNotificationCenter(),
    },
    {
      id: 'action-lock',
      title: 'Lock NOVA Session',
      category: 'System Action',
      type: 'action',
      icon: Lock,
      execute: () => {
        closeCommandCenter()
        useOSStore.getState().lockSession()
      },
    },
    {
      id: 'action-new-ws',
      title: 'Create New Virtual Workspace',
      category: 'System Action',
      type: 'action',
      icon: Layers,
      execute: () => {
        addWorkspace()
        const settingsApp = appRegistry.get('settings')
        if (settingsApp) openWindow(settingsApp, { section: 'workspaces' })
      },
    },
    {
      id: 'action-storage',
      title: 'Storage & Backup Management',
      category: 'System Action',
      type: 'action',
      icon: HardDrive,
      execute: () => {
        const sysMon = appRegistry.get('system-monitor') || appRegistry.get('settings')
        if (sysMon) openWindow(sysMon, { section: 'system' })
      },
    },
    {
      id: 'action-aster-new-tab',
      title: 'New ASTER Browser Tab',
      category: 'Browser Action',
      type: 'action',
      icon: Compass,
      execute: () => asterActions.openTab(),
    },
    {
      id: 'action-aster-history',
      title: 'Open ASTER History',
      category: 'Browser Action',
      type: 'action',
      icon: Clock,
      execute: () => asterActions.openHistory(),
    },
    {
      id: 'action-aster-bookmarks',
      title: 'Open ASTER Bookmarks',
      category: 'Browser Action',
      type: 'action',
      icon: Star,
      execute: () => asterActions.openBookmarks(),
    },
    {
      id: 'action-aster-downloads',
      title: 'Open ASTER Downloads',
      category: 'Browser Action',
      type: 'action',
      icon: Download,
      execute: () => asterActions.openDownloads(),
    },
  ]

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Search logic
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const runSearch = async () => {
      const q = query.trim().toLowerCase()
      if (!q) {
        setResults([])
        setSelectedIndex(0)
        return
      }

      const matchResults = []

      // 1. Match Applications
      const apps = appRegistry.getAll()
      apps.forEach((app) => {
        if (
          app.name.toLowerCase().includes(q) ||
          app.description?.toLowerCase().includes(q) ||
          app.category?.toLowerCase().includes(q)
        ) {
          matchResults.push({
            id: `app-${app.id}`,
            title: app.name,
            subtitle: app.description || 'Application',
            category: 'Applications',
            type: 'app',
            icon: AppWindow,
            execute: () => openWindow(app),
          })
        }
      })

      // 2. Match Actions
      systemActions.forEach((act) => {
        if (act.title.toLowerCase().includes(q) || act.category.toLowerCase().includes(q)) {
          matchResults.push(act)
        }
      })

      // 3. Match Files & Folders
      try {
        const allFiles = await getAllFromStore('files')
        allFiles.forEach((file) => {
          if (!file.trashed && file.name.toLowerCase().includes(q)) {
            const isFolder = file.type === 'folder'
            matchResults.push({
              id: `file-${file.id}`,
              title: file.name,
              subtitle: file.path,
              category: isFolder ? 'Folders' : 'Files',
              type: 'file',
              icon: isFolder ? Folder : FileText,
              execute: () => {
                const filesApp = appRegistry.get('files')
                if (filesApp) {
                  if (isFolder) {
                    openWindow(filesApp, { initialFolderId: file.id, initialPath: file.path })
                  } else {
                    openWindow(filesApp, { initialPath: file.path, previewId: file.id })
                  }
                }
              },
            })
          }
        })
      } catch (e) {
        console.error('Failed to search files:', e)
      }

      // 4. Match Notes
      try {
        const allNotes = await getNotes()
        allNotes.forEach((note) => {
          if (
            !note.archived &&
            (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q))
          ) {
            matchResults.push({
              id: `note-${note.id}`,
              title: note.title,
              subtitle: note.content.slice(0, 60) || 'Note',
              category: 'Notes',
              type: 'note',
              icon: StickyNote,
              execute: () => {
                const notesApp = appRegistry.get('notes')
                if (notesApp) openWindow(notesApp, { noteId: note.id })
              },
            })
          }
        })
      } catch (e) {
        console.error('Failed to search notes:', e)
      }

      if (isMounted) {
        setResults(matchResults.slice(0, 12))
        setSelectedIndex(0)
      }
    }

    runSearch()
    return () => {
      isMounted = false
    }
  }, [query, isOpen])

  if (!isOpen) return null

  const activeItems = query.trim()
    ? results
    : recentActions.map((rec) => {
        const app = appRegistry.get(rec.targetId)
        return {
          id: rec.id,
          title: rec.title,
          subtitle: app?.description || 'Recent Action',
          category: 'Recent',
          type: rec.type,
          icon: AppWindow,
          execute: () => {
            if (app) openWindow(app)
          },
        }
      })

  const handleExecute = (item) => {
    if (!item) return
    if (item.execute) item.execute()
    addRecentAction({
      id: item.id,
      title: item.title,
      category: item.category,
      type: item.type,
      targetId: item.id.replace(/^app-/, ''),
    })
    closeCommandCenter()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeCommandCenter()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < activeItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeItems[selectedIndex]) {
        handleExecute(activeItems[selectedIndex])
      }
    }
  }

  return (
    <div
      onClick={closeCommandCenter}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 p-4 font-sans select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-full bg-[#121420]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
      >
        {/* Input Bar */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-white/10 bg-white/5">
          <Search size={18} className="text-[#00F0FF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search NOVA (Apps, Files, Notes, Settings, Actions)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/10 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-auto p-2 space-y-1">
          {!query.trim() && (
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
              <span>Recent Items</span>
              <span className="text-[9px] lowercase font-normal text-slate-500">press ↑↓ enter</span>
            </div>
          )}

          {activeItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <Sparkles size={24} className="opacity-40" />
              <span>No matching results found for "{query}"</span>
            </div>
          ) : (
            activeItems.map((item, idx) => {
              const isSelected = selectedIndex === idx
              const IconComp = item.icon || AppWindow

              return (
                <div
                  key={item.id}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`h-11 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-white shadow-md'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-[#00F0FF] text-black' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <IconComp size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-white">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 text-slate-400 rounded-md font-mono border border-white/5">
                      {item.category}
                    </span>
                    <ChevronRight
                      size={14}
                      className={isSelected ? 'text-[#00F0FF]' : 'text-slate-600'}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="h-9 px-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>NOVA Command Center</span>
        </div>
      </div>
    </div>
  )
}
