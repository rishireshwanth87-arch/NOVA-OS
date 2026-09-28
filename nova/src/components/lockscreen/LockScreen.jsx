import React, { useState, useEffect, useCallback } from 'react'
import { Plus, X, User, ArrowRight, Play, Pause, SkipForward, CloudSun, Bell, Delete, ChevronDown, Lock } from 'lucide-react'
import { useOSStore } from '../../stores/osStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMusicStore } from '../../stores/musicStore'
import { useNotificationStore } from '../../stores/notificationStore'
import {
  NOVA_WALLPAPER,
  AURORA_WALLPAPER,
  DEEP_SPACE_WALLPAPER,
  OBSIDIAN_WALLPAPER,
} from '../../assets/branding'

export function LockScreen() {
  const isLocked = useOSStore((s) => s.isLocked)
  const unlockSession = useOSStore((s) => s.unlockSession)
  const currentUser = useOSStore((s) => s.currentUser) || 'Admin'
  const setCurrentUser = useOSStore((s) => s.setCurrentUser)

  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const clockFormat = useSettingsStore((s) => s.clockFormat)

  // Music Player state
  const tracks = useMusicStore((s) => s.tracks)
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex)
  const isMusicPlaying = useMusicStore((s) => s.isPlaying)
  const toggleMusicPlay = useMusicStore((s) => s.togglePlay)
  const nextTrack = useMusicStore((s) => s.nextTrack)
  const currentTrack = tracks[currentTrackIndex] || tracks[0]

  // Notifications state
  const notifications = useNotificationStore((s) => s.notifications) || []
  const unreadCount = notifications.length

  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  
  // PIN Pad state
  const [showPinPad, setShowPinPad] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState(false)

  // New User modal
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  // Live Digital Clock & Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      let hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, '0')

      if (clockFormat === '12h') {
        hours = hours % 12 || 12
      } else {
        hours = hours.toString().padStart(2, '0')
      }

      setCurrentTime(`${hours}:${minutes}`)
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [clockFormat])

  // Wallpaper selection with fallback to Obsidian
  const getWallpaperUrl = useCallback(() => {
    switch (wallpaper) {
      case 'aurora':
        return AURORA_WALLPAPER
      case 'deep-space':
        return DEEP_SPACE_WALLPAPER
      case 'graphite':
      case 'cosmic':
      case 'minimal':
      default:
        return OBSIDIAN_WALLPAPER
    }
  }, [wallpaper])

  // Handle Unlock smoothly
  const handleUnlock = useCallback(() => {
    if (isUnlocking) return
    setIsUnlocking(true)
    setTimeout(() => {
      unlockSession()
      setIsUnlocking(false)
      setShowPinPad(false)
      setPinCode('')
    }, 300)
  }, [isUnlocking, unlockSession])

  // PIN Pad digit input
  const handlePinDigit = (digit) => {
    if (pinCode.length < 4) {
      const newPin = pinCode + digit
      setPinCode(newPin)
      if (newPin.length === 4) {
        // Automatically unlock when 4 digits entered
        setTimeout(() => {
          handleUnlock()
        }, 150)
      }
    }
  }

  const handlePinBackspace = () => {
    setPinCode((p) => p.slice(0, -1))
    setPinError(false)
  }

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isLocked) return

    const handleKeyDown = (e) => {
      if (showNewUserModal) {
        if (e.key === 'Escape') setShowNewUserModal(false)
        return
      }

      if (showPinPad) {
        if (e.key === 'Escape') {
          setShowPinPad(false)
          setPinCode('')
        } else if (e.key >= '0' && e.key <= '9') {
          handlePinDigit(e.key)
        } else if (e.key === 'Backspace') {
          handlePinBackspace()
        } else if (e.key === 'Enter') {
          handleUnlock()
        }
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setShowPinPad(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLocked, showNewUserModal, showPinPad, pinCode, handleUnlock])

  const handleCreateNewSession = (e) => {
    e.preventDefault()
    const trimmed = newUserName.trim() || 'Guest'
    setCurrentUser(trimmed)
    setShowNewUserModal(false)
    setNewUserName('')
    handleUnlock()
  }

  if (!isLocked) return null

  return (
    <div
      onClick={(e) => {
        // Dismiss PIN pad if clicking outside it
        if (e.target === e.currentTarget && showPinPad) {
          setShowPinPad(false)
          setPinCode('')
        }
      }}
      className={`nova-lockscreen fixed inset-0 z-[100] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-300 ease-out font-sans ${
        isUnlocking ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Heavily Blurred Obsidian Wallpaper Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${getWallpaperUrl()})`,
          filter: 'blur(38px) brightness(0.72) saturate(1.1)',
          transform: 'scale(1.15)',
        }}
      />

      {/* Subtle Cinematic Vignette / Dimmer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/55 pointer-events-none" />

      {/* Top Center: Time & Complications */}
      <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-500 ease-out ${
        showPinPad ? 'pt-[10vh] md:pt-[12vh] scale-90 opacity-80' : 'pt-[18vh] md:pt-[22vh] scale-100 opacity-100'
      }`}>
        {/* Giant Bold Clock */}
        <h1 className="text-8xl sm:text-9xl font-bold tracking-tight text-white/95 font-sans leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          {currentTime || '11:01'}
        </h1>

        {/* Lock Screen Complications Pill (Date, Weather, Notifications) */}
        <div className="flex items-center gap-3 mt-4 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/90 text-xs font-medium shadow-md select-none">
          <span>{currentDate || 'Today'}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-1.5 text-amber-300">
            <CloudSun size={13} />
            <span>22°C Clear</span>
          </div>
          {unreadCount > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-1 text-[#00F0FF]">
                <Bell size={12} />
                <span>{unreadCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Now Playing Floating Glass Media Widget */}
        <div className="mt-4 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/15 text-white shadow-xl transition-all max-w-sm pointer-events-auto group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-sm shadow shrink-0">
            {currentTrack.cover || '🎵'}
          </div>

          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold truncate leading-tight">{currentTrack.title}</span>
            <span className="text-[10px] text-slate-300 truncate">{currentTrack.artist}</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleMusicPlay()
              }}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors focus:outline-none"
              title={isMusicPlaying ? 'Pause' : 'Play'}
            >
              {isMusicPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                nextTrack()
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors focus:outline-none"
              title="Next Track"
            >
              <SkipForward size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle: Glass PIN Pad Prompt (when active) */}
      {showPinPad && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 -mt-8 flex flex-col items-center p-5 rounded-3xl bg-[#12131C]/80 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in zoom-in-95 fade-in duration-200 select-none text-white w-72"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-[#00F0FF]" />
            <span className="text-xs font-medium text-slate-300">Enter PIN for {currentUser}</span>
          </div>

          {/* 4 PIN Dots */}
          <div className="flex items-center gap-3 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                  pinCode.length > idx
                    ? 'bg-[#00F0FF] border-[#00F0FF] scale-110 shadow-[0_0_8px_#00F0FF]'
                    : 'border-white/30 bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Keypad Grid 3x4 */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinDigit(num.toString())}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-semibold transition-all border border-white/10 focus:outline-none"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                setShowPinPad(false)
                setPinCode('')
              }}
              className="h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 font-medium transition-all focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              className="h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-semibold transition-all border border-white/10 focus:outline-none"
            >
              0
            </button>
            <button
              onClick={handlePinBackspace}
              className="h-11 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-300 transition-all focus:outline-none"
              title="Backspace"
            >
              <Delete size={16} />
            </button>
          </div>

          {/* Quick Unlock Skip */}
          <button
            onClick={handleUnlock}
            className="mt-3 text-[11px] text-[#00F0FF] hover:underline"
          >
            Quick Unlock Without PIN →
          </button>
        </div>
      )}

      {/* Bottom Area: User Switcher (Admin | + New) */}
      {!showPinPad && (
        <div className="relative z-10 pb-12 md:pb-14 flex items-center justify-center gap-6 select-none animate-in fade-in duration-300">
          {/* Admin User Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowPinPad(true)
            }}
            className="flex flex-col items-center group focus:outline-none transition-transform"
            title={`Unlock as ${currentUser}`}
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:bg-white/20 group-hover:border-white/40 group-active:scale-95">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white/90 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-normal text-white/90 group-hover:text-white tracking-wide transition-colors mt-2 text-center">
              {currentUser}
            </span>
          </button>

          {/* Thin Vertical Divider Line */}
          <div className="w-[1px] h-7 bg-white/25 self-start mt-2" />

          {/* + New User / Guest Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNewUserModal(true)
            }}
            className="flex flex-col items-center group focus:outline-none transition-transform"
            title="Switch User / Guest Session"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:bg-white/20 group-hover:border-white/40 group-active:scale-95">
              <Plus className="w-5 h-5 text-white/90 group-hover:text-white stroke-[2.2] transition-colors" />
            </div>
            <span className="text-xs md:text-sm font-normal text-white/90 group-hover:text-white tracking-wide transition-colors mt-2 text-center">
              New
            </span>
          </button>
        </div>
      )}

      {/* New User / Guest Modal */}
      {showNewUserModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="bg-[#14151f]/95 border border-white/15 rounded-2xl p-6 w-80 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#00F0FF]" />
                <h3 className="font-medium text-sm">Switch or Add User</h3>
              </div>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewSession} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">User Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Guest"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  autoFocus
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00F0FF]/60 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser('Guest')
                    setShowNewUserModal(false)
                    handleUnlock()
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Guest Mode
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00F0FF] text-black rounded-xl text-xs font-semibold hover:bg-[#33F3FF] transition-colors"
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
