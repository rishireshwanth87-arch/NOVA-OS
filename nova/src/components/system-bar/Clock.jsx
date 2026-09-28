import React from 'react'
import { useClock } from '../../hooks/useClock'

export function Clock() {
  const { timeString, dateString } = useClock()

  return (
    <div className="flex items-center gap-2 text-xs font-medium tracking-tight text-slate-300 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/5">
      <span>{dateString}</span>
      <span className="text-slate-500">•</span>
      <span className="text-slate-200">{timeString}</span>
    </div>
  )
}
