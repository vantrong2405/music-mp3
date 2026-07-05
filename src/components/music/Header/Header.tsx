import { useState } from 'react'
import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'
import { resolveMediaSrc } from '../../../utils/media'

export function Header() {
  const playArtistSong = usePlayerStore((s) => s.playArtistSong)
  const [query, setQuery] = useState('')

  const results =
    query.trim().length === 0
      ? []
      : songs
          .map((song, globalIndex) => ({ song, globalIndex }))
          .filter(
            ({ song }) =>
              song.nameSong.toLowerCase().includes(query.toLowerCase()) ||
              song.nameArtist.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8)

  const handleSelect = (globalIndex: number) => {
    playArtistSong(globalIndex, -1)
    setQuery('')
  }

  return (
    <header className="relative mb-5 flex items-center justify-between gap-4 max-[46.1875em]:flex-col max-[46.1875em]:items-stretch">
      <div>
        <p className="text-xs font-bold tracking-[0.24em] text-[#77d970] uppercase">Now browsing</p>
        <h2 className="mt-1 text-2xl font-black text-white">Music Library</h2>
      </div>

      <div className="flex w-full max-w-95 items-center gap-2 rounded-lg border border-white/10 bg-[#0f1011] px-3 py-2 transition-colors duration-200 focus-within:border-[#77d970]/70 max-[46.1875em]:max-w-none">
        <i className="fa-solid fa-magnifying-glass text-sm text-white/50" />
        <input
          type="text"
          placeholder="Search song or artist"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-none bg-transparent text-sm text-[#f4f0e8] placeholder:text-white/40 outline-none"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full right-0 z-20 mt-2 w-full max-w-95 rounded-lg border border-white/10 bg-[#202224] p-2 shadow-2xl max-[46.1875em]:max-w-none">
          {results.map(({ song, globalIndex }) => (
            <button
              type="button"
              key={song.nameFile}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition-colors duration-200 hover:bg-white/8 focus:bg-white/8 focus:outline-none"
              onClick={() => handleSelect(globalIndex)}
            >
              <img className="h-10 w-10 rounded-md object-cover" src={resolveMediaSrc(song.img, '/img')} alt="" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-[#f4f0e8]">{song.nameSong}</span>
                <span className="text-sm text-white/50">{song.nameArtist}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
