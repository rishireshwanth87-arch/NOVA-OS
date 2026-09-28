import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAIStore = create(
  persist(
    (set) => ({
      geminiApiKey: '',
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: 'nova-ai-storage-v2',
    }
  )
)
