import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from './player.store'
import { initialPlayerState } from '../types/player'

beforeEach(() => {
  localStorage.clear()
  usePlayerStore.setState(initialPlayerState)
})

describe('usePlayerStore — Task 1 (transport controls)', () => {
  it('togglePlay flips isPlaying', () => {
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('setPlaying sets isPlaying explicitly', () => {
    usePlayerStore.getState().setPlaying(true)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('setVolume clamps to 0-100', () => {
    usePlayerStore.getState().setVolume(150)
    expect(usePlayerStore.getState().volume).toBe(100)
    usePlayerStore.getState().setVolume(-10)
    expect(usePlayerStore.getState().volume).toBe(0)
    usePlayerStore.getState().setVolume(42)
    expect(usePlayerStore.getState().volume).toBe(42)
  })

  it('toggleMute flips isMuted', () => {
    usePlayerStore.getState().toggleMute()
    expect(usePlayerStore.getState().isMuted).toBe(true)
  })

  it('toggleRepeat flips isRepeat', () => {
    usePlayerStore.getState().toggleRepeat()
    expect(usePlayerStore.getState().isRepeat).toBe(true)
  })

  it('setMobile sets isMobile', () => {
    usePlayerStore.getState().setMobile(true)
    expect(usePlayerStore.getState().isMobile).toBe(true)
  })

  it('playTopSong sets mode to top, sets topSongIndex, starts playing', () => {
    usePlayerStore.getState().playTopSong(3)
    const state = usePlayerStore.getState()
    expect(state.mode).toBe('top')
    expect(state.topSongIndex).toBe(3)
    expect(state.isPlaying).toBe(true)
  })
})

describe('usePlayerStore — Task 2 (top song navigation)', () => {
  it('nextTopSong advances and wraps to 0 at the end', () => {
    usePlayerStore.setState({ topSongIndex: 5 }) // topSongs has 6 items (0-5)
    usePlayerStore.getState().nextTopSong(6)
    expect(usePlayerStore.getState().topSongIndex).toBe(0)

    usePlayerStore.setState({ topSongIndex: 2 })
    usePlayerStore.getState().nextTopSong(6)
    expect(usePlayerStore.getState().topSongIndex).toBe(3)
  })

  it('prevTopSong retreats and wraps to length-1 at the start', () => {
    usePlayerStore.setState({ topSongIndex: 0 })
    usePlayerStore.getState().prevTopSong(6)
    expect(usePlayerStore.getState().topSongIndex).toBe(5)

    usePlayerStore.setState({ topSongIndex: 2 })
    usePlayerStore.getState().prevTopSong(6)
    expect(usePlayerStore.getState().topSongIndex).toBe(1)
  })

  it('nextTopSong/prevTopSong set mode to top and start playing', () => {
    usePlayerStore.setState({ mode: 'artist', isPlaying: false })
    usePlayerStore.getState().nextTopSong(6)
    expect(usePlayerStore.getState().mode).toBe('top')
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })
})

describe('usePlayerStore — Task 3 (artist mode)', () => {
  it('selectArtist sets selectedArtist/selectedArtistIndex, does not change mode/play state', () => {
    usePlayerStore.getState().selectArtist('weeknd', 1)
    const state = usePlayerStore.getState()
    expect(state.selectedArtist).toBe('weeknd')
    expect(state.selectedArtistIndex).toBe(1)
    expect(state.isPlaying).toBe(false)
  })

  it('playArtistSong sets mode to artist, sets indices, starts playing', () => {
    usePlayerStore.getState().playArtistSong(4, 0)
    const state = usePlayerStore.getState()
    expect(state.mode).toBe('artist')
    expect(state.artistSongGlobalIndex).toBe(4)
    expect(state.artistSongPosition).toBe(0)
    expect(state.isPlaying).toBe(true)
  })

  it('nextArtistSong advances position and wraps within the filtered list length', () => {
    usePlayerStore.setState({ mode: 'artist', artistSongPosition: 0 })
    usePlayerStore.getState().nextArtistSong([4, 5, 6, 7])
    expect(usePlayerStore.getState().artistSongPosition).toBe(1)
    expect(usePlayerStore.getState().artistSongGlobalIndex).toBe(5)

    usePlayerStore.setState({ artistSongPosition: 3 })
    usePlayerStore.getState().nextArtistSong([4, 5, 6, 7])
    expect(usePlayerStore.getState().artistSongPosition).toBe(0)
    expect(usePlayerStore.getState().artistSongGlobalIndex).toBe(4)
  })

  it('prevArtistSong retreats position and wraps to the end', () => {
    usePlayerStore.setState({ mode: 'artist', artistSongPosition: 0 })
    usePlayerStore.getState().prevArtistSong([4, 5, 6, 7])
    expect(usePlayerStore.getState().artistSongPosition).toBe(3)
    expect(usePlayerStore.getState().artistSongGlobalIndex).toBe(7)
  })
})

describe('usePlayerStore — favorites', () => {
  it('adds and removes a favorite song id', () => {
    usePlayerStore.getState().toggleFavorite('weeknd/blinding-lights.m4a')
    expect(usePlayerStore.getState().favoriteSongIds).toEqual(['weeknd/blinding-lights.m4a'])

    usePlayerStore.getState().toggleFavorite('weeknd/blinding-lights.m4a')
    expect(usePlayerStore.getState().favoriteSongIds).toEqual([])
  })

  it('persists favorites to localStorage', () => {
    usePlayerStore.getState().toggleFavorite('dualipa/levitating.m4a')
    expect(localStorage.getItem('music-mp3:favorites')).toBe(JSON.stringify(['dualipa/levitating.m4a']))
  })
})
