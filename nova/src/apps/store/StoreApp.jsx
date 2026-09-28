import React, { useState } from 'react'
import {
  ShoppingBag,
  Download,
  Check,
  Star,
  Search,
  Sparkles,
  Zap,
  Globe,
  Music,
  Code,
  Camera,
  Image as ImageIcon,
} from 'lucide-react'
import { appRegistry } from '../../core/app-registry/appRegistry'
import { useWindowStore } from '../../stores/windowStore'
import { useNotificationStore } from '../../stores/notificationStore'

const STORE_APPS = [
  {
    id: 'aster',
    name: 'ASTER Browser',
    category: 'Internet',
    desc: 'High performance web browser with proxy support and tab management.',
    icon: Globe,
    rating: 4.9,
    reviews: 1420,
    installed: true,
  },
  {
    id: 'studio',
    name: 'NOVA Studio',
    category: 'Development',
    desc: 'Lightweight code editor and script runner for JavaScript, Python, and web.',
    icon: Code,
    rating: 4.8,
    reviews: 980,
    installed: true,
  },
  {
    id: 'camera',
    name: 'Camera',
    category: 'Media',
    desc: 'Capture snapshots and apply cyberpunk visual filters.',
    icon: Camera,
    rating: 4.6,
    reviews: 430,
    installed: true,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    category: 'Creativity',
    desc: 'Browse, preview, and set custom desktop wallpapers and media.',
    icon: ImageIcon,
    rating: 4.7,
    reviews: 610,
    installed: true,
  },
  {
    id: 'music',
    name: 'Music Player',
    category: 'Entertainment',
    desc: 'Ambient audio synthesizer, cyber lofi player and audio visualizer.',
    icon: Music,
    rating: 4.9,
    reviews: 890,
    installed: true,
  },
  {
    id: 'cyber-paint',
    name: 'CyberPaint 3D',
    category: 'Creativity',
    desc: 'Vector and pixel art graphics illustration suite.',
    icon: Sparkles,
    rating: 4.5,
    reviews: 310,
    installed: false,
  },
]

export function StoreApp() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [installedList, setInstalledList] = useState(
    STORE_APPS.filter((a) => a.installed).map((a) => a.id)
  )
  const openWindow = useWindowStore((s) => s.openWindow)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const categories = ['All', 'Internet', 'Development', 'Media', 'Creativity', 'Entertainment']

  const filteredApps = STORE_APPS.filter((app) => {
    const matchesCat = activeCategory === 'All' || app.category === activeCategory
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleInstall = (app) => {
    if (installedList.includes(app.id)) {
      // Launch app
      const reg = appRegistry.get(app.id)
      if (reg) openWindow(reg)
    } else {
      setInstalledList([...installedList, app.id])
      addNotification({
        title: 'App Store',
        message: `Successfully installed ${app.name}!`,
        type: 'success',
      })
    }
  }

  return (
    <div className="h-full w-full bg-[#0a0b12] text-slate-200 flex flex-col select-none overflow-hidden font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#00F0FF]/10 border-b border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-purple-400" />
            <h1 className="text-lg font-bold text-white tracking-wide">NOVA App Store</h1>
          </div>
          <p className="text-xs text-slate-400">Discover verified applications and ecosystem tools.</p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="px-6 py-2 bg-[#12131C] border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
              activeCategory === cat
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Grid */}
      <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
        {filteredApps.map((app) => {
          const IconComp = app.icon
          const isInstalled = installedList.includes(app.id)

          return (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600/30 to-[#00F0FF]/20 border border-white/10 flex items-center justify-center shrink-0">
                <IconComp size={24} className="text-purple-300" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white truncate">{app.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Star size={11} className="fill-amber-400" />
                    <span>{app.rating}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">{app.desc}</p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">{app.category}</span>
                  <button
                    onClick={() => handleInstall(app)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isInstalled
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md'
                    }`}
                  >
                    {isInstalled ? <Check size={12} /> : <Download size={12} />}
                    <span>{isInstalled ? 'Open' : 'Get'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
