import React from 'react'
import {
  Plus,
  Shield,
  Clock,
  Star,
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  Settings,
  Info,
} from 'lucide-react'
import { useAsterStore } from '../asterStore'

export function BrowserMenu({ isOpen, onClose }) {
  const createTab = useAsterStore((s) => s.createTab)
  const openView = useAsterStore((s) => s.openView)
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const tabs = useAsterStore((s) => s.tabs)
  const updateTab = useAsterStore((s) => s.updateTab)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const currentZoom = activeTab?.zoomLevel || 100

  if (!isOpen) return null

  const handleZoom = (delta) => {
    if (!activeTabId) return
    const newZoom = Math.min(200, Math.max(50, currentZoom + delta))
    updateTab(activeTabId, { zoomLevel: newZoom })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div className="absolute right-2 top-10 z-50 w-56 bg-[#12131C]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 select-none space-y-0.5 font-sans">
        <button
          onClick={() => {
            onClose()
            createTab()
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Plus size={14} className="text-[#00F0FF]" />
            <span>New Tab</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ctrl+T</span>
        </button>

        <button
          onClick={() => {
            onClose()
            createTab('aster://newtab', true)
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            <span>New Private Tab</span>
          </div>
        </button>

        <div className="my-1 border-t border-white/10" />

        <button
          onClick={() => {
            onClose()
            openView('history')
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>History</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ctrl+H</span>
        </button>

        <button
          onClick={() => {
            onClose()
            openView('bookmarks')
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Star size={14} />
            <span>Bookmarks</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ctrl+D</span>
        </button>

        <button
          onClick={() => {
            onClose()
            openView('downloads')
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Download size={14} />
            <span>Downloads</span>
          </div>
        </button>

        <button
          onClick={() => {
            onClose()
            openView('find')
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span>Find in Page</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ctrl+F</span>
        </button>

        <div className="my-1 border-t border-white/10" />

        {/* Zoom Control */}
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-slate-400">Zoom</span>
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-1 py-0.5 font-mono text-[11px]">
            <button
              onClick={() => handleZoom(-10)}
              className="p-0.5 hover:bg-white/10 rounded text-slate-300"
            >
              <ZoomOut size={12} />
            </button>
            <span className="w-8 text-center">{currentZoom}%</span>
            <button
              onClick={() => handleZoom(10)}
              className="p-0.5 hover:bg-white/10 rounded text-slate-300"
            >
              <ZoomIn size={12} />
            </button>
          </div>
        </div>

        <div className="my-1 border-t border-white/10" />

        <button
          onClick={() => {
            onClose()
            openView('settings')
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} />
            <span>Settings</span>
          </div>
        </button>
      </div>
    </>
  )
}
