import React, { useState, useEffect } from 'react'
import { Download, Trash2, X, File, CheckCircle, AlertTriangle } from 'lucide-react'
import { getDownloads, clearDownloads } from '../services/downloadService'

export function DownloadsView({ onClose }) {
  const [downloads, setDownloads] = useState([])

  const loadDownloads = async () => {
    const res = await getDownloads()
    setDownloads(res)
  }

  useEffect(() => {
    loadDownloads()
  }, [])

  const handleClear = async () => {
    await clearDownloads()
    loadDownloads()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#12131C] border border-white/15 rounded-2xl shadow-2xl w-[560px] max-w-full h-[420px] flex flex-col overflow-hidden text-xs text-slate-200 font-sans">
        <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Download size={16} className="text-[#00F0FF]" />
            <span>ASTER Download Manager</span>
          </div>
          <div className="flex items-center gap-2">
            {downloads.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg border border-white/10 transition-colors"
              >
                <Trash2 size={12} />
                <span>Clear List</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-auto space-y-1.5">
          {downloads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Download size={32} className="opacity-40" />
              <span>No download records</span>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <File size={16} className="text-[#00F0FF] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{item.filename}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  {item.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle size={12} />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={12} />
                      <span>{item.status}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
