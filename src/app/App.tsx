import { PlayerBar } from '../components/music/PlayerBar/PlayerBar'

function App() {
  return (
    <div id="allPage" className="rounded-[20px] p-5 backdrop-blur-[60px] mb-20">
      <div className="flex justify-center">{/* LeftBar, container, rightBar added in later tasks */}</div>
      <PlayerBar />
    </div>
  )
}

export default App
