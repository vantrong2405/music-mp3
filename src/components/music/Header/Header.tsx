import { useState } from 'react'
import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'

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
    <header className="relative flex items-center justify-between">
      <div className="flex w-full max-w-125 items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl transition-colors duration-200 focus-within:border-[#22c55e]/50">
        <i className="fa-solid fa-magnifying-glass text-white/60" />
        <input
          type="text"
          placeholder="Search song or artist"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-none bg-transparent text-[#f8fafc] placeholder:text-white/40 outline-none"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 z-20 mt-2 w-full max-w-125 rounded-2xl border border-white/10 bg-[#1e1b4b]/90 p-2 shadow-lg backdrop-blur-xl">
          {results.map(({ song, globalIndex }) => (
            <div
              key={song.nameFile}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl p-2 transition-colors duration-200 hover:bg-white/10"
              onClick={() => handleSelect(globalIndex)}
            >
              <img className="h-10 w-10 rounded-lg object-cover" src={`/img/${song.img}`} alt="" />
              <div className="flex flex-col">
                <span className="text-[#f8fafc]">{song.nameSong}</span>
                <span className="text-sm text-white/50">{song.nameArtist}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div />
    </header>
  )
}
