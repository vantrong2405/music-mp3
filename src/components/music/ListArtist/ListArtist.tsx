import { usePlayerStore } from '../../../stores/player.store'
import { artists } from '../../../data/artists'

export function ListArtist() {
  const state = usePlayerStore()

  return (
    <>
      <h3 className="mt-10">Recent Singers</h3>
      <div>
        {artists.map((artist, index) => {
          const isSelected = state.selectedArtistIndex === index
          return (
            <div
              key={artist.id}
              data-testid="artist-row"
              className={`my-2.5 flex min-w-50 cursor-pointer rounded-[15px] px-3 py-2.5 hover:bg-white ${
                isSelected ? 'bg-white' : ''
              }`}
              onClick={() => state.selectArtist(artist.id, index)}
            >
              <div className="mt-0.5 mr-2.5">
                <img className="h-7.5 w-7.5 rounded-full object-cover" src={`/img/${artist.avatar}`} alt="" />
              </div>
              <div className="flex flex-col">
                <span>{artist.displayName}</span>
                <span className="text-[0.9rem]">{artist.lastPlayedLabel}</span>
              </div>
              <div className="mt-1.75 ml-3.75">
                {isSelected ? <img className="h-5 w-5" src="/icon/list.gif" alt="" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
