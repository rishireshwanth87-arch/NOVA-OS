import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  Archive,
  Check,
  Save,
  Clock,
} from 'lucide-react'
import {
  initNotes,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../../storage/notesService'

export function NotesApp() {
  const [notes, setNotes] = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saveStatus, setSaveStatus] = useState('Saved') // 'Saving...' | 'Saved'
  const saveTimeoutRef = useRef(null)

  const activeNote = notes.find((n) => n.id === activeNoteId)

  // Load Notes
  const loadNotes = async () => {
    await initNotes()
    const fetched = await getNotes()
    setNotes(fetched)
    if (fetched.length > 0 && !activeNoteId) {
      setActiveNoteId(fetched[0].id)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  // Debounced Autosave
  const handleContentChange = (field, value) => {
    if (!activeNoteId) return

    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, [field]: value } : n))
    )
    setSaveStatus('Saving...')

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      await updateNote(activeNoteId, { [field]: value })
      setSaveStatus('Saved')
    }, 500)
  }

  const handleCreateNew = async () => {
    const created = await createNote('Untitled Note', '')
    await loadNotes()
    setActiveNoteId(created.id)
  }

  const handleDelete = async (id) => {
    await deleteNote(id)
    const remaining = notes.filter((n) => n.id !== id)
    setNotes(remaining)
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0]?.id || null)
    }
  }

  const handleTogglePin = async (note) => {
    const updated = await updateNote(note.id, { pinned: !note.pinned })
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
  }

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase()
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  })

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return (
    <div className="flex h-full w-full bg-[#0E0F17] text-slate-200 select-none overflow-hidden text-xs">
      {/* Sidebar Note List */}
      <aside className="w-56 bg-[#12131C] border-r border-white/10 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>
          <button
            onClick={handleCreateNew}
            className="p-1.5 bg-[#00F0FF] text-black rounded-lg hover:bg-[#33F3FF] transition-colors"
            title="New Note"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Notes Items */}
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {sortedNotes.length === 0 ? (
            <div className="text-center text-slate-500 p-4">No notes found</div>
          ) : (
            sortedNotes.map((note) => {
              const active = note.id === activeNoteId
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer space-y-1 ${
                    active
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-white shadow-md'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold truncate text-xs text-white">
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.pinned && <Pin size={11} className="text-[#00F0FF] shrink-0 fill-[#00F0FF]" />}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate line-clamp-1">
                    {note.content || 'Empty note...'}
                  </p>
                  <div className="text-[9px] text-slate-500 text-right">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Editor Panel */}
      <main className="flex-1 flex flex-col h-full bg-[#0A0B10] min-w-0">
        {activeNote ? (
          <>
            {/* Header bar */}
            <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between bg-[#12131C]/60 shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Note Title..."
                className="bg-transparent text-sm font-semibold text-white focus:outline-none flex-1 mr-4"
              />
              <div className="flex items-center gap-2 text-slate-400">
                {/* Save status */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mr-2">
                  <Save size={11} className={saveStatus === 'Saving...' ? 'animate-spin text-[#00F0FF]' : 'text-emerald-400'} />
                  <span>{saveStatus}</span>
                </div>

                <button
                  onClick={() => handleTogglePin(activeNote)}
                  className={`p-1.5 rounded hover:bg-white/10 ${activeNote.pinned ? 'text-[#00F0FF]' : 'text-slate-400'}`}
                  title={activeNote.pinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin size={14} className={activeNote.pinned ? 'fill-[#00F0FF]' : ''} />
                </button>
                <button
                  onClick={() => handleDelete(activeNote.id)}
                  className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  title="Delete Note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Text Editor TextArea */}
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleContentChange('content', e.target.value)}
                placeholder="Start writing note..."
                className="w-full h-full bg-transparent text-slate-200 text-xs leading-relaxed focus:outline-none resize-none font-sans"
              />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <FileText size={36} className="opacity-40" />
            <p>Select or create a note to start editing</p>
          </div>
        )}
      </main>
    </div>
  )
}
