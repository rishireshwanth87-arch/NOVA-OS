import { getAllFromStore, saveToStore, deleteFromStore } from './db'

export async function initCalendar() {
  const existing = await getAllFromStore('calendar')
  if (existing.length === 0) {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    await saveToStore('calendar', {
      id: 'event-welcome',
      title: 'NOVA WebOS Orientation',
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      description: 'Explore NOVA WebOS functional applications and browser capabilities.',
      location: 'NOVA Desktop Environment',
      category: 'work',
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function getEvents() {
  return await getAllFromStore('calendar')
}

export async function createEvent(eventData) {
  const now = new Date().toISOString()
  const newEvent = {
    id: `event-${Date.now()}`,
    title: eventData.title || 'New Event',
    date: eventData.date,
    startTime: eventData.startTime || '09:00',
    endTime: eventData.endTime || '10:00',
    description: eventData.description || '',
    location: eventData.location || '',
    category: eventData.category || 'work',
    createdAt: now,
    updatedAt: now,
  }
  await saveToStore('calendar', newEvent)
  return newEvent
}

export async function updateEvent(id, eventData) {
  const all = await getAllFromStore('calendar')
  const existing = all.find((e) => e.id === id)
  if (!existing) return null

  const updated = {
    ...existing,
    ...eventData,
    updatedAt: new Date().toISOString(),
  }
  await saveToStore('calendar', updated)
  return updated
}

export async function deleteEvent(id) {
  await deleteFromStore('calendar', id)
}
