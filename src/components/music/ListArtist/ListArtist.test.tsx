import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListArtist } from './ListArtist'
import { usePlayerStore } from '../../../stores/player.store'
import { initialPlayerState } from '../../../types/player'
import { artists } from '../../../data/artists'

beforeEach(() => {
  usePlayerStore.setState(initialPlayerState)
})

describe('ListArtist', () => {
  it('renders every artist name and label', () => {
    render(<ListArtist />)
    artists.forEach((a) => {
      expect(screen.getByText(a.displayName)).toBeInTheDocument()
      expect(screen.getByText(a.lastPlayedLabel)).toBeInTheDocument()
    })
  })

  it('clicking an artist selects it in the store', () => {
    render(<ListArtist />)
    fireEvent.click(screen.getByText('AMEE'))
    const state = usePlayerStore.getState()
    expect(state.selectedArtist).toBe('amee')
    expect(state.selectedArtistIndex).toBe(1)
  })

  it('highlights the selected artist row', () => {
    usePlayerStore.setState({ selectedArtistIndex: 1 })
    render(<ListArtist />)
    const rows = screen.getAllByTestId('artist-row')
    expect(rows[1].className).toContain('bg-white')
  })
})
