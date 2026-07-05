import { useEffect, useState } from 'react'
import { usePlayerEngine } from '../../../hooks/usePlayerEngine'
import { formatTimer } from '../../../utils/formatTimer'
import { resolveMediaSrc } from '../../../utils/media'

export function PlayerBar() {
  const { state, audioRef, currentSong, next, prev, toggleRandom } = usePlayerEngine()
  const [timeline, setTimeline] = useState({ currentTime: 0, duration: 0 })
  const isCurrentFavorite = state.favoriteSongIds.includes(currentSong.nameFile)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncTimeline = () => {
      setTimeline({
        currentTime: audio.currentTime || 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      })
    }

    syncTimeline()
    audio.addEventListener('timeupdate', syncTimeline)
    audio.addEventListener('loadedmetadata', syncTimeline)
    audio.addEventListener('durationchange', syncTimeline)

    return () => {
      audio.removeEventListener('timeupdate', syncTimeline)
      audio.removeEventListener('loadedmetadata', syncTimeline)
      audio.removeEventListener('durationchange', syncTimeline)
    }
  }, [audioRef, currentSong])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const nextTime = Number(e.target.value)
    if (audio) audio.currentTime = nextTime
    setTimeline((current) => ({ ...current, currentTime: nextTime }))
  }

  return (
    <footer className="fixed bottom-0 left-0 z-30 w-full border-t border-white/10 bg-[#101112]/95 px-4 py-3 text-[#f4f0e8] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-[1fr_minmax(260px,520px)_1fr] items-center gap-4 max-[46.1875em]:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 items-center">
            <img
              className="h-13 w-13 shrink-0 rounded-md object-cover"
              src={resolveMediaSrc(currentSong.img, '/img')}
              alt=""
            />
            <div className="ml-3 min-w-0">
              <div className="truncate font-bold text-white">{currentSong.nameSong}</div>
              <div className="truncate text-sm text-white/50">{currentSong.nameArtist}</div>
            </div>
            <button
              type="button"
              data-testid="favorite-current"
              aria-label={isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isCurrentFavorite}
              className={`player-icon-button ml-2 shrink-0 text-[1rem] ${
                isCurrentFavorite ? 'text-[#f5c76b]' : 'text-white/45'
              }`}
              onClick={() => state.toggleFavorite(currentSong.nameFile)}
            >
              <i className={isCurrentFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
            </button>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2 max-[46.1875em]:order-3 max-[46.1875em]:col-span-2">
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                data-testid="random"
                aria-label="Toggle shuffle"
                className={`player-icon-button text-[1rem] ${
                  state.isRandom ? 'text-[#77d970]' : 'text-white/58'
                }`}
                onClick={toggleRandom}
              >
                <i className="fa-solid fa-shuffle" />
              </button>
              <button
                type="button"
                data-testid="back"
                aria-label="Previous"
                className="player-icon-button text-[1.05rem] text-white/70 hover:text-white"
                onClick={prev}
              >
                <i className="fa-solid fa-backward-fast" />
              </button>
              <button
                type="button"
                data-testid="pause"
                aria-label="Play/Pause"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-[#77d970] text-[1.55rem] text-[#101112] transition-colors duration-200 hover:bg-[#8dea86] focus:outline-none focus:ring-2 focus:ring-[#77d970]/70 focus:ring-offset-2 focus:ring-offset-[#101112]"
                onClick={() => state.togglePlay()}
              >
                <i className={state.isPlaying ? 'fa-solid fa-circle-pause' : 'fa-solid fa-circle-play'} />
              </button>
              <button
                type="button"
                data-testid="next"
                aria-label="Next"
                className="player-icon-button text-[1.05rem] text-white/70 hover:text-white"
                onClick={next}
              >
                <i className="fa-solid fa-forward-fast" />
              </button>
              <button
                type="button"
                data-testid="repeat"
                aria-label="Toggle repeat"
                className={`player-icon-button text-[1rem] ${
                  state.isRepeat ? 'text-[#77d970]' : 'text-white/58'
                }`}
                onClick={() => state.toggleRepeat()}
              >
                <i className="fa-solid fa-repeat" />
              </button>
            </div>

            <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 text-xs text-white/50">
              <div className="text-right tabular-nums">{formatTimer(timeline.currentTime)}</div>
              <input
                type="range"
                step={1}
                className="h-1 w-full"
                value={timeline.currentTime}
                max={timeline.duration}
                onChange={handleSeek}
              />
              <div className="tabular-nums">{formatTimer(timeline.duration)}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 max-[46.1875em]:hidden">
            <button
              type="button"
              data-testid="vol-icon"
              aria-label="Toggle mute"
              className="player-icon-button text-[1rem] text-white/58 hover:text-white"
              onClick={() => state.toggleMute()}
            >
              <i className={state.isMuted ? 'fa-solid fa-volume-slash' : 'fa-solid fa-volume-high'} />
            </button>
            <input
              type="range"
              className="w-28"
              value={state.volume}
              onChange={(e) => state.setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} />
    </footer>
  )
}
