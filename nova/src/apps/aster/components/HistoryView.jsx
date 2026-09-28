import React, { useState, useEffect } from 'react'
import { Clock, Search, Trash2, X, Globe, ExternalLink } from 'lucide-react'
import { getHistory, searchHistory, deleteHistoryItem, clearHistory } from '../services/historyService'
import { useAsterStore } from '../asterStore'

export function HistoryView({ onClose }) {
  const [historyItems, setHistoryItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const navigateTab = useAsterStore((s) => s.navigateTab)

  const loadHistory = async () => {
    const res = await searchHistory(searchQuery)
    setHistoryItems(res)
  }

  useEffect(() => {
    loadHistory()
  }, [searchQuery])

  const handleDelete = async (url) => {
    await deleteHistoryItem(url)
    loadHistory()
  }

  const handleClearAll = async () => {
    await clearHistory()
    loadHistory()
  }

  const handleNavigate = (url) => {
    if (activeTabId) {
      navigateTab(activeTabId, url)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#12131C] border border-white/15 rounded-2xl shadow-2xl w-[640px] max-w-full h-[480px] flex flex-col overflow-hidden text-xs text-slate-200 font-sans">
        {/* Header */}
        <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Clock size={16} className="text-[#00F0FF]" />
            <span>ASTER Browsing History (Ctrl+H)</span>
          </div>
          <div className="flex items-center gap-2">
            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors"
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toolbar Filter */}
        <div className="p-3 border-b border-white/10 bg-[#0c0d15] flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search browsing history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 p-3 overflow-auto space-y-1.5">
          {historyItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Clock size={32} className="opacity-40" />
              <span>No history records found</span>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.url}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div
                  onClick={() => handleNavigate(item.url)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                >
                  <Globe size={16} className="text-[#00F0FF] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(item.url)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
