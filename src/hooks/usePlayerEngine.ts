import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../stores/player.store'
import { topSongs } from '../data/topSongs'

export function usePlayerEngine() {
  const state = usePlayerStore()
  const audioRef = useRef<HTMLAudioElement>(null)

  // Task 1 only knows about "top" mode; later tasks extend this as
  // artist/another modes are implemented.
  const currentSong = topSongs[state.topSongIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = `/musics/${currentSong.nameFile}`
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

  return { state, audioRef, currentSong }
}
