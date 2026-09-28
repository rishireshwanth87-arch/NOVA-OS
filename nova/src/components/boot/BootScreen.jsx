import React, { useEffect, useState } from 'react'
import { useOSStore } from '../../stores/osStore'
import { NovaLogo } from '../brand/NovaLogo'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function BootScreen() {
  const bootState = useOSStore((s) => s.bootState)
  const completeBoot = useOSStore((s) => s.completeBoot)
  const setBootProgress = useOSStore((s) => s.setBootProgress)
  const bootProgress = useOSStore((s) => s.bootProgress)
  const bootMessage = useOSStore((s) => s.bootMessage)

  const prefersReducedMotion = useReducedMotion()
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (bootState !== 'booting') return

    if (prefersReducedMotion) {
      completeBoot()
      return
    }

    const stages = [
      { progress: 25, message: 'Initializing NOVA Kernel...', delay: 150 },
      { progress: 60, message: 'Loading App Registry...', delay: 350 },
      { progress: 90, message: 'Restoring System Preferences...', delay: 550 },
      { progress: 100, message: 'Ready', delay: 750 },
    ]

    const timers = stages.map(({ progress, message, delay }) =>
      setTimeout(() => {
        setBootProgress(progress, message)
        if (progress === 100) {
          setFadingOut(true)
          setTimeout(() => {
            completeBoot()
          }, 200)
        }
      }, delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [bootState, completeBoot, setBootProgress, prefersReducedMotion])

  if (bootState === 'ready') return null

  return (
    <div
      className={`nova-bootscreen fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C10] text-slate-100 transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#E01A22]/20 blur-2xl rounded-full animate-pulse" />
          <NovaLogo size={88} animate className="relative z-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-widest text-white uppercase font-sans">
            NOVA
          </h1>
          <p className="text-[11px] font-semibold text-[#E01A22] tracking-[0.3em] uppercase">
            W E B O S
          </p>
        </div>

        <div className="w-48 space-y-2 mt-4">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] to-indigo-500 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight h-4">
            {bootMessage}
          </p>
        </div>
      </div>
    </div>
  )
}
