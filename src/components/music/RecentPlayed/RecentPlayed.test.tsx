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
  it('shows only songs belonging to the selected artist (sontung by default)', () => {
    render(<RecentPlayed />)
    const sontungSongs = songs.filter((s) => s.artist === 'sontung')
    sontungSongs.forEach((s) => expect(screen.getByText(s.nameSong)).toBeInTheDocument())
    const ameeSong = songs.find((s) => s.artist === 'amee')!
    expect(screen.queryByText(ameeSong.nameSong)).not.toBeInTheDocument()
  })

  it('clicking a song plays it via the store', () => {
    render(<RecentPlayed />)
    const sontungSongs = songs.filter((s) => s.artist === 'sontung')
    fireEvent.click(screen.getByText(sontungSongs[1].nameSong))
    const state = usePlayerStore.getState()
    expect(state.mode).toBe('artist')
    expect(state.artistSongPosition).toBe(1)
  })

  it('re-filters when the selected artist changes', () => {
    usePlayerStore.setState({ selectedArtist: 'amee' })
    render(<RecentPlayed />)
    const ameeSongs = songs.filter((s) => s.artist === 'amee')
    ameeSongs.forEach((s) => expect(screen.getByText(s.nameSong)).toBeInTheDocument())
  })
})
