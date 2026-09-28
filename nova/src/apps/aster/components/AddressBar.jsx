import React, { useState, useEffect, useRef } from 'react'
import { Lock, Globe, Search, Compass, Shield } from 'lucide-react'
import { useAsterStore } from '../asterStore'

export function AddressBar() {
  const activeTabId = useAsterStore((s) => s.activeTabId)
  const tabs = useAsterStore((s) => s.tabs)
  const navigateTab = useAsterStore((s) => s.navigateTab)
  const defaultSearchEngine = useAsterStore((s) => s.defaultSearchEngine)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const [inputVal, setInputVal] = useState(activeTab?.url || '')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isEditing && activeTab) {
      setInputVal(activeTab.url === 'aster://newtab' ? '' : activeTab.url)
    }
  }, [activeTab?.url, activeTabId, isEditing])

  // Ctrl + L shortcut listener to focus address bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTabId && inputVal.trim()) {
      setIsEditing(false)
      navigateTab(activeTabId, inputVal.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
      setInputVal(activeTab?.url === 'aster://newtab' ? '' : activeTab?.url || '')
      inputRef.current?.blur()
    }
  }

  const isHttps = activeTab?.url.startsWith('https://')
  const isInternal = activeTab?.url.startsWith('aster://')

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex items-center gap-2 h-7 bg-[#0b0c13] border border-white/10 hover:border-white/20 focus-within:border-[#00F0FF]/50 rounded-lg px-2.5 transition-all"
    >
      {activeTab?.isPrivate ? (
        <Shield size={13} className="text-purple-400 shrink-0" title="Private Session" />
      ) : isInternal ? (
        <Compass size={13} className="text-[#00F0FF] shrink-0" />
      ) : isHttps ? (
        <Lock size={13} className="text-emerald-400 shrink-0" title="Secure HTTPS Connection" />
      ) : (
        <Globe size={13} className="text-slate-400 shrink-0" />
      )}

      <input
        ref={inputRef}
        id="aster-address-bar-input"
        type="text"
        placeholder={`Search with ${defaultSearchEngine} or enter web address...`}
        value={inputVal}
        onFocus={() => {
          setIsEditing(true)
          inputRef.current?.select()
        }}
        onBlur={() => setIsEditing(false)}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
      />

      <Search size={12} className="text-slate-500 shrink-0" />
    </form>
  )
}
