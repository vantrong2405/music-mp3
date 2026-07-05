import type { Artist } from '../types/song'
import { songs } from './songs'

export const artists: Artist[] = [
  { id: 'taylor', displayName: 'Taylor Swift', avatar: songs[0].img, lastPlayedLabel: '4 Taylor previews' },
  { id: 'weeknd', displayName: 'The Weeknd', avatar: songs[4].img, lastPlayedLabel: '4 Weeknd previews' },
  { id: 'dualipa', displayName: 'Dua Lipa', avatar: songs[8].img, lastPlayedLabel: '4 Dua Lipa previews' },
  { id: 'edsheeran', displayName: 'Ed Sheeran', avatar: songs[12].img, lastPlayedLabel: '4 Ed previews' },
  { id: 'billie', displayName: 'Billie Eilish', avatar: songs[16].img, lastPlayedLabel: '4 Billie previews' },
]
