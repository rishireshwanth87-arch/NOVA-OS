import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Star,
  Download,
  MoreVertical,
  Zap,
  ExternalLink,
} from 'lucide-react'
import { useAsterStore } from '../asterStore'
import { isBookmarked } from '../services/bookmarkService'
import { AddressBar } from './AddressBar'
import { BrowserMenu } from './BrowserMenu'

export function AsterToolbar() {
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const tabs = useAsterStore((s) => s.tabs)
  const goBack = useAsterStore((s) => s.goBack)
  const goForward = useAsterStore((s) => s.goForward)
  const reloadTab = useAsterStore((s) => s.reloadTab)
  const toggleBookmarkActiveTab = useAsterStore((s) => s.toggleBookmarkActiveTab)
  const toggleProxyForTab = useAsterStore((s) => s.toggleProxyForTab)
  const openView = useAsterStore((s) => s.openView)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const [bookmarked, setBookmarked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const canGoBack = activeTab ? activeTab.historyIndex > 0 : false
  const canGoForward = activeTab ? activeTab.historyIndex < activeTab.historyStack.length - 1 : false

  useEffect(() => {
    let isMounted = true
    const checkBmk = async () => {
      if (activeTab?.url) {
        const res = await isBookmarked(activeTab.url)
        if (isMounted) setBookmarked(res)
      }
    }
    checkBmk()
    return () => {
      isMounted = false
    }
  }, [activeTab?.url])

  const isWebUrl = activeTab?.url && !activeTab.url.startsWith('aster://') && !activeTab.url.startsWith('about:')

  return (
    <div className="h-10 px-3 bg-[#111320] border-b border-white/10 flex items-center justify-between gap-2 text-xs select-none shrink-0 relative">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => activeTabId && goBack(activeTabId)}
          disabled={!canGoBack}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Back"
        >
          <ArrowLeft size={14} />
        </button>

        <button
          onClick={() => activeTabId && goForward(activeTabId)}
          disabled={!canGoForward}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>

        <button
          onClick={() => activeTabId && reloadTab(activeTabId)}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
          title="Reload"
        >
          <RotateCw size={13} className={activeTab?.loading ? 'animate-spin text-[#00F0FF]' : ''} />
        </button>
      </div>

      {/* Address Bar */}
      <AddressBar />

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => activeTabId && toggleProxyForTab(activeTabId)}
          className={`p-1.5 rounded-md transition-colors ${
            activeTab?.useProxy
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40'
              : 'hover:bg-white/10 text-slate-400'
          }`}
          title={activeTab?.useProxy ? 'ASTER Proxy Enabled (Bypasses Frame Blocks)' : 'Enable ASTER Web Proxy'}
        >
          <Zap size={14} />
        </button>

        {isWebUrl && (
          <a
            href={activeTab.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
            title="Open in Host Browser Tab"
          >
            <ExternalLink size={14} />
          </a>
        )}

        <button
          onClick={toggleBookmarkActiveTab}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
          title="Bookmark current page (Ctrl+D)"
        >
          <Star size={14} className={bookmarked ? 'text-amber-400 fill-amber-400' : ''} />
        </button>

        <button
          onClick={() => openView('downloads')}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
          title="Downloads"
        >
          <Download size={14} />
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
          title="ASTER Menu"
        >
          <MoreVertical size={14} />
        </button>

        <BrowserMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
  )
}
