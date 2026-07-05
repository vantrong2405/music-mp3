import { usePlayerStore } from '../../../stores/player.store'
import { songs } from '../../../data/songs'

export function AnotherSong() {
  const state = usePlayerStore()

  return (
    <>
      <h3 className="font-heading mt-5 bg-gradient-to-r from-[#f8fafc] to-[#a5b4fc] bg-clip-text text-transparent">
        Another songs
      </h3>
      <div className="max-[46.1875em]:h-62.5 max-[46.1875em]:overflow-scroll">
        {state.anotherSongPool.map((songIndex, position) => {
          const song = songs[songIndex]
          const isActive = state.mode === 'another' && state.anotherSongPosition === position
          return (
            <div
              key={song.nameFile}
              data-testid="another-song-item"
              className={`my-2.5 flex cursor-pointer items-center rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/10 ${
                isActive ? 'border border-[#22c55e]/40 bg-white/10' : ''
              }`}
              onClick={() => state.playAnotherSong(position)}
            >
              <div>
                <img className="h-7.5 w-7.5 rounded-full object-cover" src={`/img/${song.img}`} alt="" />
              </div>
              <div className="ml-2.5 flex flex-col">
                <span className="text-[#f8fafc]">{song.nameSong}</span>
                <div className="flex items-center">
                  <span className="text-[0.9rem] text-white/50">{song.nameArtist}</span>
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
