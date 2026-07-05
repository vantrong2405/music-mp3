import { create } from 'zustand'
import { initialPlayerState, type PlayerState } from '../types/player'
import type { ArtistId } from '../types/song'

interface PlayerActions {
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  setMobile: (isMobile: boolean) => void
  playTopSong: (index: number) => void
  nextTopSong: (length: number) => void
  prevTopSong: (length: number) => void
  selectArtist: (artist: ArtistId, artistIndex: number) => void
  playArtistSong: (songIndex: number, position: number) => void
  nextArtistSong: (songIndices: number[]) => void
  prevArtistSong: (songIndices: number[]) => void
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set) => ({
  ...initialPlayerState,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  setMobile: (isMobile) => set({ isMobile }),
  playTopSong: (index) => set({ mode: 'top', topSongIndex: index, isPlaying: true }),
  nextTopSong: (length) =>
    set((state) => ({ mode: 'top', topSongIndex: (state.topSongIndex + 1) % length, isPlaying: true })),
  prevTopSong: (length) =>
    set((state) => ({ mode: 'top', topSongIndex: (state.topSongIndex - 1 + length) % length, isPlaying: true })),
  selectArtist: (artist, artistIndex) => set({ selectedArtist: artist, selectedArtistIndex: artistIndex }),
  playArtistSong: (songIndex, position) =>
    set({ mode: 'artist', artistSongGlobalIndex: songIndex, artistSongPosition: position, isPlaying: true }),
  nextArtistSong: (songIndices) =>
    set((state) => {
      const nextPos = (state.artistSongPosition + 1) % songIndices.length
      return { mode: 'artist', artistSongPosition: nextPos, artistSongGlobalIndex: songIndices[nextPos], isPlaying: true }
    }),
  prevArtistSong: (songIndices) =>
    set((state) => {
      const prevPos = (state.artistSongPosition - 1 + songIndices.length) % songIndices.length
      return { mode: 'artist', artistSongPosition: prevPos, artistSongGlobalIndex: songIndices[prevPos], isPlaying: true }
    }),
}))
