import React from 'react'
import { Plus, X, Shield, Globe, Compass } from 'lucide-react'
import { useAsterStore } from '../asterStore'

export function AsterTabs() {
  const tabs = useAsterStore((s) => s.tabs)
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const createTab = useAsterStore((s) => s.createTab)
  const closeTab = useAsterStore((s) => s.closeTab)
  const switchTab = useAsterStore((s) => s.switchTab)
  const compactTabs = useAsterStore((s) => s.compactTabs)

  return (
    <div className="h-9 bg-[#0e101a] border-b border-white/10 flex items-center px-2 gap-1 select-none overflow-x-auto shrink-0">
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const isActive = activeTabId === t.id
          const isInternal = t.url.startsWith('aster://')

          return (
            <div
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`h-7 px-2.5 rounded-t-lg border-t border-x flex items-center gap-2 cursor-pointer transition-all min-w-[120px] max-w-[200px] shrink-0 group ${
                compactTabs ? 'py-1 text-[11px]' : 'text-xs'
              } ${
                isActive
                  ? 'bg-[#151726] border-white/20 text-white font-medium shadow-sm'
                  : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              {t.isPrivate ? (
                <Shield size={12} className="text-purple-400 shrink-0" />
              ) : isInternal ? (
                <Compass size={12} className="text-[#00F0FF] shrink-0" />
              ) : (
                <Globe size={12} className="text-slate-400 shrink-0" />
              )}

              <span className="truncate flex-1">
                {t.url === 'aster://newtab' ? 'New Tab' : t.title || t.url}
              </span>

              {t.loading && (
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#00F0FF] border-t-transparent animate-spin shrink-0" />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(t.id)
                }}
                className="p-0.5 rounded hover:bg-white/20 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <X size={11} />
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => createTab()}
        className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
        title="New Tab (Ctrl+T)"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
