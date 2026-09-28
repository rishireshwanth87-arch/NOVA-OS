/**
 * Dedicated IndexedDB Storage Manager for ASTER Web Browser
 */

const ASTER_DB_NAME = 'nova_aster'
const ASTER_DB_VERSION = 1

let asterDbInstance = null

export function getAsterDB() {
  if (asterDbInstance) return Promise.resolve(asterDbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ASTER_DB_NAME, ASTER_DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // 1. History Store
      if (!db.objectStoreNames.contains('history')) {
        const histStore = db.createObjectStore('history', { keyPath: 'url' })
        histStore.createIndex('timestamp', 'timestamp', { unique: false })
        histStore.createIndex('visitCount', 'visitCount', { unique: false })
      }

      // 2. Bookmarks Store
      if (!db.objectStoreNames.contains('bookmarks')) {
        const bmkStore = db.createObjectStore('bookmarks', { keyPath: 'id' })
        bmkStore.createIndex('url', 'url', { unique: true })
        bmkStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // 3. Downloads Store
      if (!db.objectStoreNames.contains('downloads')) {
        const dlStore = db.createObjectStore('downloads', { keyPath: 'id' })
        dlStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // 4. Closed Tabs Store
      if (!db.objectStoreNames.contains('closedTabs')) {
        db.createObjectStore('closedTabs', { keyPath: 'id' })
      }

      // 5. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    request.onsuccess = (event) => {
      asterDbInstance = event.target.result
      resolve(asterDbInstance)
    }

    request.onerror = (event) => {
      console.error('ASTER IndexedDB Error:', event.target.error)
      reject(event.target.error)
    }
  })
}

export async function getAllFromAsterStore(storeName) {
  const db = await getAsterDB()
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    } catch (e) {
      resolve([])
    }
  })
}

export async function getFromAsterStore(storeName, key) {
  const db = await getAsterDB()
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    } catch (e) {
      resolve(null)
    }
  })
}

export async function saveToAsterStore(storeName, item) {
  const db = await getAsterDB()
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.put(item)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch (e) {
      resolve(null)
    }
  })
}

export async function deleteFromAsterStore(storeName, key) {
  const db = await getAsterDB()
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    } catch (e) {
      resolve()
    }
  })
}

export async function clearAsterStore(storeName) {
  const db = await getAsterDB()
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.clear()
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    } catch (e) {
      resolve()
    }
  })
}
