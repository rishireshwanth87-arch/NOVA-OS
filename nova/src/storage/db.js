/**
 * Central IndexedDB Storage Service for NOVA WebOS
 */

const DB_NAME = 'NOVA_WEBOS_DB'
const DB_VERSION = 3

let dbInstance = null

export function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // 1. Filesystem Store
      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'id' })
        filesStore.createIndex('path', 'path', { unique: true })
        filesStore.createIndex('parentId', 'parentId', { unique: false })
        filesStore.createIndex('trashed', 'trashed', { unique: false })
      }

      // 2. Notes Store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
        notesStore.createIndex('pinned', 'pinned', { unique: false })
        notesStore.createIndex('archived', 'archived', { unique: false })
      }

      // 3. Calendar Store
      if (!db.objectStoreNames.contains('calendar')) {
        const calStore = db.createObjectStore('calendar', { keyPath: 'id' })
        calStore.createIndex('date', 'date', { unique: false })
      }

      // 4. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      console.error('IndexedDB Error:', event.target.error)
      reject(event.target.error)
    }
  })
}

// Low-level helper functions for store transactions
export async function getAllFromStore(storeName) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    } catch (err) {
      console.warn(`Store ${storeName} read fallback`, err)
      resolve([])
    }
  })
}

export async function getFromStore(storeName, key) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    } catch (err) {
      resolve(null)
    }
  })
}

export async function saveToStore(storeName, item) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.put(item)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } catch (err) {
      console.warn(`Store ${storeName} write fallback`, err)
      resolve(item.id || null)
    }
  })
}

export async function deleteFromStore(storeName, key) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    } catch (err) {
      resolve()
    }
  })
}
