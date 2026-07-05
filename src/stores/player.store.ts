import { create } from 'zustand'
import { initialPlayerState, type PlayerState } from '../types/player'
import type { ArtistId } from '../types/song'

const FAVORITES_STORAGE_KEY = 'music-mp3:favorites'

function readStoredFavoriteSongIds() {
  if (typeof localStorage === 'undefined') return []

  try {
    const storedValue = localStorage.getItem(FAVORITES_STORAGE_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : []
    return Array.isArray(parsedValue) ? parsedValue.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}

function storeFavoriteSongIds(songIds: string[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(songIds))
}

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
  setAnotherPool: (pool: number[]) => void
  playAnotherSong: (position: number) => void
  nextAnotherSong: () => void
  prevAnotherSong: () => void
  /** Mode-aware dispatcher: figures out which "next" the current mode needs. */
  nextSong: (topSongsLength: number, artistSongIndices: number[]) => void
  prevSong: (topSongsLength: number, artistSongIndices: number[]) => void
  toggleRandom: (queue: number[]) => void
  randomAdvance: () => void
  toggleFavorite: (songId: string) => void
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  ...initialPlayerState,
  favoriteSongIds: readStoredFavoriteSongIds(),

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
  setAnotherPool: (pool) => set({ anotherSongPool: pool }),
  playAnotherSong: (position) => set({ mode: 'another', anotherSongPosition: position, isPlaying: true }),
  nextAnotherSong: () =>
    set((state) => ({
      mode: 'another',
      anotherSongPosition: (state.anotherSongPosition + 1) % state.anotherSongPool.length,
      isPlaying: true,
    })),
  prevAnotherSong: () =>
    set((state) => ({
      mode: 'another',
      anotherSongPosition: (state.anotherSongPosition - 1 + state.anotherSongPool.length) % state.anotherSongPool.length,
      isPlaying: true,
    })),
  nextSong: (topSongsLength, artistSongIndices) => {
    const { mode, nextTopSong, nextArtistSong, nextAnotherSong } = get()
    if (mode === 'top') return nextTopSong(topSongsLength)
    if (mode === 'artist') return nextArtistSong(artistSongIndices)
    return nextAnotherSong()
  },
  prevSong: (topSongsLength, artistSongIndices) => {
    const { mode, prevTopSong, prevArtistSong, prevAnotherSong } = get()
    if (mode === 'top') return prevTopSong(topSongsLength)
    if (mode === 'artist') return prevArtistSong(artistSongIndices)
    return prevAnotherSong()
  },
  toggleRandom: (queue) =>
    set((state) =>
      state.isRandom ? { isRandom: false } : { isRandom: true, randomQueue: queue, randomPosition: 0 },
    ),
  randomAdvance: () =>
    set((state) => ({
      randomPosition: (state.randomPosition + 1) % state.randomQueue.length,
      isPlaying: true,
    })),
  toggleFavorite: (songId) =>
    set((state) => {
      const favoriteSongIds = state.favoriteSongIds.includes(songId)
        ? state.favoriteSongIds.filter((favoriteSongId) => favoriteSongId !== songId)
        : [...state.favoriteSongIds, songId]

      storeFavoriteSongIds(favoriteSongIds)
      return { favoriteSongIds }
    }),
}))
