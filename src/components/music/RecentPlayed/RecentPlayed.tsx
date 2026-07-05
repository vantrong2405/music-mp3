import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'

export function RecentPlayed() {
  const state = usePlayerStore()
  const filtered = songs
    .map((song, globalIndex) => ({ song, globalIndex }))
    .filter(({ song }) => song.artist === state.selectedArtist)

  return (
    <>
      <h3 className="font-heading mt-5 text-[#f8fafc]">
        {state.mode === 'artist' ? 'Top song of singer' : 'Recent Played'}
      </h3>
      <div className="mt-2.5 mb-12.5 flex overflow-x-scroll [scrollbar-color:#4338ca_transparent] [scrollbar-width:thin]">
        {filtered.map(({ song, globalIndex }, position) => (
          <div
            key={song.nameFile}
            className="mb-2.5 w-37.5 cursor-pointer p-1.25"
            onClick={() => state.playArtistSong(globalIndex, position)}
          >
            <div>
              <img
                className={`h-37.5 w-37.5 rounded-2xl object-cover transition-shadow duration-200 ${
                  state.mode === 'artist' && state.artistSongPosition === position
                    ? 'shadow-[0_0_0_2px_#22c55e]'
                    : 'shadow-md'
                }`}
                src={`/img/${song.img}`}
                alt=""
              />
            </div>
            <div className="mx-2.5 my-1.25 text-[0.9rem] font-medium text-[#f8fafc]">{song.nameSong}</div>
          </div>
        ))}
      </div>
    </>
  )
}
