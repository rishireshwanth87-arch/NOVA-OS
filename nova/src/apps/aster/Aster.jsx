import React, { useEffect, useState } from 'react'
import { AsterTabs } from './components/AsterTabs'
import { AsterToolbar } from './components/AsterToolbar'
import { NewTab } from './components/NewTab'
import { FindBar } from './components/FindBar'
import { HistoryView } from './components/HistoryView'
import { BookmarksView } from './components/BookmarksView'
import { DownloadsView } from './components/DownloadsView'
import { AsterSettings } from './components/AsterSettings'
import { AsterContextMenu } from './components/AsterContextMenu'
import { useAsterStore } from './asterStore'
import { ExternalLink, AlertCircle, Zap, WifiOff } from 'lucide-react'

export function AsterApp({ window: win }) {
  const tabs = useAsterStore((s) => s.tabs)
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const activeView = useAsterStore((s) => s.activeView)
  const closeView = useAsterStore((s) => s.closeView)
  const createTab = useAsterStore((s) => s.createTab)
  const closeTab = useAsterStore((s) => s.closeTab)
  const switchTab = useAsterStore((s) => s.switchTab)
  const reopenClosedTab = useAsterStore((s) => s.reopenClosedTab)
  const toggleBookmarkActiveTab = useAsterStore((s) => s.toggleBookmarkActiveTab)
  const toggleProxyForTab = useAsterStore((s) => s.toggleProxyForTab)
  const openView = useAsterStore((s) => s.openView)
  const navigateTab = useAsterStore((s) => s.navigateTab)
  const reloadTab = useAsterStore((s) => s.reloadTab)
  const zoomIn = useAsterStore((s) => s.zoomIn)
  const zoomOut = useAsterStore((s) => s.zoomOut)
  const resetZoom = useAsterStore((s) => s.resetZoom)

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const [iframeError, setIframeError] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const effectiveSrc =
    activeTab?.useProxy && activeTab?.url && !activeTab.url.startsWith('aster://')
      ? `/api/proxy?url=${encodeURIComponent(activeTab.url)}`
      : activeTab?.url

  // Handle initial params if passed via openWindow(asterApp, { initialUrl: '...' })
  useEffect(() => {
    if (win?.params?.initialUrl && activeTabId) {
      navigateTab(activeTabId, win.params.initialUrl)
    }
  }, [win?.params?.initialUrl])

  useEffect(() => {
    setIframeError(false)
  }, [activeTab?.url, activeTab?.useProxy])

  // Offline network status tracking
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElem = document.activeElement
      const isInput =
        activeElem &&
        (activeElem.tagName === 'INPUT' ||
          activeElem.tagName === 'TEXTAREA' ||
          activeElem.isContentEditable)

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()

        if (key === 't' && !e.shiftKey) {
          if (!isInput || activeElem.id === 'aster-find-input') {
            e.preventDefault()
            createTab()
          }
        } else if (key === 'w') {
          if (!isInput || activeElem.id === 'aster-find-input') {
            e.preventDefault()
            if (activeTabId) closeTab(activeTabId)
          }
        } else if (key === 't' && e.shiftKey) {
          e.preventDefault()
          reopenClosedTab()
        } else if (key === 'tab') {
          e.preventDefault()
          const currentIdx = tabs.findIndex((t) => t.id === activeTabId)
          if (e.shiftKey) {
            const prevIdx = currentIdx > 0 ? currentIdx - 1 : tabs.length - 1
            switchTab(tabs[prevIdx].id)
          } else {
            const nextIdx = currentIdx < tabs.length - 1 ? currentIdx + 1 : 0
            switchTab(tabs[nextIdx].id)
          }
        } else if (key >= '1' && key <= '8') {
          if (!isInput) {
            e.preventDefault()
            const targetIdx = parseInt(key, 10) - 1
            if (tabs[targetIdx]) switchTab(tabs[targetIdx].id)
          }
        } else if (key === '9') {
          if (!isInput) {
            e.preventDefault()
            if (tabs.length) switchTab(tabs[tabs.length - 1].id)
          }
        } else if (key === 'l') {
          if (!isInput) {
            e.preventDefault()
            document.getElementById('aster-address-bar-input')?.focus()
            document.getElementById('aster-address-bar-input')?.select()
          }
        } else if (key === 'h') {
          if (!isInput) {
            e.preventDefault()
            openView('history')
          }
        } else if (key === 'd') {
          if (!isInput) {
            e.preventDefault()
            toggleBookmarkActiveTab()
          }
        } else if (key === 'f') {
          if (!isInput) {
            e.preventDefault()
            openView('find')
          }
        } else if (key === 'r') {
          if (!isInput) {
            e.preventDefault()
            if (activeTabId) reloadTab(activeTabId)
          }
        } else if (key === '=' || key === '+') {
          if (!isInput) {
            e.preventDefault()
            if (activeTabId) zoomIn(activeTabId)
          }
        } else if (key === '-') {
          if (!isInput) {
            e.preventDefault()
            if (activeTabId) zoomOut(activeTabId)
          }
        } else if (key === '0') {
          if (!isInput) {
            e.preventDefault()
            if (activeTabId) resetZoom(activeTabId)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    tabs,
    activeTabId,
    createTab,
    closeTab,
    switchTab,
    reopenClosedTab,
    openView,
    toggleBookmarkActiveTab,
    reloadTab,
    zoomIn,
    zoomOut,
    resetZoom,
  ])

  // Context Menu Handler
  const handleContextMenu = (e) => {
    // Allow standard browser context menu inside text inputs and editable areas
    const target = e.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      className="h-full w-full bg-[#0a0b10] flex flex-col text-slate-200 select-none overflow-hidden relative font-sans"
    >
      {/* Offline Status Banner */}
      {isOffline && (
        <div className="h-6 px-3 bg-amber-500/20 border-b border-amber-500/40 flex items-center justify-between text-[11px] text-amber-300 font-mono">
          <div className="flex items-center gap-1.5">
            <WifiOff size={13} />
            <span>Offline Mode — Connection unavailable</span>
          </div>
          <span>Local Storage Active</span>
        </div>
      )}

      {/* Tab Bar */}
      <AsterTabs />

      {/* Navigation Toolbar */}
      <AsterToolbar />

      {/* Find Bar Overlay */}
      <FindBar isOpen={activeView === 'find'} onClose={closeView} />

      {/* Main Viewport Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0A0B12]">
        {activeTab?.url === 'aster://newtab' ? (
          <NewTab tabId={activeTab.id} />
        ) : activeTab?.url === 'aster://history' ? (
          <HistoryView onClose={() => activeTabId && navigateTab(activeTabId, 'aster://newtab')} />
        ) : activeTab?.url === 'aster://bookmarks' ? (
          <BookmarksView onClose={() => activeTabId && navigateTab(activeTabId, 'aster://newtab')} />
        ) : activeTab?.url === 'aster://downloads' ? (
          <DownloadsView onClose={() => activeTabId && navigateTab(activeTabId, 'aster://newtab')} />
        ) : activeTab?.url === 'aster://settings' ? (
          <AsterSettings onClose={() => activeTabId && navigateTab(activeTabId, 'aster://newtab')} />
        ) : iframeError ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
            <AlertCircle size={40} className="text-amber-400 opacity-90" />
            <div>
              <h3 className="text-sm font-semibold text-white">Security / Frame Protection Notice</h3>
              <p className="text-xs text-slate-400 mt-1">
                "{activeTab?.url}" specifies security policies (e.g. X-Frame-Options or CSP) preventing direct iframe embedding.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  if (activeTabId) toggleProxyForTab(activeTabId)
                  setIframeError(false)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF] transition-colors text-xs"
              >
                <Zap size={13} />
                <span>Load via ASTER Proxy</span>
              </button>
              <a
                href={activeTab?.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/15 transition-colors text-xs"
              >
                <ExternalLink size={13} />
                <span>Open in Host Tab</span>
              </a>
              <button
                onClick={() => setIframeError(false)}
                className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <iframe
            key={`${activeTab?.id}-${effectiveSrc}`}
            src={effectiveSrc}
            title={activeTab?.title || 'ASTER Browser Content'}
            onError={() => setIframeError(true)}
            style={{ zoom: `${(activeTab?.zoomLevel || 100) / 100}` }}
            className="w-full h-full border-none bg-white select-text"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>

      {/* View Overlays */}
      {activeView === 'history' && <HistoryView onClose={closeView} />}
      {activeView === 'bookmarks' && <BookmarksView onClose={closeView} />}
      {activeView === 'downloads' && <DownloadsView onClose={closeView} />}
      {activeView === 'settings' && <AsterSettings onClose={closeView} />}

      {/* Custom ASTER Context Menu */}
      {contextMenuPos && (
        <AsterContextMenu position={contextMenuPos} onClose={() => setContextMenuPos(null)} />
      )}
    </div>
  )
}

