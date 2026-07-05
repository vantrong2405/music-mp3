import { describe, it, expect } from 'vitest'
import { pickRandomSubset } from './shuffle'

describe('pickRandomSubset', () => {
  it('returns `count` unique indices within [0, poolSize)', () => {
    const result = pickRandomSubset(22, 4, () => 0.999)
    expect(result).toHaveLength(4)
    expect(new Set(result).size).toBe(4)
    result.forEach((i) => {
      expect(i).toBeGreaterThanOrEqual(0)
      expect(i).toBeLessThan(22)
    })
  })

  it('is deterministic given a fixed rng sequence', () => {
    const values = [0.1, 0.5, 0.9, 0.3]
    let call = 0
    const rng = () => values[call++ % values.length]
    const a = pickRandomSubset(22, 4, rng)
    call = 0
    const b = pickRandomSubset(22, 4, rng)
    expect(a).toEqual(b)
  })
})
