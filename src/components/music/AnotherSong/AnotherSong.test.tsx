import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnotherSong } from './AnotherSong'
import { usePlayerStore } from '../../../stores/player.store'
import { initialPlayerState } from '../../../types/player'

beforeEach(() => {
  localStorage.clear()
  usePlayerStore.setState({
    ...initialPlayerState,
    anotherSongPool: [0, 4],
  })
})

describe('AnotherSong', () => {
  it('filters the queue to favorite songs', () => {
    usePlayerStore.setState({ favoriteSongIds: ['weeknd/blinding-lights.m4a'] })
    render(<AnotherSong />)

    fireEvent.click(screen.getByTestId('favorite-filter'))

    expect(screen.queryByText('Anti-Hero')).not.toBeInTheDocument()
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument()
  })

  it('shows an empty favorite state when no queued songs are favorited', () => {
    render(<AnotherSong />)

    fireEvent.click(screen.getByTestId('favorite-filter'))

    expect(screen.getByText('No favorite tracks yet')).toBeInTheDocument()
  })

  it('favorites a queued song from its heart button', () => {
    render(<AnotherSong />)

    fireEvent.click(screen.getByLabelText('Add Anti-Hero to favorites'))

    expect(usePlayerStore.getState().favoriteSongIds).toContain('taylor/anti-hero.m4a')
  })
})
