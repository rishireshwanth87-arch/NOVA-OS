import React from 'react'
import { Settings, X, Search, Shield, Palette, HardDrive } from 'lucide-react'
import { useAsterStore } from '../asterStore'
import { clearHistory } from '../services/historyService'
import { clearDownloads } from '../services/downloadService'
import { useNotificationStore } from '../../../stores/notificationStore'

export function AsterSettings({ onClose }) {
  const defaultSearchEngine = useAsterStore((s) => s.defaultSearchEngine)
  const setDefaultSearchEngine = useAsterStore((s) => s.setDefaultSearchEngine)
  const showBookmarksBar = useAsterStore((s) => s.showBookmarksBar)
  const setShowBookmarksBar = useAsterStore((s) => s.setShowBookmarksBar)
  const compactTabs = useAsterStore((s) => s.compactTabs)
  const setCompactTabs = useAsterStore((s) => s.setCompactTabs)

  const handleClearHistory = async () => {
    await clearHistory()
    useNotificationStore.getState().addNotification({
      title: 'ASTER Privacy',
      message: 'Browsing history cleared',
      type: 'info',
    })
  }

  const handleClearDownloads = async () => {
    await clearDownloads()
    useNotificationStore.getState().addNotification({
      title: 'ASTER Downloads',
      message: 'Downloads record cleared',
      type: 'info',
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#12131C] border border-white/15 rounded-2xl shadow-2xl w-[560px] max-w-full h-[460px] flex flex-col overflow-hidden text-xs text-slate-200 font-sans">
        <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Settings size={16} className="text-[#00F0FF]" />
            <span>ASTER Browser Settings</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-auto space-y-5">
          {/* Search Engine */}
          <div className="space-y-2 bg-white/5 border border-white/10 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Search size={15} className="text-[#00F0FF]" />
              <span>Default Search Engine</span>
            </div>
            <p className="text-[11px] text-slate-400">Select default search engine for non-URL queries in address bar.</p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'duckduckgo', name: 'DuckDuckGo' },
                { id: 'google', name: 'Google' },
                { id: 'wikipedia', name: 'Wikipedia' },
              ].map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => setDefaultSearchEngine(engine.id)}
                  className={`py-2 px-3 rounded-lg border transition-all text-center ${
                    defaultSearchEngine === engine.id
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white font-medium'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {engine.name}
                </button>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Palette size={15} className="text-emerald-400" />
              <span>Tab & Interface Appearance</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <div>
                <div className="font-semibold text-white">Compact Tab Mode</div>
                <div className="text-[11px] text-slate-400">Reduce tab height for more vertical content space.</div>
              </div>
              <input
                type="checkbox"
                checked={compactTabs}
                onChange={(e) => setCompactTabs(e.target.checked)}
                className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Shield size={15} className="text-purple-400" />
              <span>Privacy & Browsing Data</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClearHistory}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 text-white font-medium"
              >
                Clear History
              </button>
              <button
                onClick={handleClearDownloads}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 text-white font-medium"
              >
                Clear Downloads List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
