import type { ArtistId, Song } from '../types/song'

export function selectArtistSongIndices(songs: Song[], artist: ArtistId): number[] {
  return songs.reduce<number[]>((acc, song, index) => {
    if (song.artist === artist) acc.push(index)
    return acc
  }, [])
}
