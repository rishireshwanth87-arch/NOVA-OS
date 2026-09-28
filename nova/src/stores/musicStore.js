import { create } from 'zustand'

export const TRACKS = [
  { id: 1, title: 'Neon Horizon', artist: 'NOVA Sound Collective', duration: '3:45', cover: '🎵' },
  { id: 2, title: 'Cyber Rain', artist: 'Aetheria', duration: '4:12', cover: '🌧️' },
  { id: 3, title: 'Orbital Sunset', artist: 'Synthia', duration: '3:20', cover: '🪐' },
  { id: 4, title: 'Digital Dreamscape', artist: 'Subzero', duration: '5:01', cover: '🌌' },
]

export const useMusicStore = create((set, get) => ({
  tracks: TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  progress: 25,
  volume: 0.8,
  isMuted: false,

  currentTrack: () => get().tracks[get().currentTrackIndex],

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextTrack: () =>
    set((state) => ({
      currentTrackIndex: (state.currentTrackIndex + 1) % state.tracks.length,
      progress: 0,
    })),

  prevTrack: () =>
    set((state) => ({
      currentTrackIndex:
        (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length,
      progress: 0,
    })),

  setTrack: (index) => set({ currentTrackIndex: index, progress: 0 }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
}))
