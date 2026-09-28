import { getAllFromStore, saveToStore, deleteFromStore } from './db'

export const SYSTEM_FOLDERS = [
  { id: 'folder-root', name: 'root', path: '/', parentId: null, type: 'folder', trashed: false },
  { id: 'folder-desktop', name: 'Desktop', path: '/Desktop', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-documents', name: 'Documents', path: '/Documents', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-downloads', name: 'Downloads', path: '/Downloads', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-pictures', name: 'Pictures', path: '/Pictures', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-music', name: 'Music', path: '/Music', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-videos', name: 'Videos', path: '/Videos', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-applications', name: 'Applications', path: '/Applications', parentId: 'folder-root', type: 'folder', trashed: false },
  { id: 'folder-trash', name: 'Trash', path: '/Trash', parentId: 'folder-root', type: 'folder', trashed: false },
]

export async function initFilesystem() {
  try {
    const existingFiles = await getAllFromStore('files')
    if (existingFiles.length === 0) {
      const now = new Date().toISOString()
      
      // Save System Folders
      for (const sysFolder of SYSTEM_FOLDERS) {
        await saveToStore('files', {
          ...sysFolder,
          createdAt: now,
          updatedAt: now,
          size: 0,
        })
      }

      // Add Initial Welcome Files
      await saveToStore('files', {
        id: 'file-welcome',
        name: 'Welcome.txt',
        path: '/Desktop/Welcome.txt',
        parentId: 'folder-desktop',
        type: 'file',
        content: `Welcome to NOVA WebOS!
"Your environment. Reimagined."

Features available in this WebOS:
• Functional IndexedDB Virtual Filesystem
• Interactive Simulated Terminal Shell
• Persistent Notes App with Autosave
• Precision Standard Calculator
• Fully Integrated Event Calendar
• Live System Settings & Customization
• Browser Connectivity Inspection
• Desktop Workspaces & Application Window Manager

Enjoy exploring your browser-based operating environment!`,
        size: 380,
        mimeType: 'text/plain',
        trashed: false,
        createdAt: now,
        updatedAt: now,
      })

      await saveToStore('files', {
        id: 'file-doc-sample',
        name: 'System_Architecture.txt',
        path: '/Documents/System_Architecture.txt',
        parentId: 'folder-documents',
        type: 'file',
        content: `NOVA WebOS Architecture:

SHELL:
- Desktop, System Bar, Floating Dock, Window Manager

STORAGE:
- IndexedDB Central Services (Filesystem, Notes, Calendar, Settings)

CORE SERVICES:
- App Registry, Theme Manager, Workspace Manager, Notification System

Build on Web Standards: React + Vite + Tailwind CSS + Zustand`,
        size: 290,
        mimeType: 'text/plain',
        trashed: false,
        createdAt: now,
        updatedAt: now,
      })
    }
  } catch (e) {
    console.error('Failed to initialize filesystem:', e)
  }
}

export async function listDirectory(parentId = 'folder-root') {
  const all = await getAllFromStore('files')
  return all.filter((item) => item.parentId === parentId && !item.trashed)
}

export async function listTrash() {
  const all = await getAllFromStore('files')
  return all.filter((item) => item.trashed)
}

export async function getItemById(id) {
  const all = await getAllFromStore('files')
  return all.find((item) => item.id === id) || null
}

export async function getItemByPath(path) {
  const all = await getAllFromStore('files')
  return all.find((item) => item.path === path && !item.trashed) || null
}

export async function createFolder(parentId, name) {
  const parent = await getItemById(parentId)
  const parentPath = parent ? parent.path : '/'
  const newPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`
  const now = new Date().toISOString()

  const newFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name,
    path: newPath,
    parentId: parentId || 'folder-root',
    type: 'folder',
    size: 0,
    trashed: false,
    createdAt: now,
    updatedAt: now,
  }

  await saveToStore('files', newFolder)
  return newFolder
}

export async function createFile(parentId, name, content = '', mimeType = 'text/plain') {
  const parent = await getItemById(parentId)
  const parentPath = parent ? parent.path : '/'
  const newPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`
  const now = new Date().toISOString()

  const newFile = {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name,
    path: newPath,
    parentId: parentId || 'folder-root',
    type: 'file',
    content,
    size: new Blob([content]).size,
    mimeType,
    trashed: false,
    createdAt: now,
    updatedAt: now,
  }

  await saveToStore('files', newFile)
  return newFile
}

export async function writeFile(id, content) {
  const item = await getItemById(id)
  if (!item) throw new Error('File not found')
  
  const updated = {
    ...item,
    content,
    size: new Blob([content]).size,
    updatedAt: new Date().toISOString(),
  }

  await saveToStore('files', updated)
  return updated
}

export async function renameItem(id, newName) {
  const item = await getItemById(id)
  if (!item) throw new Error('Item not found')

  const parent = await getItemById(item.parentId)
  const parentPath = parent ? parent.path : '/'
  const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`

  const updated = {
    ...item,
    name: newName,
    path: newPath,
    updatedAt: new Date().toISOString(),
  }

  await saveToStore('files', updated)

  // Update children paths if folder
  if (item.type === 'folder') {
    const all = await getAllFromStore('files')
    const children = all.filter((c) => c.parentId === id)
    for (const child of children) {
      const childNewPath = `${newPath}/${child.name}`
      await saveToStore('files', { ...child, path: childNewPath })
    }
  }

  return updated
}

export async function moveToTrash(id) {
  const item = await getItemById(id)
  if (!item) return
  const updated = {
    ...item,
    trashed: true,
    originalParentId: item.parentId,
    parentId: 'folder-trash',
    updatedAt: new Date().toISOString(),
  }
  await saveToStore('files', updated)
}

export async function restoreFromTrash(id) {
  const item = await getItemById(id)
  if (!item) return
  const targetParent = item.originalParentId || 'folder-documents'
  const updated = {
    ...item,
    trashed: false,
    parentId: targetParent,
    updatedAt: new Date().toISOString(),
  }
  await saveToStore('files', updated)
}

export async function permanentDelete(id) {
  await deleteFromStore('files', id)
}

export async function emptyTrash() {
  const trashedItems = await listTrash()
  for (const item of trashedItems) {
    await deleteFromStore('files', item.id)
  }
}

export async function moveItem(id, targetParentId) {
  const item = await getItemById(id)
  const targetParent = await getItemById(targetParentId)
  if (!item || !targetParent) throw new Error('Invalid move target')

  const parentPath = targetParent.path
  const newPath = parentPath === '/' ? `/${item.name}` : `${parentPath}/${item.name}`

  const updated = {
    ...item,
    parentId: targetParentId,
    path: newPath,
    updatedAt: new Date().toISOString(),
  }

  await saveToStore('files', updated)
  return updated
}

export async function copyItem(id, targetParentId) {
  const item = await getItemById(id)
  if (!item) throw new Error('Item not found')

  const now = new Date().toISOString()
  const copyName = `${item.name.replace(/(\.[^/.]+)?$/, '')}_copy${item.name.match(/\.[^/.]+$/)?.[0] || ''}`
  
  if (item.type === 'file') {
    return await createFile(targetParentId, copyName, item.content, item.mimeType)
  } else {
    const newFolder = await createFolder(targetParentId, copyName)
    // Recursive copy children
    const all = await getAllFromStore('files')
    const children = all.filter((c) => c.parentId === id)
    for (const child of children) {
      await copyItem(child.id, newFolder.id)
    }
    return newFolder
  }
}

export async function toggleStarItem(id) {
  const item = await getItemById(id)
  if (!item) return null
  const updated = {
    ...item,
    starred: !item.starred,
    updatedAt: new Date().toISOString(),
  }
  await saveToStore('files', updated)
  return updated
}

export async function listStarred() {
  const all = await getAllFromStore('files')
  return all.filter((item) => item.starred && !item.trashed)
}

export async function listRecent(limit = 15) {
  const all = await getAllFromStore('files')
  return all
    .filter((item) => !item.trashed && item.id !== 'folder-root')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
}

export async function searchFiles(query) {
  if (!query) return []
  const all = await getAllFromStore('files')
  const q = query.toLowerCase()
  return all.filter((item) => !item.trashed && item.name.toLowerCase().includes(q))
}
