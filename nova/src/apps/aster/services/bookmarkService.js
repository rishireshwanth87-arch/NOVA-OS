import {
  getAllFromAsterStore,
  saveToAsterStore,
  deleteFromAsterStore,
} from './asterDB'

export async function addBookmark(title, url, favicon = '') {
  if (!url || url.startsWith('aster://')) return null

  try {
    const id = `bmk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const bookmark = {
      id,
      title: title || url,
      url,
      favicon,
      createdAt: new Date().toISOString(),
    }
    await saveToAsterStore('bookmarks', bookmark)
    return bookmark
  } catch (e) {
    console.error('Failed to add bookmark:', e)
    return null
  }
}

export async function removeBookmarkByUrl(url) {
  const all = await getAllFromAsterStore('bookmarks')
  const target = all.find((b) => b.url === url)
  if (target) {
    await deleteFromAsterStore('bookmarks', target.id)
  }
}

export async function isBookmarked(url) {
  if (!url) return false
  const all = await getAllFromAsterStore('bookmarks')
  return all.some((b) => b.url === url)
}

export async function getBookmarks() {
  const all = await getAllFromAsterStore('bookmarks')
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function searchBookmarks(query) {
  if (!query) return getBookmarks()
  const all = await getBookmarks()
  const q = query.toLowerCase()
  return all.filter(
    (item) => item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
  )
}
