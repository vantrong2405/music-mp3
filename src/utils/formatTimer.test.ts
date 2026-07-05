import { describe, it, expect } from 'vitest'
import { formatTimer } from './formatTimer'

describe('formatTimer', () => {
  it('pads seconds under 10 with a leading zero', () => {
    expect(formatTimer(65)).toBe('1:05')
  })
  it('does not pad seconds 10 or over', () => {
    expect(formatTimer(90)).toBe('1:30')
  })
  it('formats 0 seconds', () => {
    expect(formatTimer(0)).toBe('0:00')
  })
  it('returns 0:00 for NaN (duration not loaded yet)', () => {
    expect(formatTimer(NaN)).toBe('0:00')
  })
})
