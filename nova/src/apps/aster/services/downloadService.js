import {
  getAllFromAsterStore,
  saveToAsterStore,
  clearAsterStore,
} from './asterDB'

export async function addDownloadItem(filename, url, size = 0, status = 'completed') {
  try {
    const id = `dl-${Date.now()}`
    const item = {
      id,
      filename,
      url,
      size,
      status, // 'completed' | 'failed' | 'in-progress'
      timestamp: new Date().toISOString(),
    }
    await saveToAsterStore('downloads', item)
    return item
  } catch (e) {
    console.error('Failed to record download:', e)
    return null
  }
}

export async function getDownloads() {
  const all = await getAllFromAsterStore('downloads')
  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function clearDownloads() {
  await clearAsterStore('downloads')
}
