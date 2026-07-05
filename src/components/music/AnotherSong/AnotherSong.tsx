import { useState } from 'react'
import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'
import { resolveMediaSrc } from '../../../utils/media'

export function AnotherSong() {
  const state = usePlayerStore()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const queueEntries = state.anotherSongPool.map((songIndex, position) => ({ songIndex, position }))
  const displayedEntries = showFavoritesOnly
    ? queueEntries.filter(({ songIndex }) => state.favoriteSongIds.includes(songs[songIndex].nameFile))
    : queueEntries

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-white/40 uppercase">Up next</p>
          <h2 className="text-xl font-black text-white">Queue</h2>
        </div>
        <span className="rounded-md bg-[#2b2416] px-2 py-1 text-xs font-bold text-[#f5c76b]">
          {showFavoritesOnly ? displayedEntries.length : state.anotherSongPool.length}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-[#101112] p-1">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors duration-200 ${
            showFavoritesOnly ? 'text-white/50 hover:bg-white/8' : 'bg-white/10 text-white'
          }`}
          onClick={() => setShowFavoritesOnly(false)}
        >
          All
        </button>
        <button
          type="button"
          data-testid="favorite-filter"
          className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors duration-200 ${
            showFavoritesOnly ? 'bg-[#2b2416] text-[#f5c76b]' : 'text-white/50 hover:bg-white/8'
          }`}
          onClick={() => setShowFavoritesOnly(true)}
        >
          Favorites
        </button>
      </div>

      <div className="flex max-h-[calc(100vh-11rem)] flex-col gap-2 overflow-y-auto pr-1 max-[63.75em]:max-h-80">
        {displayedEntries.map(({ songIndex, position }) => {
          const song = songs[songIndex]
          const isActive = state.mode === 'another' && state.anotherSongPosition === position
          const isFavorite = state.favoriteSongIds.includes(song.nameFile)
          return (
            <div
              key={song.nameFile}
              data-testid="another-song-item"
              className={`flex items-center rounded-lg border p-2 transition-colors duration-200 ${
                isActive ? 'border-[#77d970]/60 bg-white/10' : 'border-white/8 bg-[#101112]'
              }`}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-center text-left focus:outline-none"
                onClick={() => state.playAnotherSong(position)}
              >
                <img
                  className="h-11 w-11 shrink-0 rounded-md object-cover"
                  src={resolveMediaSrc(song.img, '/img')}
                  alt=""
                />
                <span className="ml-3 flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-[#f4f0e8]">{song.nameSong}</span>
                  <span className="truncate text-xs text-white/45">{song.nameArtist}</span>
                </span>
              </button>
              <button
                type="button"
                aria-label={isFavorite ? `Remove ${song.nameSong} from favorites` : `Add ${song.nameSong} to favorites`}
                aria-pressed={isFavorite}
                className={`player-icon-button shrink-0 text-[0.95rem] ${isFavorite ? 'text-[#f5c76b]' : 'text-white/35'}`}
                onClick={() => state.toggleFavorite(song.nameFile)}
              >
                <i className={isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
              </button>
              {isActive ? <img className="ml-2 h-5 w-5 shrink-0" src="/icon/wave.gif" alt="" /> : null}
            </div>
          )
        })}
        {displayedEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/12 bg-[#101112] px-3 py-5 text-center text-sm text-white/45">
            No favorite tracks yet
          </div>
        ) : null}
      </div>
    </section>
  )
}
