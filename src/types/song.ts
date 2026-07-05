export type ArtistId = 'sontung' | 'amee' | 'dinhdung' | 'ttbinh' | 'ducphuc'

export interface Song {
  nameSong: string
  nameArtist: string
  /** relative to /musics/ */
  nameFile: string
  /** relative to /img/ */
  img: string
  /** present on listSongOf entries, absent on topSong entries */
  artist?: ArtistId
  /** present on topSong entries only, e.g. "4:22" */
  time?: string
}

export interface Artist {
  id: ArtistId
  displayName: string
  /** relative to /img/ */
  avatar: string
  /** static decorative text from the original markup, not computed */
  lastPlayedLabel: string
}
