import { create } from 'zustand'
import {
  listDirectory,
  createFolder,
  createFile,
  renameItem,
  moveToTrash,
  copyItem,
  moveItem,
  getItemById,
} from '../storage/filesystem'
import { createNote } from '../storage/notesService'
import { useNotificationStore } from './notificationStore'

const DESKTOP_SETTINGS_KEY = 'nova_desktop_settings'

const getInitialDesktopSettings = () => {
  try {
    const saved = localStorage.getItem(DESKTOP_SETTINGS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to parse desktop settings:', e)
  }
  return {
    iconSize: 'medium', // 'large' | 'medium' | 'small'
    showDesktopIcons: true,
    snapToGrid: true,
    sortBy: 'name', // 'name' | 'type' | 'date' | 'size'
    sortOrder: 'asc', // 'asc' | 'desc'
  }
}

export const useDesktopStore = create((set, get) => ({
  ...getInitialDesktopSettings(),

  desktopItems: [],
  selectedIconId: null,
  renamingId: null,
  renameValue: '',
  propertiesItem: null,
  clipboard: null, // { action: 'copy' | 'cut', items: [] }

  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    context: 'desktop', // 'desktop' | 'file' | 'folder'
    target: null,
  },

  // Context Menu Actions
  openContextMenu: ({ x, y, context = 'desktop', target = null }) => {
    set({
      contextMenu: {
        isOpen: true,
        x,
        y,
        context,
        target,
      },
    })
  },

  closeContextMenu: () => {
    set((state) => ({
      contextMenu: { ...state.contextMenu, isOpen: false },
    }))
  },

  // View & Settings Actions
  setIconSize: (iconSize) => {
    set({ iconSize })
    get().persistDesktopSettings()
  },

  toggleShowDesktopIcons: () => {
    set((state) => ({ showDesktopIcons: !state.showDesktopIcons }))
    get().persistDesktopSettings()
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }))
    get().persistDesktopSettings()
  },

  setSortBy: (sortBy) => {
    set({ sortBy })
    get().persistDesktopSettings()
    get().sortDesktopItems()
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder })
    get().persistDesktopSettings()
    get().sortDesktopItems()
  },

  persistDesktopSettings: () => {
    const { iconSize, showDesktopIcons, snapToGrid, sortBy, sortOrder } = get()
    try {
      localStorage.setItem(
        DESKTOP_SETTINGS_KEY,
        JSON.stringify({ iconSize, showDesktopIcons, snapToGrid, sortBy, sortOrder })
      )
    } catch (e) {
      console.error('Failed to save desktop settings:', e)
    }
  },

  // Desktop Filesystem Methods
  refreshDesktop: async (showNotification = false) => {
    try {
      const items = await listDirectory('folder-desktop')
      set({ desktopItems: items })
      get().sortDesktopItems()
      if (showNotification) {
        useNotificationStore.getState().addNotification({
          title: 'Desktop',
          message: 'Desktop refreshed',
          type: 'info',
        })
      }
    } catch (e) {
      console.error('Failed to load desktop items:', e)
    }
  },

  sortDesktopItems: () => {
    const { desktopItems, sortBy, sortOrder } = get()
    const sorted = [...desktopItems].sort((a, b) => {
      let cmp = 0
      if (a.type !== b.type) {
        cmp = a.type === 'folder' ? -1 : 1
      } else if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortBy === 'size') {
        cmp = (a.size || 0) - (b.size || 0)
      } else if (sortBy === 'date') {
        cmp = new Date(a.updatedAt) - new Date(b.updatedAt)
      } else if (sortBy === 'type') {
        cmp = (a.mimeType || a.type).localeCompare(b.mimeType || b.type)
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    set({ desktopItems: sorted })
  },

  createDesktopFolder: async (customName = null) => {
    const existing = get().desktopItems
    let folderName = customName || 'New Folder'
    let counter = 1
    while (existing.some((i) => i.name.toLowerCase() === folderName.toLowerCase())) {
      folderName = `${customName || 'New Folder'} (${counter++})`
    }
    const newFolder = await createFolder('folder-desktop', folderName)
    await get().refreshDesktop()
    set({ renamingId: newFolder.id, renameValue: newFolder.name, selectedIconId: newFolder.id })
    return newFolder
  },

  createDesktopFile: async (customName = null, content = '') => {
    const existing = get().desktopItems
    let fileName = customName || 'New File.txt'
    let counter = 1
    while (existing.some((i) => i.name.toLowerCase() === fileName.toLowerCase())) {
      const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : ''
      const base = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName
      fileName = `${base} (${counter++})${ext}`
    }
    const newFile = await createFile('folder-desktop', fileName, content)
    await get().refreshDesktop()
    set({ renamingId: newFile.id, renameValue: newFile.name, selectedIconId: newFile.id })
    return newFile
  },

  createDesktopNote: async (title = 'New Note', content = '') => {
    const note = await createNote(title, content)
    useNotificationStore.getState().addNotification({
      title: 'Notes',
      message: `Created note "${note.title}"`,
      type: 'success',
    })
    return note
  },

  renameDesktopItem: async (id, newName) => {
    if (!newName || !newName.trim()) {
      set({ renamingId: null, renameValue: '' })
      return
    }
    await renameItem(id, newName.trim())
    set({ renamingId: null, renameValue: '' })
    await get().refreshDesktop()
  },

  deleteDesktopItem: async (id) => {
    await moveToTrash(id)
    set({ selectedIconId: null })
    await get().refreshDesktop()
    useNotificationStore.getState().addNotification({
      title: 'Desktop',
      message: 'Item moved to Trash',
      type: 'info',
    })
  },

  setRenamingId: (id, name = '') => {
    set({ renamingId: id, renameValue: name })
  },

  setSelectedIconId: (id) => {
    set({ selectedIconId: id })
  },

  setPropertiesItem: (item) => {
    set({ propertiesItem: item })
  },

  copyDesktopItem: (item) => {
    set({ clipboard: { action: 'copy', items: [item] } })
  },

  cutDesktopItem: (item) => {
    set({ clipboard: { action: 'cut', items: [item] } })
  },

  pasteDesktopItem: async () => {
    const { clipboard } = get()
    if (!clipboard || !clipboard.items.length) return
    for (const item of clipboard.items) {
      if (clipboard.action === 'copy') {
        await copyItem(item.id, 'folder-desktop')
      } else if (clipboard.action === 'cut') {
        await moveItem(item.id, 'folder-desktop')
      }
    }
    set({ clipboard: null })
    await get().refreshDesktop()
  },
}))
