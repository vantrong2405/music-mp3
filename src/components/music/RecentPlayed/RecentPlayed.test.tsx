import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentPlayed } from './RecentPlayed'
import { usePlayerStore } from '../../../stores/player.store'
import { initialPlayerState } from '../../../types/player'
import { songs } from '../../../data/songs'

beforeEach(() => {
  usePlayerStore.setState(initialPlayerState)
})

describe('RecentPlayed', () => {
  it('shows only songs belonging to the selected artist (taylor by default)', () => {
    render(<RecentPlayed />)
    const taylorSongs = songs.filter((s) => s.artist === 'taylor')
    taylorSongs.forEach((s) => expect(screen.getByText(s.nameSong)).toBeInTheDocument())
    const weekndSong = songs.find((s) => s.artist === 'weeknd')!
    expect(screen.queryByText(weekndSong.nameSong)).not.toBeInTheDocument()
  })

  it('clicking a song plays it via the store', () => {
    render(<RecentPlayed />)
    const taylorSongs = songs.filter((s) => s.artist === 'taylor')
    fireEvent.click(screen.getByText(taylorSongs[1].nameSong))
    const state = usePlayerStore.getState()
    expect(state.mode).toBe('artist')
    expect(state.artistSongPosition).toBe(1)
  })

  it('re-filters when the selected artist changes', () => {
    usePlayerStore.setState({ selectedArtist: 'weeknd' })
    render(<RecentPlayed />)
    const weekndSongs = songs.filter((s) => s.artist === 'weeknd')
    weekndSongs.forEach((s) => expect(screen.getByText(s.nameSong)).toBeInTheDocument())
  })
})
