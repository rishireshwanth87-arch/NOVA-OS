import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useAsterStore } from '../asterStore'

export function FindBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen])

  // Ctrl + F listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        const activeElem = document.activeElement
        const isEditable =
          activeElem &&
          (activeElem.tagName === 'INPUT' ||
            activeElem.tagName === 'TEXTAREA' ||
            activeElem.isContentEditable)

        if (!isEditable || activeElem.id === 'aster-find-input') {
          e.preventDefault()
          useAsterStore.getState().openView('find')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  const handleNext = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev < matchCount ? prev + 1 : 1))
    }
  }

  const handlePrev = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev > 1 ? prev - 1 : matchCount))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      if (e.shiftKey) handlePrev()
      else handleNext()
    }
  }

  const handleQueryChange = (val) => {
    setQuery(val)
    if (val.trim()) {
      const simulatedCount = Math.floor(Math.random() * 8) + 1
      setMatchCount(simulatedCount)
      setCurrentMatch(1)
    } else {
      setMatchCount(0)
      setCurrentMatch(0)
    }
  }

  return (
    <div className="absolute right-4 top-12 z-30 bg-[#12131C]/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl p-1.5 flex items-center gap-2 text-xs text-slate-200 select-none">
      <div className="flex items-center gap-1 bg-[#0b0c13] border border-white/10 rounded-lg px-2 py-1">
        <Search size={13} className="text-[#00F0FF] shrink-0" />
        <input
          id="aster-find-input"
          ref={inputRef}
          type="text"
          placeholder="Find in page..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-36 bg-transparent text-xs text-white focus:outline-none font-mono"
        />
        {query && (
          <span className="text-[10px] text-slate-400 font-mono pl-1 border-l border-white/10">
            {matchCount > 0 ? `${currentMatch} / ${matchCount}` : '0 results'}
          </span>
        )}
      </div>

      <button
        onClick={handlePrev}
        disabled={matchCount === 0}
        className="p-1 rounded hover:bg-white/10 text-slate-300 disabled:opacity-30"
      >
        <ChevronUp size={14} />
      </button>

      <button
        onClick={handleNext}
        disabled={matchCount === 0}
        className="p-1 rounded hover:bg-white/10 text-slate-300 disabled:opacity-30"
      >
        <ChevronDown size={14} />
      </button>

      <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
        <X size={14} />
      </button>
    </div>
  )
}
