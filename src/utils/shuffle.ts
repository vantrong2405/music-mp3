export function pickRandomSubset(poolSize: number, count: number, rng: () => number = Math.random): number[] {
  const picked: number[] = []
  while (picked.length < count) {
    const candidate = Math.floor(rng() * poolSize)
    if (!picked.includes(candidate)) picked.push(candidate)
  }
  return picked
}
