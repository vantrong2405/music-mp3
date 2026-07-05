import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../stores/player.store'
import { topSongs } from '../data/topSongs'
import { songs } from '../data/songs'
import { pickRandomSubset } from '../utils/shuffle'
import { selectArtistSongIndices } from '../utils/navigation'
import { resolveSongAudioSrc } from '../utils/media'

export function usePlayerEngine() {
  const state = usePlayerStore()
  const audioRef = useRef<HTMLAudioElement>(null)

  const artistSongIndices = selectArtistSongIndices(songs, state.selectedArtist)

  const currentSong = state.isRandom
    ? songs[state.randomQueue[state.randomPosition]]
    : state.mode === 'artist'
      ? songs[state.artistSongGlobalIndex]
      : state.mode === 'another'
        ? songs[state.anotherSongPool[state.anotherSongPosition]]
        : topSongs[state.topSongIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = resolveSongAudioSrc(currentSong)
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (state.isPlaying) audio.play()
    else audio.pause()
  }, [state.isPlaying, currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = state.isMuted ? 0 : state.volume / 100
  }, [state.volume, state.isMuted])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 46.1875em)')
    state.setMobile(mql.matches)
    const listener = (e: MediaQueryListEvent) => state.setMobile(e.matches)
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const poolSize = state.isMobile ? 8 : 4
    state.setAnotherPool(pickRandomSubset(songs.length, poolSize))
    // generated once, matching the original's one-time renderAnotherSong() call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => {
      if (state.isRepeat) {
        audio.currentTime = 0
        audio.play()
        return
      }
      if (state.isRandom) {
        state.randomAdvance()
        return
      }
      state.nextSong(topSongs.length, artistSongIndices)
    }
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRepeat, state.isRandom, state.mode, artistSongIndices])

  function next() {
    state.nextSong(topSongs.length, artistSongIndices)
  }

  function prev() {
    state.prevSong(topSongs.length, artistSongIndices)
  }

  function toggleRandom() {
    const queue = state.isRandom ? [] : pickRandomSubset(songs.length, songs.length)
    state.toggleRandom(queue)
  }

  return { state, audioRef, currentSong, next, prev, toggleRandom }
}
