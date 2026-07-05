import { usePlayerEngine } from '../../../hooks/usePlayerEngine'
import { formatTimer } from '../../../utils/formatTimer'
import { topSongs } from '../../../data/topSongs'

export function PlayerBar() {
  const { state, audioRef, currentSong } = usePlayerEngine()

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = Number(e.target.value)
  }

  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col items-center justify-center bg-linear-to-r from-[rgba(225,237,250,1)] to-[rgba(247,238,242,1)]">
      <div className="mt-0 flex w-1/2 justify-between">
        <div className="mt-3.25 ml-2.5">{formatTimer(audioRef.current?.currentTime ?? 0)}</div>
        <input
          type="range"
          step={1}
          className="mt-3.25 h-0.5 w-full"
          value={audioRef.current?.currentTime ?? 0}
          max={audioRef.current?.duration || 0}
          onChange={handleSeek}
        />
        <div className="mt-3.25 mr-2.5">{formatTimer(audioRef.current?.duration ?? 0)}</div>
      </div>

      <audio ref={audioRef} />

      <div className="flex w-full justify-between">
        <div className="ml-5 my-1.25 flex w-75">
          <div className="mr-5">
            <img className="h-12.5 w-12.5 rounded-[10px] object-cover" src={`/img/${currentSong.img}`} alt="" />
          </div>
          <div>
            <div className="font-bold">{currentSong.nameSong}</div>
            <div>{currentSong.nameArtist}</div>
          </div>
        </div>

        <div className="mt-2.5 mr-25 flex">
          <div className="mt-2 mr-8.75 text-[1.3rem]" style={{ color: state.isRandom ? 'green' : 'black' }}>
            <i className="fa-light fa-shuffle" />
          </div>
          <div
            data-testid="back"
            className="mt-1.25 cursor-pointer p-0.5 text-[1.4rem] text-[#3e4042]"
            onClick={() => state.prevTopSong(topSongs.length)}
          >
            <i className="fa-solid fa-backward-fast" />
          </div>
          <div
            data-testid="pause"
            className="mx-7.5 cursor-pointer text-[2.1rem]"
            style={{ color: 'rgb(5, 165, 67)' }}
            onClick={() => state.togglePlay()}
          >
            <i className={state.isPlaying ? 'fa-sharp fa-solid fa-circle-pause' : 'fa-solid fa-circle-play'} />
          </div>
          <div
            data-testid="next"
            className="mt-1.25 cursor-pointer p-0.5 text-[1.4rem] text-[#3e4042]"
            onClick={() => state.nextTopSong(topSongs.length)}
          >
            <i className="fa-solid fa-forward-fast" />
          </div>
          <div
            data-testid="repeat"
            className="mt-2.25 ml-8.75 cursor-pointer text-[1.3rem]"
            style={{ color: state.isRepeat ? 'green' : 'black' }}
            onClick={() => state.toggleRepeat()}
          >
            <i className="fa-light fa-arrows-repeat" />
          </div>
        </div>

        <div className="mt-3.75 mr-2.5 flex">
          <div
            data-testid="vol-icon"
            className="mt-0.75 mr-2.5 cursor-pointer text-[1.2rem]"
            onClick={() => state.toggleMute()}
          >
            <i className={state.isMuted ? 'fa-solid fa-volume-slash' : 'fa-solid fa-volume-high'} />
          </div>
          <div>
            <input
              type="range"
              value={state.volume}
              onChange={(e) => state.setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
