import React, { useState, useEffect } from 'react'
import { Star, Search, Trash2, X, Globe, Plus } from 'lucide-react'
import { getBookmarks, searchBookmarks, removeBookmarkByUrl, addBookmark } from '../services/bookmarkService'
import { useAsterStore } from '../asterStore'

export function BookmarksView({ onClose }) {
  const [bookmarkItems, setBookmarkItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const activeTabId = useAsterStore((s) => s.activeTabId)
  const navigateTab = useAsterStore((s) => s.navigateTab)

  const loadBookmarks = async () => {
    const res = await searchBookmarks(searchQuery)
    setBookmarkItems(res)
  }

  useEffect(() => {
    loadBookmarks()
  }, [searchQuery])

  const handleDelete = async (url) => {
    await removeBookmarkByUrl(url)
    loadBookmarks()
  }

  const handleAddSubmit = async () => {
    if (!newUrl.trim()) return
    await addBookmark(newTitle.trim() || newUrl.trim(), newUrl.trim())
    setShowAddModal(false)
    setNewTitle('')
    setNewUrl('')
    loadBookmarks()
  }

  const handleNavigate = (url) => {
    if (activeTabId) {
      navigateTab(activeTabId, url)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#12131C] border border-white/15 rounded-2xl shadow-2xl w-[640px] max-w-full h-[480px] flex flex-col overflow-hidden text-xs text-slate-200 font-sans">
        {/* Header */}
        <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span>ASTER Bookmarks (Ctrl+D)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF] transition-colors"
            >
              <Plus size={13} />
              <span>Add Bookmark</span>
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-white/10 bg-[#0c0d15] flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-3 overflow-auto space-y-1.5">
          {bookmarkItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Star size={32} className="opacity-40" />
              <span>No bookmarks saved yet</span>
            </div>
          ) : (
            bookmarkItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div
                  onClick={() => handleNavigate(item.url)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                >
                  <Globe size={16} className="text-[#00F0FF] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.url)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Bookmark"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-5 w-80 space-y-4">
              <h3 className="font-semibold text-white">Add New Bookmark</h3>
              <input
                type="text"
                placeholder="Bookmark Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://github.com)..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit()}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  className="px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
