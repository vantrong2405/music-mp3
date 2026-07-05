import type { ArtistId } from './song'

export type PlayMode = 'top' | 'artist' | 'another'

export interface PlayerState {
  mode: PlayMode
  topSongIndex: number
  selectedArtist: ArtistId
  selectedArtistIndex: number
  /** index into songs[] currently playing in artist mode */
  artistSongGlobalIndex: number
  /** position within that artist's filtered song list */
  artistSongPosition: number
  /** indices into songs[], the "Another songs" widget pool */
  anotherSongPool: number[]
  anotherSongPosition: number
  isPlaying: boolean
  isRepeat: boolean
  isRandom: boolean
  /** shuffled indices into songs[], whole-catalog random queue */
  randomQueue: number[]
  randomPosition: number
  volume: number
  isMuted: boolean
  isMobile: boolean
  favoriteSongIds: string[]
}

export const initialPlayerState: PlayerState = {
  mode: 'top',
  topSongIndex: 0,
  selectedArtist: 'taylor',
  selectedArtistIndex: 0,
  artistSongGlobalIndex: 0,
  artistSongPosition: 0,
  anotherSongPool: [],
  anotherSongPosition: 0,
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  randomQueue: [],
  randomPosition: 0,
  volume: 100,
  isMuted: false,
  isMobile: false,
  favoriteSongIds: [],
}
