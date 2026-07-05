import { PlayerBar } from '../components/music/PlayerBar/PlayerBar'
import { TopSong } from '../components/music/TopSong/TopSong'
import { RecentPlayed } from '../components/music/RecentPlayed/RecentPlayed'
import { ListArtist } from '../components/music/ListArtist/ListArtist'
import { AnotherSong } from '../components/music/AnotherSong/AnotherSong'
import { LeftBar } from '../components/music/LeftBar/LeftBar'
import { Header } from '../components/music/Header/Header'

function App() {
  return (
    <div id="allPage" className="mb-20 rounded-[20px] p-5 backdrop-blur-[60px]">
      <div className="flex justify-center max-[46.1875em]:flex-col max-[46.1875em]:pr-7.5">
        <div className="max-[46.1875em]:hidden">
          <LeftBar />
        </div>
        <div className="w-180 rounded-[20px] bg-[#efeff8] p-6.25 shadow-[0px_6px_15px_rgba(0,0,0,0.15)] max-[46.1875em]:w-full max-[46.1875em]:p-3.75">
          <Header />
          <TopSong />
          <div className="max-[46.1875em]:hidden">
            <RecentPlayed />
          </div>
        </div>
        <div className="ml-5">
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
