import { usePlayerEngine } from '../../../hooks/usePlayerEngine'
import { topSongs } from '../../../data/topSongs'

export function TopSong() {
  const { state, currentSong } = usePlayerEngine()

  return (
    <>
      <h2 className="mb-2 text-2xl">Top Song 2022</h2>
      <div className="flex max-[46.1875em]:flex-col max-[46.1875em]:items-center">
        <div>
          <img
            data-testid="top-thumb"
            className={`h-62.5 w-62.5 rounded-[20px] object-cover shadow-[0px_6px_15px_rgba(0,0,0,0.15)] transition-[0.3s] max-[46.1875em]:mb-3.75 ${
              state.mode === 'top' && state.isPlaying ? 'rotate-play' : ''
            }`}
            src={`/img/${currentSong.img}`}
            alt=""
          />
        </div>
        <div className="scrollbar-none ml-5 flex h-62.5 w-full flex-col overflow-y-scroll max-[46.1875em]:ml-0 max-[46.1875em]:h-65">
          {topSongs.map((song, index) => {
            const isActive = state.mode === 'top' && state.topSongIndex === index
            return (
              <div
                key={song.nameFile}
                data-testid="top-song-row"
                className={`mb-1.25 flex cursor-pointer flex-row justify-between rounded-[15px] p-2.5 hover:bg-white ${
                  isActive ? 'bg-white' : ''
                }`}
                onClick={() => state.playTopSong(index)}
              >
                <div className="flex">
                  <div className="mt-2.5 font-bold text-[#c6c7d2]">
                    {isActive ? <img className="h-5 w-5" src="/icon/wave.gif" alt="" /> : index + 1}
                  </div>
                  <div className="mx-3.75 mt-2.5 font-bold">
                    <i className="fa-regular fa-heart" />
                  </div>
                  <div>
                    <div className="font-bold">{song.nameSong}</div>
                    <div className="text-[0.9rem]">{song.nameArtist}</div>
                  </div>
                </div>
                <div className={isActive ? 'text-black' : 'text-[#c4c4d5]'}>{song.time}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
