import { create } from 'zustand'

export const useJarvisStore = create((set, get) => ({
  isOpen: false,
  isListening: false,
  isSpeaking: false,
  isThinking: false,
  transcript: '',
  response: 'At your service, sir. How may I assist you today?',
  history: [
    { sender: 'jarvis', text: 'All NOVA systems nominal. Awaiting your command.' }
  ],
  isAutomatedWakeWord: false, // automated continuous listening

  openJarvis: () => set({ isOpen: true }),
  closeJarvis: () => set({ isOpen: false, isListening: false }),
  toggleJarvis: () => set((state) => ({ isOpen: !state.isOpen })),

  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsThinking: (isThinking) => set({ isThinking }),
  setTranscript: (transcript) => set({ transcript }),
  setResponse: (response) => set((state) => ({
    response,
    history: [...state.history, { sender: 'jarvis', text: response }],
  })),

  addUserQuery: (query) => set((state) => ({
    history: [...state.history, { sender: 'user', text: query }],
    transcript: query,
  })),

  toggleWakeWord: () => set((state) => ({ isAutomatedWakeWord: !state.isAutomatedWakeWord })),
}))
