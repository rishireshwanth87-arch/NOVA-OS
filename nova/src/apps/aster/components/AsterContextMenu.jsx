import React, { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Star,
  Copy,
  Plus,
  Shield,
  Zap,
  Check,
} from 'lucide-react'
import { useAsterStore } from '../asterStore'
import { useNotificationStore } from '../../../stores/notificationStore'

export function AsterContextMenu({ position, onClose }) {
  const menuRef = useRef(null)
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const tabs = useAsterStore((s) => s.tabs)
  const goBack = useAsterStore((s) => s.goBack)
  const goForward = useAsterStore((s) => s.goForward)
  const reloadTab = useAsterStore((s) => s.reloadTab)
  const createTab = useAsterStore((s) => s.createTab)
  const toggleBookmarkActiveTab = useAsterStore((s) => s.toggleBookmarkActiveTab)
  const toggleProxyForTab = useAsterStore((s) => s.toggleProxyForTab)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const canGoBack = activeTab ? activeTab.historyIndex > 0 : false
  const canGoForward = activeTab ? activeTab.historyIndex < activeTab.historyStack.length - 1 : false

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!position) return null

  // Ensure context menu stays inside window bounds
  const x = Math.min(position.x, window.innerWidth - 220)
  const y = Math.min(position.y, window.innerHeight - 260)

  const handleCopyUrl = () => {
    if (activeTab?.url) {
      navigator.clipboard.writeText(activeTab.url)
      useNotificationStore.getState().addNotification({
        title: 'ASTER',
        message: 'URL copied to clipboard',
        type: 'info',
      })
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-52 bg-[#121422]/95 border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
    >
      {/* Top Quick Actions Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1 px-1">
        <button
          disabled={!canGoBack}
          onClick={() => {
            if (activeTabId) goBack(activeTabId)
            onClose()
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Back"
        >
          <ArrowLeft size={14} />
        </button>

        <button
          disabled={!canGoForward}
          onClick={() => {
            if (activeTabId) goForward(activeTabId)
            onClose()
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>

        <button
          onClick={() => {
            if (activeTabId) reloadTab(activeTabId)
            onClose()
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          title="Reload"
        >
          <RotateCw size={13} />
        </button>

        <button
          onClick={() => {
            toggleBookmarkActiveTab()
            onClose()
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          title="Bookmark"
        >
          <Star size={14} />
        </button>
      </div>

      {/* Main Context Menu Items */}
      <div className="space-y-0.5">
        <button
          onClick={() => {
            createTab()
            onClose()
          }}
          className="w-full h-8 px-2.5 rounded-lg flex items-center justify-between hover:bg-[#00F0FF]/15 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Plus size={14} className="text-[#00F0FF]" />
            <span>New Tab</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+T</span>
        </button>

        <button
          onClick={() => {
            createTab('aster://newtab', true)
            onClose()
          }}
          className="w-full h-8 px-2.5 rounded-lg flex items-center justify-between hover:bg-purple-500/20 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            <span>New Private Tab</span>
          </div>
        </button>

        <div className="h-px bg-white/10 my-1" />

        <button
          onClick={handleCopyUrl}
          className="w-full h-8 px-2.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Copy size={13} className="text-slate-400" />
            <span>Copy Page URL</span>
          </div>
        </button>

        <button
          onClick={() => {
            if (activeTabId) toggleProxyForTab(activeTabId)
            onClose()
          }}
          className="w-full h-8 px-2.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap size={13} className={activeTab?.useProxy ? 'text-[#00F0FF]' : 'text-slate-400'} />
            <span>ASTER Web Proxy</span>
          </div>
          {activeTab?.useProxy && <Check size={13} className="text-[#00F0FF]" />}
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-1.5 pt-1.5 border-t border-white/10 px-2 text-[10px] text-slate-500 font-mono flex justify-between">
        <span>ASTER Web OS</span>
        <span>Native Menu</span>
      </div>
    </div>
  )
}
