import React, { useEffect, useState } from 'react'
import { X, Layers, Plus, AppWindow } from 'lucide-react'
import { useOSStore } from '../../stores/osStore'
import { useWindowStore } from '../../stores/windowStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { appRegistry } from '../../core/app-registry/appRegistry'

export function MissionControl() {
  const isOpen = useOSStore((s) => s.appSwitcherOpen)
  const closeAppSwitcher = useOSStore((s) => s.closeAppSwitcher)

  const windows = useWindowStore((s) => s.windows)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)

  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace)

  const [hoveredWindowId, setHoveredWindowId] = useState(null)

  // Current workspace windows
  const activeWindows = windows.filter(
    (w) => !w.workspaceId || w.workspaceId === activeWorkspaceId
  )

  // Keyboard shortcut listener: Escape exits overview
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAppSwitcher()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeAppSwitcher])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAppSwitcher()
      }}
      className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xl flex flex-col justify-between p-8 select-none font-sans animate-in fade-in duration-200"
    >
      {/* Top Bar: Workspace Switcher Pills */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
          {workspaces.map((ws, i) => {
            const isActive = ws.id === activeWorkspaceId
            const count = windows.filter((w) => w.workspaceId === ws.id).length

            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{ws.name || `Space ${i + 1}`}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-black/30 text-black' : 'bg-white/15 text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          <button
            onClick={() => addWorkspace()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Add Workspace"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Center: Tiled Windows Grid */}
      <div className="flex-1 flex items-center justify-center my-6 overflow-hidden">
        {activeWindows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Layers size={48} className="stroke-[1.2]" />
            <p className="text-sm font-medium">No active windows in this workspace</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto p-4 max-w-6xl w-full">
            {activeWindows.map((win) => {
              const app = appRegistry.get(win.appId)

              return (
                <div
                  key={win.id}
                  onClick={() => {
                    focusWindow(win.id)
                    closeAppSwitcher()
                  }}
                  onMouseEnter={() => setHoveredWindowId(win.id)}
                  onMouseLeave={() => setHoveredWindowId(null)}
                  className="group relative flex flex-col rounded-2xl bg-[#12131C]/90 border border-white/15 hover:border-[#00F0FF]/60 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-md overflow-hidden transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Window Thumbnail Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                      <span className="font-semibold text-white truncate">{win.title || app?.name}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeWindow(win.id)
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Close Window"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Window Preview Body */}
                  <div className="h-40 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent text-slate-400 group-hover:text-white transition-colors">
                    <AppWindow size={36} className="mb-2 text-[#00F0FF]/80 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-medium text-slate-300">{win.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      {Math.round(win.width)} × {Math.round(win.height)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-slate-400 font-mono">
        Click any window to focus • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Esc</kbd> to exit Mission Control
      </div>
    </div>
  )
}
