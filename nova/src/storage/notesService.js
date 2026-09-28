import { getAllFromStore, saveToStore, deleteFromStore } from './db'

export async function initNotes() {
  const existing = await getAllFromStore('notes')
  if (existing.length === 0) {
    const now = new Date().toISOString()
    await saveToStore('notes', {
      id: 'note-welcome',
      title: 'Welcome Note',
      content: `Welcome to NOVA Notes!

This application provides debounced autosaving and IndexedDB persistence for all your quick thoughts, task lists, and documentation.

Features:
• Pin important notes to top
• Archive old notes
• Instant keyword search
• Autosaved changes`,
      pinned: true,
      archived: false,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function getNotes() {
  return await getAllFromStore('notes')
}

export async function createNote(title = 'Untitled Note', content = '') {
  const now = new Date().toISOString()
  const newNote = {
    id: `note-${Date.now()}`,
    title,
    content,
    pinned: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }
  await saveToStore('notes', newNote)
  return newNote
}

export async function updateNote(id, updates) {
  const all = await getAllFromStore('notes')
  const existing = all.find((n) => n.id === id)
  if (!existing) return null

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await saveToStore('notes', updated)
  return updated
}

export async function deleteNote(id) {
  await deleteFromStore('notes', id)
}
