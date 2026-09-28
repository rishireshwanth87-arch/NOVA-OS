import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Info, ShieldAlert } from 'lucide-react'
import { useOSStore } from '../../stores/osStore'

export function NetworkPanel({ isOpen, onClose }) {
  const isOnline = useOSStore((s) => s.isOnline)
  const [connectionInfo, setConnectionInfo] = useState(null)
  const [testState, setTestState] = useState('idle') // 'idle' | 'testing' | 'success' | 'failed'
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    const updateConn = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (conn) {
        setConnectionInfo({
          type: conn.type || 'unknown',
          effectiveType: conn.effectiveType || 'unknown',
          downlink: conn.downlink ? `${conn.downlink} Mbps` : 'N/A',
          rtt: conn.rtt ? `${conn.rtt} ms` : 'N/A',
          saveData: conn.saveData ? 'On' : 'Off',
        })
      } else {
        setConnectionInfo(null)
      }
    }

    updateConn()
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (conn) {
      conn.addEventListener('change', updateConn)
      return () => conn.removeEventListener('change', updateConn)
    }
  }, [])

  if (!isOpen) return null

  // Real Connectivity Test
  const handleTestConnection = async () => {
    setTestState('testing')
    setTestMessage('Checking connectivity...')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)
      
      // Ping current origin or favicon
      const res = await fetch(window.location.origin + '/favicon.svg', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (res.ok || res.status < 400) {
        setTestState('success')
        setTestMessage('Connected to server')
      } else {
        setTestState('failed')
        setTestMessage(`Server returned status ${res.status}`)
      }
    } catch (e) {
      setTestState('failed')
      setTestMessage('Connection check failed')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div className="absolute right-12 top-10 z-50 w-80 bg-[#12131C]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 text-xs text-slate-200 select-none space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi size={18} className="text-emerald-400" />
            ) : (
              <WifiOff size={18} className="text-amber-400" />
            )}
            <h3 className="font-semibold text-white tracking-wide">Network Status</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            ● {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Real Network Information */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Browser Network Telemetry
          </div>
          {connectionInfo ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Connection Type</span>
                <span className="text-white capitalize">{connectionInfo.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Effective Type</span>
                <span className="text-[#00F0FF] uppercase">{connectionInfo.effectiveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Downlink Speed</span>
                <span className="text-white">{connectionInfo.downlink}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Round Trip Time (RTT)</span>
                <span className="text-white">{connectionInfo.rtt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Save-Data Mode</span>
                <span className="text-white">{connectionInfo.saveData}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-slate-400 text-center text-[11px]">
              Detailed network information API unavailable in this browser.
            </div>
          )}
        </div>

        {/* Real Connectivity Test */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            onClick={handleTestConnection}
            disabled={testState === 'testing'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/10"
          >
            <RefreshCw size={13} className={testState === 'testing' ? 'animate-spin text-[#00F0FF]' : ''} />
            <span>{testState === 'testing' ? 'Testing Connection...' : 'Test Connectivity'}</span>
          </button>

          {testState !== 'idle' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-[11px]">
              {testState === 'success' ? (
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              ) : testState === 'failed' ? (
                <XCircle size={14} className="text-red-400 shrink-0" />
              ) : (
                <RefreshCw size={14} className="text-[#00F0FF] animate-spin shrink-0" />
              )}
              <span className="text-slate-200">{testMessage}</span>
            </div>
          )}
        </div>

        {/* System Notice */}
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2 text-[10px] text-slate-400">
          <Info size={14} className="text-[#00F0FF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Network interfaces and Wi-Fi connections are managed directly by your host operating system.
          </p>
        </div>
      </div>
    </>
  )
}
