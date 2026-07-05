import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'
import { resolveMediaSrc } from '../../../utils/media'

export function RecentPlayed() {
  const state = usePlayerStore()
  const filtered = songs
    .map((song, globalIndex) => ({ song, globalIndex }))
    .filter(({ song }) => song.artist === state.selectedArtist)

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-white/40 uppercase">Artist shelf</p>
          <h2 className="text-xl font-black text-white">
            {state.mode === 'artist' ? 'Top song of singer' : 'Recent Played'}
          </h2>
        </div>
        <span className="text-sm font-semibold text-white/45">{filtered.length} songs</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-color:#77d970_transparent] [scrollbar-width:thin]">
        {filtered.map(({ song, globalIndex }, position) => (
          <button
            type="button"
            key={song.nameFile}
            className="w-38 shrink-0 cursor-pointer rounded-lg border border-white/8 bg-[#101112] p-2 text-left transition-colors duration-200 hover:bg-white/8 focus:bg-white/8 focus:outline-none"
            onClick={() => state.playArtistSong(globalIndex, position)}
          >
            <img
              className={`aspect-square w-full rounded-md object-cover transition-shadow duration-200 ${
                state.mode === 'artist' && state.artistSongPosition === position
                  ? 'shadow-[0_0_0_3px_rgba(119,217,112,0.7)]'
                  : 'shadow-[0_8px_22px_rgba(0,0,0,0.26)]'
              }`}
              src={resolveMediaSrc(song.img, '/img')}
              alt=""
            />
            <span className="mt-2 block truncate text-sm font-semibold text-[#f4f0e8]">{song.nameSong}</span>
            <span className="block truncate text-xs text-white/45">{song.nameArtist}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
