import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerBar } from './PlayerBar'
import { usePlayerStore } from '../../../stores/player.store'
import { initialPlayerState } from '../../../types/player'

beforeEach(() => {
  usePlayerStore.setState(initialPlayerState)
})

describe('PlayerBar', () => {
  it('shows the current top song name and artist', () => {
    render(<PlayerBar />)
    expect(screen.getByText('Anh sai rồi')).toBeInTheDocument()
    expect(screen.getByText('Sơn Tùng')).toBeInTheDocument()
  })

  it('toggles play/pause icon on click', () => {
    render(<PlayerBar />)
    const playBtn = screen.getByTestId('pause')
    expect(playBtn.querySelector('.fa-circle-play')).toBeTruthy()
    fireEvent.click(playBtn)
    expect(playBtn.querySelector('.fa-circle-pause')).toBeTruthy()
  })

  it('mutes and restores volume icon on click', () => {
    render(<PlayerBar />)
    const volIcon = screen.getByTestId('vol-icon')
    expect(volIcon.querySelector('.fa-volume-high')).toBeTruthy()
    fireEvent.click(volIcon)
    expect(volIcon.querySelector('.fa-volume-slash')).toBeTruthy()
  })

  it('toggles repeat icon color on click', () => {
    render(<PlayerBar />)
    const repeatBtn = screen.getByTestId('repeat')
    fireEvent.click(repeatBtn)
    expect(usePlayerStore.getState().isRepeat).toBe(true)
  })
})
