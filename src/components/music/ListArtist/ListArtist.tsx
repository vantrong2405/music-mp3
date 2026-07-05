import { usePlayerStore } from '../../../stores/player.store'
import { artists } from '../../../data/artists'

export function ListArtist() {
  const state = usePlayerStore()

  return (
    <>
      <h3 className="font-heading mt-10 bg-gradient-to-r from-[#f8fafc] to-[#a5b4fc] bg-clip-text text-transparent">
        Recent Singers
      </h3>
      <div>
        {artists.map((artist, index) => {
          const isSelected = state.selectedArtistIndex === index
          return (
            <div
              key={artist.id}
              data-testid="artist-row"
              className={`my-2.5 flex min-w-50 cursor-pointer items-center rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/10 ${
                isSelected ? 'border border-[#4338ca]/50 bg-white/10' : ''
              }`}
              onClick={() => state.selectArtist(artist.id, index)}
            >
              <div className="mr-2.5">
                <img className="h-7.5 w-7.5 rounded-full object-cover" src={`/img/${artist.avatar}`} alt="" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#f8fafc]">{artist.displayName}</span>
                <span className="text-[0.9rem] text-white/50">{artist.lastPlayedLabel}</span>
              </div>
              <div className="ml-3.75">
                {isSelected ? <img className="h-5 w-5" src="/icon/list.gif" alt="" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
