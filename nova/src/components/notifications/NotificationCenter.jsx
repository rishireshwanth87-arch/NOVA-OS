import React from 'react'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Trash2,
} from 'lucide-react'
import { useNotificationStore } from '../../stores/notificationStore'

export function NotificationCenter() {
  const notifications = useNotificationStore((s) => s.notifications)
  const isOpen = useNotificationStore((s) => s.notificationCenterOpen)
  const closeCenter = useNotificationStore((s) => s.closeNotificationCenter)
  const clearAll = useNotificationStore((s) => s.clearAll)
  const dismissToast = useNotificationStore((s) => s.dismissToast)

  // Active toasts to display in top-right floating stack
  const activeToasts = notifications.filter((n) => !n.toastDismissed).slice(0, 3)

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={15} className="text-emerald-400 shrink-0" />
      case 'warning':
        return <AlertTriangle size={15} className="text-amber-400 shrink-0" />
      case 'error':
        return <XCircle size={15} className="text-red-400 shrink-0" />
      case 'info':
      default:
        return <Info size={15} className="text-[#00F0FF] shrink-0" />
    }
  }

  return (
    <>
      {/* Floating Active Toast Reminders (top-right overlay) */}
      <div className="fixed top-12 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs w-full">
        {activeToasts.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto bg-[#12131C]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-3 flex items-start gap-2.5 text-xs text-slate-200 animate-slide-in"
          >
            {getIcon(n.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">{n.title}</h4>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{n.message}</p>
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Notification History Center Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={closeCenter} />
          <div className="absolute right-4 top-10 z-50 w-80 bg-[#12131C]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 text-xs text-slate-200 select-none space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[#00F0FF]" />
                <h3 className="font-semibold text-white tracking-wide">Notifications</h3>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2.5"
                  >
                    {getIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white truncate">{n.title}</span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
