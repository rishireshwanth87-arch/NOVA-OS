import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react'
import {
  initCalendar,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../storage/calendarService'

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDateStr, setSelectedDateStr] = useState(getLocalDateString())
  const [searchQuery, setSearchQuery] = useState('')

  // Event Modal State
  const [modalEvent, setModalEvent] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const loadEvents = async () => {
    try {
      await initCalendar()
      const fetched = await getEvents()
      setEvents(fetched || [])
    } catch (e) {
      console.error('Failed to load events:', e)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Month navigation helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateStr(getLocalDateString(today))
  }

  const handleSaveEvent = async (e) => {
    e.preventDefault()
    if (!modalEvent.title.trim()) return

    if (modalEvent.id) {
      await updateEvent(modalEvent.id, modalEvent)
    } else {
      await createEvent(modalEvent)
    }

    setModalEvent(null)
    loadEvents()
  }

  const handleDeleteEvent = async (id) => {
    await deleteEvent(id)
    setDeleteConfirmId(null)
    loadEvents()
  }

  // Selected date events
  const selectedDateEvents = events.filter((evt) => {
    if (searchQuery.trim()) {
      return (
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return evt.date === selectedDateStr
  })

  return (
    <div className="flex h-full w-full bg-[#0E0F17] text-slate-200 select-none overflow-hidden text-xs">
      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-white/10">
        {/* Header Toolbar */}
        <header className="h-12 px-4 border-b border-white/10 bg-[#12131C]/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white tracking-wide">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded text-slate-300"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleToday}
                className="px-2 py-0.5 hover:bg-white/10 rounded text-[11px] font-medium text-slate-200"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/10 rounded text-slate-300"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 pl-7 pr-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>

            <button
              onClick={() =>
                setModalEvent({
                  title: '',
                  date: selectedDateStr,
                  startTime: '09:00',
                  endTime: '10:00',
                  description: '',
                  location: '',
                  category: 'work',
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF] transition-colors"
            >
              <Plus size={14} />
              <span>Add Event</span>
            </button>
          </div>
        </header>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#12131C] text-center text-[11px] font-semibold text-slate-400 py-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Month Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 p-2 gap-1 bg-[#0A0B10] overflow-auto">
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-white/[0.01] rounded-lg border border-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const isSelected = selectedDateStr === dateStr
            const isToday = getLocalDateString() === dateStr
            const dayEvents = events.filter((e) => e.date === dateStr)

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 shadow-md'
                    : isToday
                    ? 'bg-white/10 border-[#00F0FF]/40'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] truncate border border-indigo-500/30"
                    >
                      {evt.startTime} {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-slate-500 text-center">+ {dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Sidebar: Selected Date Schedule */}
      <aside className="w-64 bg-[#12131C] flex flex-col p-4 space-y-4 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            {searchQuery.trim() ? 'Search Results' : 'Schedule for'}
          </h3>
          <p className="text-sm font-semibold text-[#00F0FF] mt-0.5">
            {searchQuery.trim()
              ? `"${searchQuery}"`
              : new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
          </p>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {selectedDateEvents.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <CalendarIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p>No events found</p>
            </div>
          ) : (
            selectedDateEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 hover:border-[#00F0FF]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate">{evt.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModalEvent(evt)}
                      className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(evt.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-[#00F0FF]" />
                    <span>
                      {evt.startTime} - {evt.endTime}
                    </span>
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={11} className="text-emerald-400" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                </div>

                {evt.description && (
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-white/5">
                    {evt.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Create / Edit Event Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEvent}
            className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-5 w-96 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-semibold text-white">
                {modalEvent.id ? 'Edit Event' : 'Create Event'}
              </h3>
              <button
                type="button"
                onClick={() => setModalEvent(null)}
                className="p-1 rounded hover:bg-white/10 text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-medium text-slate-400">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Event title..."
                  value={modalEvent.title}
                  onChange={(e) => setModalEvent({ ...modalEvent, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={modalEvent.date}
                    onChange={(e) => setModalEvent({ ...modalEvent, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-400">Category</label>
                  <select
                    value={modalEvent.category}
                    onChange={(e) => setModalEvent({ ...modalEvent, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="work" className="bg-[#12131C]">Work</option>
                    <option value="personal" className="bg-[#12131C]">Personal</option>
                    <option value="urgent" className="bg-[#12131C]">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-400">Start Time</label>
                  <input
                    type="time"
                    value={modalEvent.startTime}
                    onChange={(e) => setModalEvent({ ...modalEvent, startTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-400">End Time</label>
                  <input
                    type="time"
                    value={modalEvent.endTime}
                    onChange={(e) => setModalEvent({ ...modalEvent, endTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400">Location</label>
                <input
                  type="text"
                  placeholder="Location or link..."
                  value={modalEvent.location}
                  onChange={(e) => setModalEvent({ ...modalEvent, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400">Description</label>
                <textarea
                  placeholder="Additional details..."
                  value={modalEvent.description}
                  onChange={(e) => setModalEvent({ ...modalEvent, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none resize-none h-16"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalEvent(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-5 w-80 space-y-4 text-center">
            <Trash2 size={32} className="text-red-400 mx-auto" />
            <h3 className="font-semibold text-white">Delete Event?</h3>
            <p className="text-xs text-slate-400">Are you sure you want to remove this event from your calendar?</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
