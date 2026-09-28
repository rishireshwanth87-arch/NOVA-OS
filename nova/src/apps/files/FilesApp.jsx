import React, { useState, useEffect } from 'react'
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Trash2,
  Plus,
  Search,
  Grid,
  List,
  Edit2,
  Copy,
  Scissors,
  Clipboard,
  CornerUpLeft,
  X,
  HardDrive,
  Home,
  Download,
  Music,
  Video,
  Eye,
  Star,
  Clock,
  Info,
} from 'lucide-react'
import {
  listDirectory,
  listTrash,
  listStarred,
  listRecent,
  createFolder,
  createFile,
  renameItem,
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  emptyTrash,
  moveItem,
  copyItem,
  writeFile,
  toggleStarItem,
  searchFiles,
} from '../../storage/filesystem'

export function FilesApp({ window: win }) {
  const initialFolder =
    win?.params?.initialFolderId ||
    (win?.params?.initialPath === '/Desktop' ? 'folder-desktop' : 'folder-documents')
  const initialPath =
    win?.params?.initialPath ||
    (initialFolder === 'folder-desktop' ? '/Desktop' : '/Documents')

  const [currentFolderId, setCurrentFolderId] = useState(initialFolder)
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [clipboard, setClipboard] = useState(null)
  const [dragOverFolderId, setDragOverFolderId] = useState(null)

  // Special views: 'starred' | 'recent' | 'trash' | 'normal'
  const isTrashFolder = currentFolderId === 'folder-trash'
  const isStarredView = currentFolderId === 'view-starred'
  const isRecentView = currentFolderId === 'view-recent'

  // Fetch Items
  const refreshItems = async () => {
    try {
      let result = []
      if (searchQuery.trim()) {
        result = await searchFiles(searchQuery)
      } else if (isTrashFolder) {
        result = await listTrash()
      } else if (isStarredView) {
        result = await listStarred()
      } else if (isRecentView) {
        result = await listRecent(20)
      } else {
        result = await listDirectory(currentFolderId)
      }

      // Sort items
      result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'size') return (b.size || 0) - (a.size || 0)
        if (sortBy === 'date') return new Date(b.updatedAt) - new Date(a.updatedAt)
        return 0
      })

      setItems(result)
    } catch (e) {
      console.error('Failed to load files:', e)
    }
  }

  useEffect(() => {
    refreshItems()
    setSelectedIds([])
  }, [currentFolderId, searchQuery, sortBy])

  // Context Menu & Modals
  const [contextMenu, setContextMenu] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [previewItem, setPreviewItem] = useState(null)
  const [fileContentEdit, setFileContentEdit] = useState('')
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false)
  const [newModalType, setNewModalType] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [propertiesItem, setPropertiesItem] = useState(null)

  const navigateTo = (folder) => {
    setCurrentFolderId(folder.id)
    setCurrentPath(folder.path || `/${folder.name}`)
    setSearchQuery('')
  }

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      navigateTo(item)
    } else {
      setPreviewItem(item)
      setFileContentEdit(item.content || '')
    }
  }

  const handleToggleStar = async (id) => {
    await toggleStarItem(id)
    refreshItems()
  }

  // Shift + Click Range Selection
  const handleItemClick = (e, item, idx) => {
    e.stopPropagation()
    if (e.shiftKey && selectedIds.length > 0) {
      const lastSelectedId = selectedIds[selectedIds.length - 1]
      const lastIdx = items.findIndex((i) => i.id === lastSelectedId)
      const start = Math.min(lastIdx, idx)
      const end = Math.max(lastIdx, idx)
      const rangeIds = items.slice(start, end + 1).map((i) => i.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...rangeIds])))
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) =>
        prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
      )
    } else {
      setSelectedIds([item.id])
    }
  }

  // Context Menu Handler
  const handleContextMenu = (e, item = null) => {
    e.preventDefault()
    e.stopPropagation()
    if (item && !selectedIds.includes(item.id)) {
      setSelectedIds([item.id])
    }
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }

  // Drag and Drop implementation
  const handleDragStart = (e, item) => {
    const dragPayload = selectedIds.includes(item.id) ? selectedIds : [item.id]
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload))
  }

  const handleDragOver = (e, targetFolderId) => {
    e.preventDefault()
    if (targetFolderId && targetFolderId !== currentFolderId) {
      setDragOverFolderId(targetFolderId)
    }
  }

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault()
    setDragOverFolderId(null)
    try {
      const draggedIds = JSON.parse(e.dataTransfer.getData('application/json') || '[]')
      for (const id of draggedIds) {
        if (id !== targetFolderId) {
          await moveItem(id, targetFolderId)
        }
      }
      refreshItems()
    } catch (err) {
      console.error('Failed to move dragged item:', err)
    }
  }

  // File Operations
  const handleCreateNew = async () => {
    if (!newItemName.trim()) return
    const targetFolder = isTrashFolder || isRecentView || isStarredView ? 'folder-documents' : currentFolderId
    if (newModalType === 'folder') {
      await createFolder(targetFolder, newItemName.trim())
    } else {
      await createFile(targetFolder, newItemName.trim())
    }
    setNewModalType(null)
    setNewItemName('')
    refreshItems()
  }

  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) {
      setRenamingId(null)
      return
    }
    await renameItem(id, renameValue.trim())
    setRenamingId(null)
    setRenameValue('')
    refreshItems()
  }

  const handleDelete = async (itemsToDelete) => {
    for (const item of itemsToDelete) {
      if (isTrashFolder) {
        await permanentDelete(item.id)
      } else {
        await moveToTrash(item.id)
      }
    }
    setSelectedIds([])
    refreshItems()
  }

  const handleRestore = async (itemsToRestore) => {
    for (const item of itemsToRestore) {
      await restoreFromTrash(item.id)
    }
    setSelectedIds([])
    refreshItems()
  }

  const handlePaste = async () => {
    if (!clipboard || !clipboard.itemIds.length) return
    const targetFolder = isTrashFolder || isRecentView || isStarredView ? 'folder-documents' : currentFolderId
    for (const id of clipboard.itemIds) {
      if (clipboard.action === 'copy') {
        await copyItem(id, targetFolder)
      } else if (clipboard.action === 'cut') {
        await moveItem(id, targetFolder)
      }
    }
    setClipboard(null)
    refreshItems()
  }

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (renamingId || newModalType || previewItem) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setSelectedIds(items.map((i) => i.id))
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedIds.length) setClipboard({ action: 'copy', itemIds: selectedIds })
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selectedIds.length) setClipboard({ action: 'cut', itemIds: selectedIds })
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        handlePaste()
      } else if (e.key === 'Delete') {
        if (selectedIds.length) {
          const selectedItems = items.filter((i) => selectedIds.includes(i.id))
          handleDelete(selectedItems)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIds, clipboard, renamingId, newModalType, previewItem])

  return (
    <div
      onClick={() => setContextMenu(null)}
      className="flex h-full w-full bg-[#0E0F17] text-slate-200 select-none overflow-hidden text-xs"
    >
      {/* Sidebar */}
      <aside className="w-48 bg-[#12131C] border-r border-white/10 flex flex-col p-3 gap-1 shrink-0">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Smart Views
        </div>

        <button
          onClick={() => navigateTo({ id: 'view-recent', name: 'Recent', path: '/Recent' })}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
            isRecentView
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] font-medium border border-[#00F0FF]/30'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={14} />
          <span className="truncate">Recent</span>
        </button>

        <button
          onClick={() => navigateTo({ id: 'view-starred', name: 'Starred', path: '/Starred' })}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
            isStarredView
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] font-medium border border-[#00F0FF]/30'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star size={14} className="text-amber-400 fill-amber-400/20" />
          <span className="truncate">Favorites</span>
        </button>

        <div className="mt-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Locations
        </div>

        {[
          { id: 'folder-root', name: 'Root', icon: HardDrive, path: '/' },
          { id: 'folder-desktop', name: 'Desktop', icon: Home, path: '/Desktop' },
          { id: 'folder-documents', name: 'Documents', icon: FileText, path: '/Documents' },
          { id: 'folder-downloads', name: 'Downloads', icon: Download, path: '/Downloads' },
          { id: 'folder-pictures', name: 'Pictures', icon: ImageIcon, path: '/Pictures' },
          { id: 'folder-music', name: 'Music', icon: Music, path: '/Music' },
          { id: 'folder-videos', name: 'Videos', icon: Video, path: '/Videos' },
        ].map((loc) => {
          const IconComp = loc.icon
          const active = currentFolderId === loc.id
          return (
            <button
              key={loc.id}
              onClick={() => navigateTo(loc)}
              onDragOver={(e) => handleDragOver(e, loc.id)}
              onDrop={(e) => handleDrop(e, loc.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                active
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] font-medium border border-[#00F0FF]/30'
                  : dragOverFolderId === loc.id
                  ? 'bg-[#00F0FF]/30 border border-[#00F0FF]'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComp size={14} />
              <span className="truncate">{loc.name}</span>
            </button>
          )
        })}

        <div className="mt-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          System
        </div>
        <button
          onClick={() => navigateTo({ id: 'folder-trash', name: 'Trash', path: '/Trash' })}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
            isTrashFolder
              ? 'bg-red-500/20 text-red-400 font-medium border border-red-500/30'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trash2 size={14} />
          <span className="truncate">Trash</span>
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Toolbar */}
        <header className="h-11 px-3 border-b border-white/10 bg-[#12131C]/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {!isTrashFolder && (
              <>
                <button
                  onClick={() => setNewModalType('folder')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors"
                >
                  <Plus size={13} />
                  <span>Folder</span>
                </button>
                <button
                  onClick={() => setNewModalType('file')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors"
                >
                  <Plus size={13} />
                  <span>File</span>
                </button>
              </>
            )}

            {isTrashFolder && (
              <button
                onClick={() => setShowEmptyTrashConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-md border border-red-500/30"
              >
                <Trash2 size={13} />
                <span>Empty Trash</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-slate-400 truncate max-w-xs font-mono text-[11px]">
            <span className="text-[#00F0FF]">nova:</span>
            <span>{currentPath}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 pl-7 pr-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="name" className="bg-[#12131C]">Sort: Name</option>
              <option value="type" className="bg-[#12131C]">Sort: Type</option>
              <option value="size" className="bg-[#12131C]">Sort: Size</option>
              <option value="date" className="bg-[#12131C]">Sort: Date</option>
            </select>

            <div className="flex bg-white/5 border border-white/10 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400'}`}
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400'}`}
              >
                <List size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* File Content Grid / List */}
        <div
          onContextMenu={(e) => handleContextMenu(e, null)}
          className="flex-1 p-4 overflow-auto relative"
        >
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Folder size={36} className="opacity-40" />
              <p>Folder is empty</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-5 gap-3">
              {items.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id)
                const isFolder = item.type === 'folder'

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => isFolder && handleDragOver(e, item.id)}
                    onDrop={(e) => isFolder && handleDrop(e, item.id)}
                    onClick={(e) => handleItemClick(e, item, idx)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-white shadow-lg'
                        : dragOverFolderId === item.id
                        ? 'bg-[#00F0FF]/30 border-[#00F0FF]'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {/* Star toggle icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStar(item.id)
                      }}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star
                        size={13}
                        className={item.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}
                      />
                    </button>

                    {isFolder ? (
                      <Folder size={36} className="text-[#00F0FF] mb-2 shrink-0" />
                    ) : item.mimeType?.startsWith('image/') ? (
                      <ImageIcon size={36} className="text-emerald-400 mb-2 shrink-0" />
                    ) : (
                      <FileText size={36} className="text-indigo-400 mb-2 shrink-0" />
                    )}

                    {renamingId === item.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(item.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(item.id)}
                        autoFocus
                        className="w-full text-center bg-black/60 border border-[#00F0FF] text-xs text-white rounded px-1"
                      />
                    ) : (
                      <span className="text-xs text-center truncate w-full">{item.name}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-[11px]">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Modified</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id)
                  const isFolder = item.type === 'folder'
                  return (
                    <tr
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={(e) => isFolder && handleDragOver(e, item.id)}
                      onDrop={(e) => isFolder && handleDrop(e, item.id)}
                      onClick={(e) => handleItemClick(e, item, idx)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#00F0FF]/15 text-white' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        {isFolder ? (
                          <Folder size={16} className="text-[#00F0FF]" />
                        ) : (
                          <FileText size={16} className="text-indigo-400" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 uppercase text-[10px]">{item.type}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {isFolder ? '—' : `${item.size || 0} B`}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-44 bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200"
        >
          {contextMenu.item ? (
            <>
              <button
                onClick={() => handleItemDoubleClick(contextMenu.item)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Eye size={13} />
                <span>Open / Preview</span>
              </button>
              <button
                onClick={() => handleToggleStar(contextMenu.item.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Star size={13} className={contextMenu.item.starred ? 'text-amber-400 fill-amber-400' : ''} />
                <span>{contextMenu.item.starred ? 'Unstar Item' : 'Add to Favorites'}</span>
              </button>
              <button
                onClick={() => {
                  setRenamingId(contextMenu.item.id)
                  setRenameValue(contextMenu.item.name)
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Edit2 size={13} />
                <span>Rename (F2)</span>
              </button>
              <button
                onClick={() => setClipboard({ action: 'copy', itemIds: [contextMenu.item.id] })}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setClipboard({ action: 'cut', itemIds: [contextMenu.item.id] })}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Scissors size={13} />
                <span>Cut</span>
              </button>
              <button
                onClick={() => setPropertiesItem(contextMenu.item)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Info size={13} />
                <span>Properties</span>
              </button>
              <div className="my-1 border-t border-white/10" />
              {isTrashFolder ? (
                <>
                  <button
                    onClick={() => handleRestore([contextMenu.item])}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left text-emerald-400"
                  >
                    <CornerUpLeft size={13} />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handleDelete([contextMenu.item])}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-red-500/20 text-left text-red-400"
                  >
                    <Trash2 size={13} />
                    <span>Delete Permanently</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleDelete([contextMenu.item])}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-red-500/20 text-left text-red-400"
                >
                  <Trash2 size={13} />
                  <span>Move to Trash</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setNewModalType('folder')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Plus size={13} />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => setNewModalType('file')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
              >
                <Plus size={13} />
                <span>New File</span>
              </button>
              {clipboard && (
                <button
                  onClick={handlePaste}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/10 text-left"
                >
                  <Clipboard size={13} />
                  <span>Paste Items</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Item Properties Modal */}
      {propertiesItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl w-80 p-5 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white">Item Properties</span>
              <button onClick={() => setPropertiesItem(null)} className="p-1 rounded hover:bg-white/10 text-slate-400">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white">{propertiesItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white uppercase">{propertiesItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Path:</span>
                <span className="text-[#00F0FF]">{propertiesItem.path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Size:</span>
                <span className="text-white">{propertiesItem.size || 0} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modified:</span>
                <span className="text-slate-300">{new Date(propertiesItem.updatedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPropertiesItem(null)}
                className="px-4 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Modal */}
      {newModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl p-5 w-80 space-y-4">
            <h3 className="font-semibold text-white">Create New {newModalType === 'folder' ? 'Folder' : 'File'}</h3>
            <input
              type="text"
              placeholder={`Enter ${newModalType} name...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNewModalType(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                className="px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Drawer */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#12131C] border border-white/15 rounded-xl shadow-2xl w-[640px] max-w-full flex flex-col h-[480px] overflow-hidden">
            <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <span className="font-semibold text-white">{previewItem.name}</span>
              <button onClick={() => setPreviewItem(null)} className="p-1 rounded hover:bg-white/10 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={fileContentEdit}
                onChange={(e) => setFileContentEdit(e.target.value)}
                className="w-full h-full bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div className="h-12 px-4 border-t border-white/10 flex items-center justify-end gap-2 bg-white/5">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await writeFile(previewItem.id, fileContentEdit)
                  setPreviewItem(null)
                  refreshItems()
                }}
                className="px-3 py-1.5 bg-[#00F0FF] text-black font-semibold rounded-lg hover:bg-[#33F3FF]"
              >
                Save File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
