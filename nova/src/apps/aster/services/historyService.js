import {
  getAllFromAsterStore,
  getFromAsterStore,
  saveToAsterStore,
  deleteFromAsterStore,
  clearAsterStore,
} from './asterDB'

export async function addHistoryEntry(url, title = '', favicon = '') {
  if (!url || url.startsWith('aster://') || url.startsWith('about:blank')) return

  try {
    const existing = await getFromAsterStore('history', url)
    const now = new Date().toISOString()

    const entry = {
      url,
      title: title || url,
      favicon: favicon || '',
      timestamp: now,
      visitCount: existing ? (existing.visitCount || 1) + 1 : 1,
    }

    await saveToAsterStore('history', entry)
  } catch (e) {
    console.error('Failed to add ASTER history entry:', e)
  }
}

export async function getHistory() {
  const all = await getAllFromAsterStore('history')
  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function searchHistory(query) {
  if (!query) return getHistory()
  const all = await getHistory()
  const q = query.toLowerCase()
  return all.filter(
    (item) => item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
  )
}

export async function deleteHistoryItem(url) {
  await deleteFromAsterStore('history', url)
}

export async function clearHistory() {
  await clearAsterStore('history')
}
