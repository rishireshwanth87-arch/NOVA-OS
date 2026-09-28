import { create } from 'zustand'

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [
    { id: 'ws-1', name: 'Desktop' },
    { id: 'ws-2', name: 'Work' },
  ],
  activeWorkspaceId: 'ws-1',

  switchWorkspace: (workspaceId) => {
    set({ activeWorkspaceId: workspaceId })
  },

  addWorkspace: (name) => {
    const id = `ws-${Date.now()}`
    const newWs = { id, name: name || `Workspace ${get().workspaces.length + 1}` }
    set((state) => ({
      workspaces: [...state.workspaces, newWs],
      activeWorkspaceId: id,
    }))
  },

  renameWorkspace: (id, newName) => {
    set((state) => ({
      workspaces: state.workspaces.map((ws) => (ws.id === id ? { ...ws, name: newName } : ws)),
    }))
  },

  removeWorkspace: (id) => {
    const { workspaces, activeWorkspaceId } = get()
    if (workspaces.length <= 1) return // Keep at least one workspace
    const remaining = workspaces.filter((ws) => ws.id !== id)
    const nextActive = activeWorkspaceId === id ? remaining[0].id : activeWorkspaceId
    set({
      workspaces: remaining,
      activeWorkspaceId: nextActive,
    })
  },
}))
