import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'

export function AnotherSong() {
  const state = usePlayerStore()

  return (
    <>
      <h3 className="mt-5">Another songs</h3>
      <div className="max-[46.1875em]:h-62.5 max-[46.1875em]:overflow-scroll">
        {state.anotherSongPool.map((songIndex, position) => {
          const song = songs[songIndex]
          const isActive = state.mode === 'another' && state.anotherSongPosition === position
          return (
            <div
              key={song.nameFile}
              data-testid="another-song-item"
              className={`my-2.5 flex cursor-pointer rounded-[15px] px-3 py-2.5 hover:bg-white ${
                isActive ? 'bg-white' : ''
              }`}
              onClick={() => state.playAnotherSong(position)}
            >
              <div>
                <img className="mt-0.5 h-7.5 w-7.5 rounded-full object-cover" src={`/img/${song.img}`} alt="" />
              </div>
              <div className="flex flex-col">
                <span>{song.nameSong}</span>
                <div className="flex">
                  <span className="text-[0.9rem]">{song.nameArtist}</span>
                  <div className="ml-2.5">
                    {isActive ? <img className="h-5 w-5" src="/icon/wave.gif" alt="" /> : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
