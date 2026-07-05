import type { Song } from '../types/song'
import { songs } from './songs'

export const topSongs: Song[] = [
  { ...songs[4], time: '3:22' },
  { ...songs[8], time: '3:24' },
  { ...songs[0], time: '3:21' },
  { ...songs[12], time: '3:54' },
  { ...songs[16], time: '3:14' },
  { ...songs[5], time: '3:36' },
]
