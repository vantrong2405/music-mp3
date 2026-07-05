import { PlayerBar } from '../components/music/PlayerBar/PlayerBar'
import { TopSong } from '../components/music/TopSong/TopSong'
import { RecentPlayed } from '../components/music/RecentPlayed/RecentPlayed'
import { ListArtist } from '../components/music/ListArtist/ListArtist'

function App() {
  return (
    <div id="allPage" className="mb-20 rounded-[20px] p-5 backdrop-blur-[60px]">
      <div className="flex justify-center">
        <div className="w-180 rounded-[20px] bg-[#efeff8] p-6.25 shadow-[0px_6px_15px_rgba(0,0,0,0.15)]">
          <TopSong />
          <RecentPlayed />
        </div>
        <div className="ml-5">
          <ListArtist />
        </div>
      </div>
      <PlayerBar />
    </div>
  )
}

export default App
