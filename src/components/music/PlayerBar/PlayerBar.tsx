import { usePlayerEngine } from '../../../hooks/usePlayerEngine'
import { formatTimer } from '../../../utils/formatTimer'

export function PlayerBar() {
  const { state, audioRef, currentSong, next, prev, toggleRandom } = usePlayerEngine()

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = Number(e.target.value)
  }

  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col items-center justify-center border-t border-white/10 bg-[#0F0F23]/80 backdrop-blur-xl">
      <div className="mt-0 flex w-1/2 justify-between max-[46.1875em]:w-full">
        <div className="mt-3.25 ml-2.5 text-white/60">{formatTimer(audioRef.current?.currentTime ?? 0)}</div>
        <input
          type="range"
          step={1}
          className="mt-3.25 h-0.5 w-full"
          value={audioRef.current?.currentTime ?? 0}
          max={audioRef.current?.duration || 0}
          onChange={handleSeek}
        />
        <div className="mt-3.25 mr-2.5 text-white/60">{formatTimer(audioRef.current?.duration ?? 0)}</div>
      </div>

      <audio ref={audioRef} />

      <div className="flex w-full justify-between">
        <div className="ml-5 my-1.25 flex w-75 max-[46.1875em]:mr-1.25 max-[46.1875em]:w-auto">
          <div className="mr-5">
            <img className="h-12.5 w-12.5 rounded-[10px] object-cover" src={`/img/${currentSong.img}`} alt="" />
          </div>
          <div className="max-[46.1875em]:hidden">
            <div className="font-semibold text-[#f8fafc]">{currentSong.nameSong}</div>
            <div className="text-white/50">{currentSong.nameArtist}</div>
          </div>
        </div>

        <div className="mt-2.5 mr-25 flex">
          <div
            data-testid="random"
            aria-label="Toggle shuffle"
            className={`mt-2 mr-8.75 cursor-pointer text-[1.3rem] transition-colors duration-200 ${
              state.isRandom ? 'text-[#22c55e]' : 'text-white/60'
            }`}
            onClick={toggleRandom}
          >
            <i className="fa-solid fa-shuffle" />
          </div>
          <div
            data-testid="back"
            aria-label="Previous"
            className="mt-1.25 cursor-pointer p-0.5 text-[1.4rem] text-white/70 transition-colors duration-200 hover:text-[#f8fafc]"
            onClick={prev}
          >
            <i className="fa-solid fa-backward-fast" />
          </div>
          <div
            data-testid="pause"
            aria-label="Play/Pause"
            className="mx-7.5 cursor-pointer text-[2.1rem] text-[#22c55e] transition-colors duration-200 hover:text-[#4ade80]"
            onClick={() => state.togglePlay()}
          >
            <i className={state.isPlaying ? 'fa-solid fa-circle-pause' : 'fa-solid fa-circle-play'} />
          </div>
          <div
            data-testid="next"
            aria-label="Next"
            className="mt-1.25 cursor-pointer p-0.5 text-[1.4rem] text-white/70 transition-colors duration-200 hover:text-[#f8fafc]"
            onClick={next}
          >
            <i className="fa-solid fa-forward-fast" />
          </div>
          <div
            data-testid="repeat"
            aria-label="Toggle repeat"
            className={`mt-2.25 ml-8.75 cursor-pointer text-[1.3rem] transition-colors duration-200 ${
              state.isRepeat ? 'text-[#22c55e]' : 'text-white/60'
            }`}
            onClick={() => state.toggleRepeat()}
          >
            <i className="fa-solid fa-repeat" />
          </div>
        </div>

        <div className="mt-3.75 mr-2.5 flex max-[46.1875em]:hidden">
          <div
            data-testid="vol-icon"
            aria-label="Toggle mute"
            className="mt-0.75 mr-2.5 cursor-pointer text-[1.2rem] text-white/60"
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
