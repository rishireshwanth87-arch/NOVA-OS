import React, { useState } from 'react'
import { Image as ImageIcon, Download, Check, Maximize2 } from 'lucide-react'
import {
  NOVA_WALLPAPER,
  AURORA_WALLPAPER,
  DEEP_SPACE_WALLPAPER,
  OBSIDIAN_WALLPAPER,
} from '../../assets/branding'
import { useSettingsStore } from '../../stores/settingsStore'
import { useNotificationStore } from '../../stores/notificationStore'

export function GalleryApp() {
  const currentWallpaper = useSettingsStore((s) => s.wallpaper)
  const setWallpaper = useSettingsStore((s) => s.setWallpaper)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const wallpapers = [
    { id: 'cosmic', name: 'NOVA Cosmic Peak', src: NOVA_WALLPAPER },
    { id: 'aurora', name: 'Aurora Borealis', src: AURORA_WALLPAPER },
    { id: 'deep-space', name: 'Deep Space Nebula', src: DEEP_SPACE_WALLPAPER },
    { id: 'minimal', name: 'Obsidian Minimal', src: OBSIDIAN_WALLPAPER },
  ]

  const [selectedImage, setSelectedImage] = useState(wallpapers[0])

  const handleSetWallpaper = (item) => {
    setWallpaper(item.id)
    addNotification({
      title: 'Gallery',
      message: `Wallpaper updated to "${item.name}"`,
      type: 'success',
    })
  }

  return (
    <div className="h-full w-full bg-[#0a0b12] text-slate-200 flex flex-col select-none overflow-hidden font-sans">
      {/* Main Preview Area */}
      <div className="flex-1 relative bg-black/60 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={selectedImage.src}
          alt={selectedImage.name}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-all"
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 text-xs">
          <span className="font-medium text-white">{selectedImage.name}</span>
          <button
            onClick={() => handleSetWallpaper(selectedImage)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF] text-black font-semibold rounded-full hover:bg-[#33F3FF] transition-colors text-[11px]"
          >
            <Check size={12} />
            <span>Set as Wallpaper</span>
          </button>
        </div>
      </div>

      {/* Thumbnails Filmstrip */}
      <div className="h-24 bg-[#12131C] border-t border-white/10 p-3 flex items-center gap-3 overflow-x-auto">
        {wallpapers.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className={`h-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative shrink-0 ${
              selectedImage.id === item.id
                ? 'border-[#00F0FF] scale-105 shadow-md shadow-[#00F0FF]/20'
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
            }`}
          >
            <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
            {currentWallpaper === item.id && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00F0FF]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
