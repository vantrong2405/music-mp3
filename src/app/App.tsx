import { PlayerBar } from '../components/music/PlayerBar/PlayerBar'
import { TopSong } from '../components/music/TopSong/TopSong'
import { RecentPlayed } from '../components/music/RecentPlayed/RecentPlayed'
import { ListArtist } from '../components/music/ListArtist/ListArtist'
import { AnotherSong } from '../components/music/AnotherSong/AnotherSong'
import { Header } from '../components/music/Header/Header'

function App() {
  return (
    <div id="allPage" className="relative min-h-screen overflow-hidden bg-[#0F0F23] p-5 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-100 w-100 rounded-full bg-[#4338CA] opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-40 h-100 w-100 rounded-full bg-[#22c55e] opacity-15 blur-3xl"
      />

      <div className="relative flex justify-center gap-5 max-[46.1875em]:flex-col">
        <div className="w-180 rounded-2xl border border-white/10 bg-white/5 p-6.25 shadow-lg backdrop-blur-xl max-[46.1875em]:w-full max-[46.1875em]:p-3.75">
          <Header />
          <TopSong />
          <div className="max-[46.1875em]:hidden">
            <RecentPlayed />
          </div>
        </div>
        <div className="w-70 rounded-2xl border border-white/10 bg-white/5 p-6.25 shadow-lg backdrop-blur-xl max-[46.1875em]:w-full max-[46.1875em]:p-3.75">
          <div className="max-[46.1875em]:hidden">
            <ListArtist />
          </div>
          <AnotherSong />
        </div>
      </div>
      <PlayerBar />
    </div>
  )
}

export default App
