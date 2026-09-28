import React, { useState } from 'react'
import { Play, RotateCcw, Copy, Check, FileCode, Terminal as TerminalIcon } from 'lucide-react'
import { useNotificationStore } from '../../stores/notificationStore'

export function StudioApp() {
  const [code, setCode] = useState(`// Welcome to NOVA Studio
// Write JavaScript or explore algorithms

function calculateOrbit(velocity, altitude) {
  const G = 6.67430e-11;
  const earthMass = 5.972e24;
  const earthRadius = 6371000;
  const r = earthRadius + altitude;
  
  const orbitalVelocity = Math.sqrt((G * earthMass) / r);
  return {
    actualVelocity: velocity + ' m/s',
    requiredOrbitalVelocity: Math.round(orbitalVelocity) + ' m/s',
    stable: velocity >= orbitalVelocity
  };
}

console.log("=== NOVA Orbit Telemetry ===");
console.log(calculateOrbit(7800, 400000));
`)
  const [output, setOutput] = useState(['Ready to execute. Click Run (Ctrl+Enter) to evaluate code.'])
  const [copied, setCopied] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const runCode = () => {
    const logs = []
    const customConsole = {
      log: (...args) => {
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        )
      },
      error: (...args) => {
        logs.push('[ERROR] ' + args.join(' '))
      },
      warn: (...args) => {
        logs.push('[WARN] ' + args.join(' '))
      },
    }

    try {
      const runner = new Function('console', code)
      runner(customConsole)
      setOutput(logs.length > 0 ? logs : ['Execution completed with no output.'])
    } catch (err) {
      setOutput([`[Runtime Error]: ${err.message}`])
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addNotification({
      title: 'Studio',
      message: 'Code copied to clipboard',
      type: 'info',
    })
  }

  return (
    <div className="h-full w-full bg-[#0a0b12] text-slate-200 flex flex-col select-none overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="h-10 px-4 bg-[#12131C] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <FileCode size={15} className="text-[#00F0FF]" />
          <span className="text-white font-medium">script.js</span>
          <span className="text-[10px] text-slate-500">JavaScript Sandbox</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>Copy</span>
          </button>
          <button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF] text-black font-semibold rounded hover:bg-[#33F3FF] transition-colors text-xs shadow-md shadow-[#00F0FF]/20"
          >
            <Play size={13} className="fill-black" />
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Code Input */}
        <div className="flex-1 p-3 bg-[#08090f] overflow-auto font-mono text-xs">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                runCode()
              }
            }}
            spellCheck={false}
            className="w-full h-full bg-transparent text-slate-200 resize-none outline-none font-mono leading-relaxed"
          />
        </div>

        {/* Output Console */}
        <div className="h-36 bg-[#0E0F17] border-t border-white/10 p-3 font-mono text-xs flex flex-col">
          <div className="flex items-center gap-1.5 pb-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-b border-white/5">
            <TerminalIcon size={12} className="text-slate-400" />
            <span>Console Output</span>
          </div>
          <div className="flex-1 overflow-y-auto pt-2 space-y-1 text-slate-300">
            {output.map((line, i) => (
              <pre key={i} className="whitespace-pre-wrap leading-tight text-[11px]">
                {line}
              </pre>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
