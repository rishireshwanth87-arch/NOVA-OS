import React, { useRef, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Layers,
  Sparkles,
  Settings,
  BatteryCharging,
  Eye,
  Sliders,
} from 'lucide-react'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMusicStore } from '../../stores/musicStore'
import { useJarvisStore } from '../../stores/jarvisStore'
import { useWindowStore } from '../../stores/windowStore'
import { appRegistry } from '../../core/app-registry/appRegistry'

export function QuickSettingsDrawer() {
  const isOpen = useOSStore((s) => s.quickSettingsOpen)
  const closeQuickSettings = useOSStore((s) => s.closeQuickSettings)

  const brightness = useOSStore((s) => s.brightness)
  const setBrightness = useOSStore((s) => s.setBrightness)
  const nightLight = useOSStore((s) => s.nightLight)
  const toggleNightLight = useOSStore((s) => s.toggleNightLight)
  const wifiEnabled = useOSStore((s) => s.wifiEnabled)
  const toggleWifi = useOSStore((s) => s.toggleWifi)
  const bluetoothEnabled = useOSStore((s) => s.bluetoothEnabled)
  const toggleBluetooth = useOSStore((s) => s.toggleBluetooth)
  const lockSession = useOSStore((s) => s.lockSession)
  const toggleAppSwitcher = useOSStore((s) => s.toggleAppSwitcher)

  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  const volume = useMusicStore((s) => s.volume)
  const setVolume = useMusicStore((s) => s.setVolume)
  const isMuted = useMusicStore((s) => s.isMuted)
  const setIsMuted = useMusicStore((s) => s.setIsMuted)

  const toggleJarvis = useJarvisStore((s) => s.toggleJarvis)
  const openWindow = useWindowStore((s) => s.openWindow)

  const drawerRef = useRef(null)

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        // Also ensure not clicking the tray toggle button
        if (!e.target.closest('#nova-dock-tray-btn') && !e.target.closest('.nova-systembar')) {
          closeQuickSettings()
        }
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen, closeQuickSettings])

  if (!isOpen) return null

  return (
    <div
      ref={drawerRef}
      className="fixed bottom-16 right-4 md:right-8 z-50 w-80 bg-[#12131C]/96 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none text-white font-sans animate-in zoom-in-95 fade-in duration-200"
    >
      {/* Top 2x2 Network & Theme Matrix Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* Wi-Fi Card */}
        <button
          onClick={toggleWifi}
          className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
            wifiEnabled
              ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'bg-white/10 text-slate-400 hover:bg-white/15'
          }`}
        >
          {wifiEnabled ? <Wifi size={20} /> : <WifiOff size={20} />}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold">Wi-Fi</span>
            <span className="text-[10px] opacity-80 truncate max-w-[80px]">
              {wifiEnabled ? 'NOVA-5G' : 'Off'}
            </span>
          </div>
        </button>

        {/* Bluetooth Card */}
        <button
          onClick={toggleBluetooth}
          className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
            bluetoothEnabled
              ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'bg-white/10 text-slate-400 hover:bg-white/15'
          }`}
        >
          <Bluetooth size={20} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold">Bluetooth</span>
            <span className="text-[10px] opacity-80 truncate max-w-[80px]">
              {bluetoothEnabled ? 'Connected' : 'Off'}
            </span>
          </div>
        </button>

        {/* Dark / Light Mode Card */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center gap-3 transition-all text-white"
        >
          {theme === 'dark' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold">Theme</span>
            <span className="text-[10px] text-slate-400 capitalize">{theme} Mode</span>
          </div>
        </button>

        {/* Night Light (Warm eye-care tint) Card */}
        <button
          onClick={toggleNightLight}
          className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
            nightLight
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'bg-white/10 text-slate-300 hover:bg-white/15'
          }`}
        >
          <Eye size={20} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold">Night Light</span>
            <span className="text-[10px] opacity-80">{nightLight ? 'Warm Tint' : 'Off'}</span>
          </div>
        </button>
      </div>

      {/* Sliders Container */}
      <div className="space-y-3 bg-black/30 p-3 rounded-2xl border border-white/5 mb-3">
        {/* Brightness Slider */}
        <div className="flex items-center gap-3">
          <Sun size={16} className="text-slate-400 shrink-0" />
          <input
            type="range"
            min="30"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-[#00F0FF] h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {brightness}%
          </span>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white shrink-0 focus:outline-none"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false)
              setVolume(Number(e.target.value))
            }}
            className="w-full accent-[#00F0FF] h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Bottom Quick OS Tool Actions */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10">
        <button
          onClick={() => {
            closeQuickSettings()
            lockSession()
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white group"
          title="Lock Screen"
        >
          <Lock size={16} className="group-hover:text-[#00F0FF] transition-colors" />
          <span className="text-[10px]">Lock</span>
        </button>

        <button
          onClick={() => {
            closeQuickSettings()
            toggleAppSwitcher()
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white group"
          title="Mission Control"
        >
          <Layers size={16} className="group-hover:text-[#00F0FF] transition-colors" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => {
            closeQuickSettings()
            toggleJarvis()
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white group"
          title="JARVIS Assistant"
        >
          <Sparkles size={16} className="text-[#00F0FF] animate-pulse" />
          <span className="text-[10px]">JARVIS</span>
        </button>

        <button
          onClick={() => {
            closeQuickSettings()
            const settingsApp = appRegistry.get('settings')
            if (settingsApp) openWindow(settingsApp)
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white group"
          title="All Settings"
        >
          <Settings size={16} className="group-hover:text-[#00F0FF] transition-colors" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </div>
  )
}
