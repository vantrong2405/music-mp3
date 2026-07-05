export function LeftBar() {
  return (
    <div className="mr-8.75">
      <h3 className="my-2.5">
        <i className="fa-solid fa-align-left" /> MUSIC PAGE
      </h3>
      <div>
        <span className="text-[#5f5f5f]">Recommend</span>
        <ul className="list-none">
          <li className="my-5 cursor-pointer hover:font-semibold hover:text-[#895dd9]">For you</li>
          <li className="my-5 cursor-pointer hover:font-semibold hover:text-[#895dd9]">Library</li>
          <li className="my-5 cursor-pointer hover:font-semibold hover:text-[#895dd9]">Radio Station</li>
          <li className="my-5 cursor-pointer hover:font-semibold hover:text-[#895dd9]">Music Video</li>
        </ul>
      </div>
      <div>
        <span className="text-[#5f5f5f]">My music</span>
        <ul className="list-none">
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Liked song</li>
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Album</li>
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Artist</li>
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Recent</li>
        </ul>
      </div>
      <div>
        <span className="text-[#5f5f5f]">Playlist</span>
        <ul className="list-none">
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Hip-hop</li>
          <li className="my-5 cursor-pointer hover:text-[#895dd9]">Jazz</li>
        </ul>
      </div>
    </div>
  )
}
