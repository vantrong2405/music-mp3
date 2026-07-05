export type ArtistId = 'taylor' | 'weeknd' | 'dualipa' | 'edsheeran' | 'billie'

export interface Song {
  nameSong: string
  nameArtist: string
  /** relative to /musics/ when previewUrl is absent */
  nameFile: string
  /** official remote audio preview */
  previewUrl?: string
  /** relative to /img/ or absolute artwork URL */
  img: string
  /** present on listSongOf entries, absent on topSong entries */
  artist?: ArtistId
  /** present on topSong entries only, e.g. "4:22" */
  time?: string
}

export interface Artist {
  id: ArtistId
  displayName: string
  /** relative to /img/ or absolute artwork URL */
  avatar: string
  /** static decorative text from the original markup, not computed */
  lastPlayedLabel: string
}
