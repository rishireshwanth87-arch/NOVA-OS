import React, { useState } from 'react'
import {
  Compass,
  Search,
  Globe,
  Clock,
  Star,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react'
import { useAsterStore } from '../asterStore'

export function NewTab({ tabId }) {
  const navigateTab = useAsterStore((s) => s.navigateTab)
  const updateTab = useAsterStore((s) => s.updateTab)
  const defaultSearchEngine = useAsterStore((s) => s.defaultSearchEngine)
  const openView = useAsterStore((s) => s.openView)

  const [query, setQuery] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigateTab(tabId, query.trim())
    }
  }

  const quickLinks = [
    { title: 'GitHub', url: 'https://github.com', useProxy: true, icon: Globe },
    { title: 'Google', url: 'https://www.google.com', useProxy: true, icon: Search },
    { title: 'Wikipedia', url: 'https://en.wikipedia.org', useProxy: true, icon: Globe },
    { title: 'DuckDuckGo', url: 'https://duckduckgo.com', useProxy: true, icon: Search },
    { title: 'History', url: 'aster://history', icon: Clock },
    { title: 'Bookmarks', url: 'aster://bookmarks', icon: Star },
  ]

  return (
    <div className="h-full w-full bg-[#0A0B12] text-slate-200 flex flex-col items-center justify-center p-6 select-none overflow-auto">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in duration-300">
        {/* Brand */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,240,255,0.25)]">
            <Compass size={36} className="text-[#00F0FF] animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">ASTER</h1>
          <p className="text-xs text-[#00F0FF] font-semibold tracking-wider">NOVA WEB BROWSER</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search with ${defaultSearchEngine} or enter URL...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/15 hover:border-white/25 focus:border-[#00F0FF] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none shadow-xl transition-all font-sans"
          />
        </form>

        {/* Quick Links */}
        <div className="grid grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const IconComp = link.icon
            return (
              <button
                key={link.title}
                onClick={() => {
                  if (link.useProxy) updateTab(tabId, { useProxy: true })
                  if (link.action) link.action()
                  else navigateTab(tabId, link.url)
                }}
                className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl flex flex-col items-center gap-2 transition-all group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#00F0FF]/15 group-hover:text-[#00F0FF] transition-colors">
                  <IconComp size={18} />
                </div>
                <span className="text-[11px] font-medium text-slate-300 truncate w-full">
                  {link.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Browser Telemetry Info */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-[#00F0FF]" />
            <span>Extensible Rendering Architecture</span>
          </div>
          <span>IndexedDB Storage Ready</span>
        </div>
      </div>
    </div>
  )
}
