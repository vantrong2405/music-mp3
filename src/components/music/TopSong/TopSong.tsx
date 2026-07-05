import { usePlayerEngine } from '../../../hooks/usePlayerEngine'
import { topSongs } from '../../../data/topSongs'
import { resolveMediaSrc } from '../../../utils/media'

export function TopSong() {
  const { state, currentSong } = usePlayerEngine()

  return (
    <section>
      <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5 max-[46.1875em]:grid-cols-1">
        <div className="rounded-lg border border-white/10 bg-[#202224] p-3">
          <img
            data-testid="top-thumb"
            className={`aspect-square w-full rounded-md object-cover transition-[0.3s] ${
              state.mode === 'top' && state.isPlaying
                ? 'rotate-play shadow-[0_0_0_3px_rgba(119,217,112,0.55)]'
                : 'shadow-[0_10px_30px_rgba(0,0,0,0.32)]'
            }`}
            src={resolveMediaSrc(currentSong.img, '/img')}
            alt=""
          />
          <div className="mt-3">
            <p className="text-xs font-bold tracking-[0.22em] text-[#f5c76b] uppercase">Featured</p>
            <h3 className="mt-1 line-clamp-2 text-xl font-black text-white">Playing: {currentSong.nameSong}</h3>
            <p className="mt-1 text-sm text-white/55">{currentSong.nameArtist}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-white/40 uppercase">Chart</p>
              <h2 className="text-xl font-black text-white">Top Songs</h2>
            </div>
            <span className="rounded-md bg-[#2b2f2d] px-2 py-1 text-xs font-bold text-[#77d970]">
              {topSongs.length} tracks
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {topSongs.map((song, index) => {
              const isActive = state.mode === 'top' && state.topSongIndex === index
              return (
                <button
                  type="button"
                  key={song.nameFile}
                  data-testid="top-song-row"
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors duration-200 hover:bg-white/8 focus:bg-white/8 focus:outline-none ${
                    isActive ? 'border-[#77d970]/60 bg-white/10' : 'border-white/8 bg-[#101112]'
                  }`}
                  onClick={() => state.playTopSong(index)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/7 text-sm font-black text-white/55">
                      {isActive ? <img className="h-5 w-5" src="/icon/wave.gif" alt="" /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-[#f4f0e8]">{song.nameSong}</span>
                      <span className="block truncate text-sm text-white/50">{song.nameArtist}</span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-sm font-bold ${isActive ? 'text-[#77d970]' : 'text-white/40'}`}>
                    {song.time}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
