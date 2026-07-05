import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopSong } from './TopSong'
import { usePlayerStore } from '../../../stores/player.store'
import { initialPlayerState } from '../../../types/player'
import { topSongs } from '../../../data/topSongs'

beforeEach(() => {
  usePlayerStore.setState(initialPlayerState)
})

describe('TopSong', () => {
  it('renders one row per top song with rank number', () => {
    render(<TopSong />)
    topSongs.forEach((song) => {
      expect(screen.getByText(song.nameSong)).toBeInTheDocument()
    })
  })

  it('clicking a row plays that song', () => {
    render(<TopSong />)
    fireEvent.click(screen.getByText(topSongs[2].nameSong))
    expect(screen.getByTestId('top-thumb')).toHaveAttribute('src', `/img/${topSongs[2].img}`)
    expect(usePlayerStore.getState().topSongIndex).toBe(2)
  })

  it('highlights the currently playing row', () => {
    usePlayerStore.setState({ mode: 'top', topSongIndex: 1 })
    render(<TopSong />)
    const rows = screen.getAllByTestId('top-song-row')
    expect(rows[1].className).toContain('bg-white')
  })
})
