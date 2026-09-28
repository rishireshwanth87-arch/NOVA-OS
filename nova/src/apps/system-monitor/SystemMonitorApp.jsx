import React, { useState, useEffect } from 'react'
import {
  Activity,
  HardDrive,
  Wifi,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Cpu,
  Database,
} from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { getAllFromStore, saveToStore } from '../../storage/db'
import { getNotes, createNote } from '../../storage/notesService'
import { getEvents } from '../../storage/calendarService'

export function SystemMonitorApp() {
  const [storageEstimate, setStorageEstimate] = useState(null)
  const [fileCount, setFileCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)
  const [eventCount, setEventCount] = useState(0)
  const [importStatus, setImportStatus] = useState(null)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingBackupData, setPendingBackupData] = useState(null)

  const theme = useSettingsStore((s) => s.theme)
  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const clockFormat = useSettingsStore((s) => s.clockFormat)
  const showClockSeconds = useSettingsStore((s) => s.showClockSeconds)
  const workspaces = useWorkspaceStore((s) => s.workspaces)

  useEffect(() => {
    const loadStats = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const est = await navigator.storage.estimate()
          const usageMB = (est.usage / (1024 * 1024)).toFixed(2)
          const quotaMB = (est.quota / (1024 * 1024)).toFixed(0)
          const percent = est.quota ? ((est.usage / est.quota) * 100).toFixed(1) : 0
          setStorageEstimate({ usageMB, quotaMB, percent })
        } catch (e) {
          console.error(e)
        }
      }

      try {
        const files = await getAllFromStore('files')
        setFileCount(files.length)
        const notes = await getNotes()
        setNoteCount(notes.length)
        const events = await getEvents()
        setEventCount(events.length)
      } catch (e) {
        console.error(e)
      }
    }

    loadStats()
  }, [])

  // EXPORT BACKUP JSON
  const handleExportBackup = async () => {
    try {
      const files = await getAllFromStore('files')
      const notes = await getNotes()
      const events = await getEvents()

      const backupObj = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: {
          theme,
          wallpaper,
          accentColor,
          clockFormat,
          showClockSeconds,
        },
        workspaces,
        notes,
        calendar: events,
        filesystem: files,
      }

      const jsonStr = JSON.stringify(backupObj, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `NOVA_BACKUP_V1_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      useNotificationStore.getState().addNotification({
        title: 'System Backup',
        message: 'NOVA backup exported successfully',
        type: 'success',
      })
    } catch (e) {
      console.error('Export backup failed:', e)
    }
  }

  // READ IMPORTED BACKUP
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!parsed.version || !parsed.exportedAt) {
          setImportStatus({ type: 'error', message: 'Invalid backup file format' })
          return
        }
        setPendingBackupData(parsed)
        setShowImportConfirm(true)
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to parse JSON backup' })
      }
    }
    reader.readAsText(file)
  }

  // EXECUTE IMPORT RESTORE
  const handleConfirmImport = async () => {
    if (!pendingBackupData) return
    try {
      const { settings, workspaces: ws, notes, calendar, filesystem } = pendingBackupData

      // 1. Restore settings
      if (settings) {
        if (settings.theme) useSettingsStore.getState().setTheme(settings.theme)
        if (settings.wallpaper) useSettingsStore.getState().setWallpaper(settings.wallpaper)
        if (settings.accentColor) useSettingsStore.getState().setAccentColor(settings.accentColor)
        if (settings.clockFormat) useSettingsStore.getState().setClockFormat(settings.clockFormat)
      }

      // 2. Restore Workspaces
      if (ws && Array.isArray(ws)) {
        useWorkspaceStore.setState({ workspaces: ws })
      }

      // 3. Restore Filesystem
      if (filesystem && Array.isArray(filesystem)) {
        for (const fileItem of filesystem) {
          await saveToStore('files', fileItem)
        }
      }

      // 4. Restore Notes
      if (notes && Array.isArray(notes)) {
        for (const noteItem of notes) {
          await saveToStore('notes', noteItem)
        }
      }

      // 5. Restore Calendar
      if (calendar && Array.isArray(calendar)) {
        for (const eventItem of calendar) {
          await saveToStore('events', eventItem)
        }
      }

      setShowImportConfirm(false)
      setPendingBackupData(null)

      useNotificationStore.getState().addNotification({
        title: 'System Restore',
        message: 'NOVA state restored from backup',
        type: 'success',
      })

      setTimeout(() => window.location.reload(), 1000)
    } catch (e) {
      console.error('Import failed:', e)
      setImportStatus({ type: 'error', message: 'Restore failed: ' + e.message })
    }
  }

  return (
    <div className="flex h-full w-full bg-[#0E0F17] text-slate-200 select-none overflow-hidden text-xs">
      <div className="flex-1 p-6 overflow-auto bg-[#0A0B10] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Activity size={24} className="text-[#00F0FF]" />
            <div>
              <h2 className="text-base font-bold text-white">NOVA System Monitor</h2>
              <p className="text-slate-400 text-xs">Real-time WebOS environment diagnostic telemetry and backup</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full font-mono text-[10px] font-semibold">
            Kernel v1.0.0
          </span>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* System Environment */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold border-b border-white/10 pb-2">
              <Cpu size={16} className="text-[#00F0FF]" />
              <span>Host & Environment</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Browser</span>
                <span className="text-white truncate max-w-[140px]">{navigator.appName || 'Chromium / Web'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform</span>
                <span className="text-white">{navigator.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Viewport</span>
                <span className="text-[#00F0FF]">{window.innerWidth} x {window.innerHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Device Pixel Ratio</span>
                <span className="text-white">{window.devicePixelRatio}x</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5">
                <span className="text-slate-400">CPU / RAM Allocation</span>
                <span className="text-slate-500 italic">Unavailable in browser</span>
              </div>
            </div>
          </div>

          {/* Storage Telemetry */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold border-b border-white/10 pb-2">
              <HardDrive size={16} className="text-emerald-400" />
              <span>IndexedDB Storage</span>
            </div>
            {storageEstimate ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Usage</span>
                  <span className="text-emerald-400 font-semibold">{storageEstimate.usageMB} MB / {storageEstimate.quotaMB} MB</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, storageEstimate.percent)}%` }}
                    className="bg-[#00F0FF] h-full transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-[10px] text-center text-slate-400">
                  <div className="bg-white/5 p-1 rounded">Files: {fileCount}</div>
                  <div className="bg-white/5 p-1 rounded">Notes: {noteCount}</div>
                  <div className="bg-white/5 p-1 rounded">Events: {eventCount}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">Storage estimation unavailable</div>
            )}
          </div>

          {/* Backup & Restore Panel */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-white font-semibold border-b border-white/10 pb-2">
              <Database size={16} className="text-amber-400" />
              <span>Backup & Recovery</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Export complete WebOS state (Files, Notes, Calendar, Workspaces, Settings) to JSON or restore from file.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF] transition-colors"
              >
                <Download size={13} />
                <span>Export</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/10 cursor-pointer transition-colors">
                <Upload size={13} />
                <span>Import</span>
                <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Confirmation Modal for Import */}
        {showImportConfirm && pendingBackupData && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-5 w-96 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold border-b border-white/10 pb-2">
                <AlertTriangle size={18} />
                <span>Confirm NOVA Restore</span>
              </div>

              <p className="text-slate-300">
                Are you sure you want to restore NOVA from this backup? Current items will be merged and updated.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1 font-mono text-[11px] text-slate-300">
                <div>Backup Version: {pendingBackupData.version}</div>
                <div>Exported At: {new Date(pendingBackupData.exportedAt).toLocaleString()}</div>
                <div>Files Count: {pendingBackupData.filesystem?.length || 0}</div>
                <div>Notes Count: {pendingBackupData.notes?.length || 0}</div>
                <div>Calendar Events: {pendingBackupData.calendar?.length || 0}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowImportConfirm(false)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400"
                >
                  Restore Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
