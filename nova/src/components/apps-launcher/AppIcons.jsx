import React from 'react'

export function AppIcon({ id, size = 44, className = '' }) {
  switch (id) {
    case 'aster':
    case 'browser':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform ${className}`}
        >
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full p-1.5">
            <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" />
            <ellipse cx="18" cy="18" rx="7" ry="14" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" />
            <line x1="4" y1="18" x2="32" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <line x1="6" y1="11" x2="30" y2="11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            <line x1="6" y1="25" x2="30" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            {/* Cursor */}
            <path
              d="M19 19L27 23L23 25L25 29L23 30L21 26L18 28L19 19Z"
              fill="#FFFFFF"
              stroke="#0A3C9E"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      )

    case 'calculator':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-md flex flex-col justify-between group-hover:scale-105 transition-transform ${className}`}
        >
          <div className="flex justify-between items-center px-1 pt-0.5 text-white font-bold text-[10px]">
            <span>+</span>
            <span>−</span>
          </div>
          <div className="w-full h-[1px] bg-white/30 my-0.5" />
          <div className="flex justify-between items-center px-1 pb-0.5 text-white font-bold text-[10px]">
            <span>×</span>
            <span>=</span>
          </div>
        </div>
      )

    case 'camera':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-b from-slate-700 via-blue-950 to-slate-900 p-1 shadow-md flex items-center justify-center relative group-hover:scale-105 transition-transform ${className}`}
        >
          <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_orange]" />
          <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-400 flex items-center justify-center shadow-inner">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow" />
          </div>
        </div>
      )

    case 'files':
      return (
        <div
          style={{ width: size, height: size }}
          className={`flex items-center justify-center group-hover:scale-105 transition-transform ${className}`}
        >
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow-md">
            <path
              d="M6 13C6 11.3431 7.34315 10 9 10H16L19 14H31C32.6569 14 34 15.3431 34 17V29C34 30.6569 32.6569 32 31 32H9C7.34315 32 6 30.6569 6 29V13Z"
              fill="#EAB308"
            />
            <path
              d="M6 17C6 15.3431 7.34315 14 9 14H31C32.6569 14 34 15.3431 34 17V29C34 30.6569 32.6569 32 31 32H9C7.34315 32 6 30.6569 6 29V17Z"
              fill="#FBBF24"
            />
          </svg>
        </div>
      )

    case 'gallery':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 p-1 shadow-md flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform ${className}`}
        >
          <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-300 shadow" />
          <svg viewBox="0 0 32 24" fill="none" className="w-full h-full absolute bottom-0">
            <path d="M0 24L10 12L18 20L24 14L32 24H0Z" fill="#FFFFFF" fillOpacity="0.9" />
            <path d="M12 24L18 17L26 24H12Z" fill="#CBD5E1" fillOpacity="0.95" />
          </svg>
        </div>
      )

    case 'music':
    case 'musicplr':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 p-1 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform ${className}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white stroke-current stroke-2">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
          </svg>
        </div>
      )

    case 'settings':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-full flex items-center justify-center relative group-hover:scale-105 transition-transform ${className}`}
        >
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow-md">
            {/* Gear Body */}
            <path
              d="M20 7L22.5 10.5L27 9.5L28 14L32.5 14.5L31.5 19L35 21.5L32.5 25.5L34.5 30L30 31L29.5 35.5L25 34.5L22.5 38L18.5 35.5L14 37.5L13 33L8.5 32.5L9.5 28L6 25.5L8.5 21.5L6.5 17L11 16L11.5 11.5L16 12.5L18.5 9L20 7Z"
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth="1"
            />
            {/* Blue Center */}
            <circle cx="20.5" cy="23.5" r="7" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
        </div>
      )

    case 'store':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-b from-indigo-500 to-purple-700 p-1.5 shadow-md flex items-center justify-center relative group-hover:scale-105 transition-transform ${className}`}
        >
          {/* Bag handle */}
          <div className="absolute -top-1 w-4 h-3 rounded-t-full border-2 border-white/60 bg-transparent" />
          {/* Rocket emblem */}
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
            <path
              d="M4.5 16.5C4.5 16.5 6 15 8 15C10 15 11 16 11 16L16 11C16 11 15 10 15 8C15 6 16.5 4.5 16.5 4.5C16.5 4.5 19.5 7.5 19.5 12C19.5 15.5 17.5 18 17.5 18L13 13.5C13 13.5 12 14.5 12 16.5C12 18.5 10.5 20 10.5 20C10.5 20 8.5 17 4.5 16.5Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )

    case 'studio':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform ${className}`}
        >
          <span className="text-white font-mono font-bold text-sm tracking-tighter">
            {'</>'}
          </span>
        </div>
      )

    case 'notes':
    case 'text':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 shadow-md flex items-center justify-center relative group-hover:scale-105 transition-transform ${className}`}
        >
          <div className="w-full h-full flex flex-col justify-center gap-1 px-1">
            <div className="w-full h-0.5 bg-white/70 rounded" />
            <div className="w-3/4 h-0.5 bg-white/70 rounded" />
            <div className="w-1/2 h-0.5 bg-white/70 rounded" />
          </div>
          {/* Pencil */}
          <div className="absolute right-1 bottom-1 w-3 h-5 rotate-45 flex flex-col items-center">
            <div className="w-1.5 h-3 bg-amber-400 rounded-t" />
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-amber-700" />
          </div>
        </div>
      )

    case 'calendar':
    case 'time':
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-full bg-white shadow-md p-1 flex items-center justify-center border border-slate-200 relative group-hover:scale-105 transition-transform ${className}`}
        >
          <div className="w-full h-full rounded-full border border-slate-300 flex items-center justify-center relative">
            {/* Ticks */}
            <span className="absolute top-0.5 w-0.5 h-1 bg-slate-800" />
            <span className="absolute right-0.5 w-1 h-0.5 bg-slate-800" />
            <span className="absolute bottom-0.5 w-0.5 h-1 bg-slate-800" />
            <span className="absolute left-0.5 w-1 h-0.5 bg-slate-800" />
            {/* Clock Hands */}
            <div className="w-0.5 h-2 bg-slate-900 absolute top-1.5 origin-bottom rounded" />
            <div className="w-2.5 h-0.5 bg-slate-900 absolute right-1 origin-left rounded" />
            <div className="w-1 h-1 rounded-full bg-red-500 z-10" />
          </div>
        </div>
      )

    default:
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${className}`}
        >
          <span className="font-bold text-xs uppercase">{id.substring(0, 2)}</span>
        </div>
      )
  }
}
