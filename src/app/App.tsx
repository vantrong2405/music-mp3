import { PlayerBar } from '../components/music/PlayerBar/PlayerBar'
import { TopSong } from '../components/music/TopSong/TopSong'
import { RecentPlayed } from '../components/music/RecentPlayed/RecentPlayed'
import { ListArtist } from '../components/music/ListArtist/ListArtist'
import { AnotherSong } from '../components/music/AnotherSong/AnotherSong'
import { Header } from '../components/music/Header/Header'

function App() {
  return (
    <div id="allPage" className="min-h-screen bg-[#101112] px-4 pt-4 pb-44 text-[#f4f0e8] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_minmax(0,1fr)_320px] gap-4 max-[63.75em]:grid-cols-[190px_minmax(0,1fr)] max-[46.1875em]:grid-cols-1">
        <aside className="rounded-lg border border-white/10 bg-[#181a1b] p-3 max-[46.1875em]:hidden">
          <div className="mb-4 border-b border-white/10 px-2 pb-3">
            <p className="text-xs font-bold tracking-[0.28em] text-[#f5c76b] uppercase">MP3 Studio</p>
            <h1 className="mt-2 text-xl font-black text-white">Vietnam Hits</h1>
          </div>
          <ListArtist />
        </aside>

        <main className="min-w-0 rounded-lg border border-white/10 bg-[#161718] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.26)] max-[46.1875em]:p-3">
          <Header />
          <TopSong />
          <RecentPlayed />
        </main>

        <aside className="rounded-lg border border-white/10 bg-[#181a1b] p-4 max-[63.75em]:col-span-2 max-[46.1875em]:col-span-1">
          <AnotherSong />
        </aside>
      </div>
      <PlayerBar />
    </div>
  )
}

export default App
