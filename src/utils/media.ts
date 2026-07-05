const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

/**
 * Resolve either an absolute media URL or a path under a public asset folder.
 * @param assetPath media URL or path relative to the public folder prefix
 * @param publicPrefix public folder prefix such as /img or /musics
 * @returns browser-ready media source URL
 */
export function resolveMediaSrc(assetPath: string, publicPrefix: '/img' | '/musics') {
  if (ABSOLUTE_URL_PATTERN.test(assetPath)) return assetPath
  return `${publicPrefix}/${assetPath}`
}

/**
 * Resolve the playable source for a song, preferring its official preview URL.
 * @param song song-like object with a local file fallback and optional preview URL
 * @returns browser-ready audio source URL
 */
export function resolveSongAudioSrc(song: { nameFile: string; previewUrl?: string }) {
  return resolveMediaSrc(song.previewUrl ?? song.nameFile, '/musics')
}
