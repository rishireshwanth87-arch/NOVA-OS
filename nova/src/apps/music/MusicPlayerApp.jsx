import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc } from 'lucide-react'

const TRACKS = [
  { id: 1, title: 'Neon Horizon', artist: 'NOVA Sound Collective', duration: '3:45', bpm: 85 },
  { id: 2, title: 'Cyber Rain', artist: 'Aetheria', duration: '4:12', bpm: 90 },
  { id: 3, title: 'Orbital Sunset', artist: 'Synthia', duration: '3:20', bpm: 78 },
  { id: 4, title: 'Digital Dreamscape', artist: 'Subzero', duration: '5:01', bpm: 95 },
]

import { useMusicStore } from '../../stores/musicStore'

export function MusicPlayerApp() {
  const tracks = useMusicStore((s) => s.tracks)
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex)
  const isPlaying = useMusicStore((s) => s.isPlaying)
  const progress = useMusicStore((s) => s.progress)
  const volume = useMusicStore((s) => s.volume)
  const isMuted = useMusicStore((s) => s.isMuted)
  const togglePlay = useMusicStore((s) => s.togglePlay)
  const nextTrack = useMusicStore((s) => s.nextTrack)
  const prevTrack = useMusicStore((s) => s.prevTrack)
  const setTrack = useMusicStore((s) => s.setTrack)
  const setProgress = useMusicStore((s) => s.setProgress)
  const setVolume = useMusicStore((s) => s.setVolume)
  const setIsMuted = useMusicStore((s) => s.setIsMuted)

  const audioContextRef = useRef(null)
  const oscillatorRef = useRef(null)
  const gainNodeRef = useRef(null)

  const currentTrack = tracks[currentTrackIndex]

  // Synthesize pleasant ambient synth tones via Web Audio
  useEffect(() => {
    if (isPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
        }
        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        // Friendly musical frequencies
        const baseFreq = [220, 261.63, 293.66, 329.63][currentTrackIndex % 4]
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)

        const effectiveVol = isMuted ? 0 : volume * 0.15
        gain.gain.setValueAtTime(effectiveVol, ctx.currentTime)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()

        oscillatorRef.current = osc
        gainNodeRef.current = gain
      } catch (e) {
        console.warn('AudioContext error:', e)
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
          oscillatorRef.current.disconnect()
        } catch (e) {}
        oscillatorRef.current = null
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
          oscillatorRef.current.disconnect()
        } catch (e) {}
        oscillatorRef.current = null
      }
    }
  }, [isPlaying, currentTrackIndex, isMuted, volume])

  // Timer loop for progress bar
  useEffect(() => {
    let timer = null
    if (isPlaying) {
      timer = setInterval(() => {
        const currentP = useMusicStore.getState().progress
        if (currentP >= 100) {
          nextTrack()
        } else {
          setProgress(currentP + 0.5)
        }
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, currentTrackIndex, nextTrack, setProgress])

  return (
    <div className="h-full w-full bg-[#0d0e17] text-slate-100 flex flex-col select-none overflow-hidden font-sans p-6">
      {/* Vinyl / Cover Art */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-5">
        <div className={`w-36 h-36 rounded-full bg-gradient-to-tr from-purple-600 to-[#00F0FF] p-1.5 shadow-[0_0_40px_rgba(0,240,255,0.25)] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }}>
          <div className="w-full h-full rounded-full bg-[#121320] border-4 border-black/40 flex items-center justify-center">
            <Disc size={44} className="text-[#00F0FF]" />
          </div>
        </div>

        {/* Track Details */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold text-white tracking-wide">{currentTrack.title}</h2>
          <p className="text-xs text-purple-400 font-medium">{currentTrack.artist}</p>
        </div>

        {/* Visualizer Simulation */}
        <div className="flex items-end justify-center gap-1.5 h-8">
          {[40, 70, 90, 60, 100, 75, 45, 80, 50, 65, 85, 30].map((h, i) => (
            <div
              key={i}
              style={{ height: isPlaying ? `${Math.max(15, (h * (1 + (i % 3) * 0.2)) % 100)}%` : '15%' }}
              className="w-1.5 bg-gradient-to-t from-purple-500 to-[#00F0FF] rounded-full transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 my-3">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-[#00F0FF] transition-all"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0:{Math.floor(progress * 2.2).toString().padStart(2, '0')}</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value))
              setIsMuted(false)
            }}
            className="w-16 h-1 accent-[#00F0FF]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevTrack}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-[#00F0FF] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
          </button>
          <button
            onClick={nextTrack}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          {currentTrack.bpm} BPM
        </div>
      </div>
    </div>
  )
}
