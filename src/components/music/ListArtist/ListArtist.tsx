import { usePlayerStore } from '../../../stores/player.store'
import { artists } from '../../../data/artists'
import { resolveMediaSrc } from '../../../utils/media'

export function ListArtist() {
  const state = usePlayerStore()

  return (
    <section>
      <h2 className="mb-2 px-2 text-xs font-bold tracking-[0.22em] text-white/40 uppercase">Artists</h2>
      <div className="flex flex-col gap-1">
        {artists.map((artist, index) => {
          const isSelected = state.selectedArtistIndex === index
          return (
            <button
              type="button"
              key={artist.id}
              data-testid="artist-row"
              className={`flex min-w-0 cursor-pointer items-center rounded-md border px-2 py-2 text-left transition-colors duration-200 hover:bg-white/8 focus:bg-white/8 focus:outline-none ${
                isSelected ? 'border-[#77d970]/60 bg-white/10' : 'border-transparent'
              }`}
              onClick={() => state.selectArtist(artist.id, index)}
            >
              <img
                className="mr-2 h-9 w-9 shrink-0 rounded-md object-cover"
                src={resolveMediaSrc(artist.avatar, '/img')}
                alt=""
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-[#f4f0e8]">{artist.displayName}</span>
                <span className="truncate text-xs text-white/45">{artist.lastPlayedLabel}</span>
              </span>
              {isSelected ? <img className="ml-2 h-5 w-5 shrink-0" src="/icon/list.gif" alt="" /> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
