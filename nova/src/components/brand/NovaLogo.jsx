import React from 'react'
import { NOVA_LOGO } from '../../assets/branding'

export function NovaBirdIcon({ size = 24, className = '', color = '#E01A22' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Head Crest */}
        <polygon points="50,18 55,25 50,32 45,25" />
        
        {/* Diamond Beak */}
        <polygon points="50,29 54,37 50,47 46,37" fill={color} fillOpacity="0.15" />
        
        {/* Inner V Chest Plate */}
        <polygon points="50,42 58,35 56,52 50,60 44,52 42,35" />
        
        {/* Outer Chevron Shield */}
        <polygon points="50,51 64,39 62,58 50,71 38,58 36,39" />

        {/* Left Wing */}
        {/* Wing Upper Spar */}
        <polyline points="44,32 35,25 18,25 12,32" />
        {/* Feather 1 (Top) */}
        <polygon points="12,32 26,38 38,36 44,32" />
        {/* Feather 2 */}
        <polygon points="15,35 24,43 36,41 26,38" />
        {/* Feather 3 */}
        <polygon points="20,38 27,47 36,45 28,42" />

        {/* Right Wing (Symmetrical) */}
        {/* Wing Upper Spar */}
        <polyline points="56,32 65,25 82,25 88,32" />
        {/* Feather 1 (Top) */}
        <polygon points="88,32 74,38 62,36 56,32" />
        {/* Feather 2 */}
        <polygon points="85,35 76,43 64,41 74,38" />
        {/* Feather 3 */}
        <polygon points="80,38 73,47 64,45 72,42" />

        {/* Tail Feathers */}
        {/* Center Tail Feather */}
        <polygon points="50,64 54,75 50,88 46,75" fill={color} fillOpacity="0.1" />
        {/* Left Inner Tail */}
        <polygon points="47,65 42,74 43,84 48,76" />
        {/* Right Inner Tail */}
        <polygon points="53,65 58,74 57,84 52,76" />
        {/* Left Outer Tail */}
        <polygon points="44,63 38,69 40,77 46,73" />
        {/* Right Outer Tail */}
        <polygon points="56,63 62,69 60,77 54,73" />
      </g>
    </svg>
  )
}

export function NovaLogo({ size = 24, className = '', animate = false, useImage = false, showText = false }) {
  if (useImage) {
    return (
      <div className={`inline-flex flex-col items-center shrink-0 ${className}`}>
        <img
          src={NOVA_LOGO}
          alt="NOVA WebOS"
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`object-contain rounded-xl ${animate ? 'animate-pulse' : ''}`}
        />
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {animate && (
          <div className="absolute inset-0 bg-[#E01A22]/20 blur-md rounded-full animate-ping" />
        )}
        <NovaBirdIcon size={size} color="#E01A22" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-extrabold tracking-wider text-white uppercase font-sans">
            NOVA
          </span>
          <span className="text-[8px] font-semibold tracking-[0.25em] text-[#E01A22] uppercase">
            W E B O S
          </span>
        </div>
      )}
    </div>
  )
}
