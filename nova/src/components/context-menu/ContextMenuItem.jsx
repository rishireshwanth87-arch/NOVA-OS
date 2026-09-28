import React from 'react'
import { ChevronRight, Check, Circle, Dot } from 'lucide-react'

export function ContextMenuItem({
  icon: IconComponent,
  label,
  shortcut,
  hasSubmenu = false,
  checked = null,
  checkType = 'radio',
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
  danger = false,
  isFocused = false,
  ariaLabel,
}) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (disabled) return
    if (onClick) onClick(e)
  }

  return (
    <div
      role="menuitem"
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      tabIndex={isFocused ? 0 : -1}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`h-[38px] px-3 flex items-center justify-between text-xs rounded-lg transition-colors cursor-pointer select-none group relative ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-slate-500'
          : danger
          ? isFocused
            ? 'bg-red-500/25 text-red-300 font-medium'
            : 'text-red-400 hover:bg-red-500/20'
          : isFocused
          ? 'bg-[#00F0FF]/15 text-[#00F0FF] font-medium border border-[#00F0FF]/30 shadow-sm'
          : 'text-slate-200 hover:bg-white/10 hover:text-white dark:text-slate-200 dark:hover:text-white light:text-slate-800 light:hover:bg-black/5'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {/* Checked indicator or Icon */}
        {checked !== null ? (
          checkType === 'radio' ? (
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              {checked ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
              ) : (
                <div className="w-2 h-2 rounded-full border border-slate-500" />
              )}
            </div>
          ) : (
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              {checked ? (
                <Check size={13} className="text-[#00F0FF] stroke-[2.5]" />
              ) : (
                <div className="w-3 h-3 rounded-sm border border-slate-500" />
              )}
            </div>
          )
        ) : IconComponent ? (
          <IconComponent
            size={15}
            className={`shrink-0 transition-colors ${
              danger
                ? 'text-red-400'
                : isFocused
                ? 'text-[#00F0FF]'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          />
        ) : (
          <div className="w-4 shrink-0" />
        )}

        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
        {shortcut && <span className="font-mono tracking-tighter opacity-70">{shortcut}</span>}
        {hasSubmenu && (
          <ChevronRight
            size={13}
            className={`transition-transform ${isFocused ? 'text-[#00F0FF] translate-x-0.5' : 'text-slate-500'}`}
          />
        )}
      </div>
    </div>
  )
}
