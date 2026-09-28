import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, X, Volume2, Sparkles, Radio, Terminal as TerminalIcon } from 'lucide-react'
import { useJarvisStore } from '../../stores/jarvisStore'
import { jarvisService } from '../../services/jarvisService'

export function JarvisHUD() {
  const isOpen = useJarvisStore((s) => s.isOpen)
  const closeJarvis = useJarvisStore((s) => s.closeJarvis)
  const isListening = useJarvisStore((s) => s.isListening)
  const isSpeaking = useJarvisStore((s) => s.isSpeaking)
  const isThinking = useJarvisStore((s) => s.isThinking)
  const transcript = useJarvisStore((s) => s.transcript)
  const response = useJarvisStore((s) => s.response)
  const history = useJarvisStore((s) => s.history)

  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, response])

  // Toggle listening
  const handleToggleMic = () => {
    if (isListening) {
      jarvisService.stopListening()
    } else {
      jarvisService.startListening()
    }
  }

  const handleSubmitText = (e) => {
    e?.preventDefault()
    if (!inputVal.trim()) return
    jarvisService.handleCommand(inputVal)
    setInputVal('')
  }

  const handleQuickChip = (command) => {
    jarvisService.handleCommand(command)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeJarvis()
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none font-sans"
    >
      {/* Holographic Window Container */}
      <div className="relative w-full max-w-lg bg-[#0d0e17]/95 border border-[#00F0FF]/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden text-white backdrop-blur-2xl">
        {/* Top Arc-Reactor Header */}
        <div className="relative h-44 flex flex-col items-center justify-center border-b border-white/10 bg-gradient-to-b from-[#00F0FF]/10 via-transparent to-transparent overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${
            isSpeaking ? 'bg-[#00F0FF]/25 scale-125' : isListening ? 'bg-[#E01A22]/30 scale-110 animate-pulse' : 'bg-[#00F0FF]/15 scale-90'
          }`} />

          {/* Holographic Arc Reactor Visualizer */}
          <div className="relative flex items-center justify-center">
            {/* Outer Rotating Dashed Ring */}
            <div
              className={`w-28 h-28 rounded-full border border-dashed border-[#00F0FF]/40 animate-spin transition-all ${
                isSpeaking ? 'duration-[3s]' : 'duration-[12s]'
              }`}
            />
            {/* Middle Reverse Ring */}
            <div
              className="absolute w-20 h-20 rounded-full border border-[#00F0FF]/60 border-t-transparent border-b-transparent animate-spin transition-all duration-[6s]"
              style={{ animationDirection: 'reverse' }}
            />
            {/* Core Arc Reactor Orb */}
            <div
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_#00F0FF] ${
                isSpeaking
                  ? 'bg-gradient-to-tr from-[#00F0FF] to-cyan-300 scale-110 animate-pulse'
                  : isListening
                  ? 'bg-gradient-to-tr from-[#E01A22] to-amber-400 scale-105 shadow-[0_0_20px_#E01A22]'
                  : 'bg-[#00F0FF]/80'
              }`}
            >
              <Radio size={20} className="text-black" />
            </div>
          </div>

          {/* Status Text & Waveform */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#00F0FF] font-semibold">
              {isListening ? 'JARVIS LISTENING...' : isSpeaking ? 'JARVIS VOCALIZING...' : isThinking ? 'PROCESSING DIRECTIVE...' : 'JARVIS PROTOCOL ACTIVE'}
            </span>
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-[#E01A22] animate-ping" />
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={closeJarvis}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Conversation Stream */}
        <div className="p-4 space-y-3 max-h-56 overflow-y-auto font-sans text-xs">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'jarvis' && (
                <div className="w-5 h-5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center text-[10px] text-[#00F0FF] shrink-0 mt-0.5">
                  J
                </div>
              )}
              <div
                className={`px-3.5 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#00F0FF] text-black font-medium'
                    : 'bg-white/10 text-slate-100 border border-white/10 font-normal'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current Live Transcription (Interim) */}
          {transcript && isListening && (
            <div className="flex justify-end">
              <div className="px-3.5 py-1.5 rounded-2xl bg-[#E01A22]/20 border border-[#E01A22]/40 text-[#E01A22] text-xs font-mono animate-pulse">
                "{transcript}"
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/20">
          {[
            'Open Files',
            'Play Music',
            'Lock Screen',
            'What\'s the weather?',
            'Switch to Dark Mode',
            'System Health',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleQuickChip(chip)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/40 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Input & Mic Toolbar */}
        <form onSubmit={handleSubmitText} className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2">
          {/* Microphone Push-to-Talk Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-2.5 rounded-2xl transition-all duration-200 focus:outline-none flex items-center justify-center ${
              isListening
                ? 'bg-[#E01A22] text-white shadow-[0_0_15px_#E01A22] scale-105'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to Jarvis'}
          >
            {isListening ? <Mic size={18} className="animate-pulse" /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask Jarvis anything or speak aloud..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-white/5 border border-white/15 focus:border-[#00F0FF]/60 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-2xl bg-[#00F0FF] disabled:opacity-30 text-black font-semibold hover:bg-[#33F3FF] transition-all disabled:pointer-events-none"
            title="Send Directive"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
