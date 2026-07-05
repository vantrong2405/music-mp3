export function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="rounded-[10px] bg-white px-2.5 py-2">
        <i className="fa-regular fa-magnifying-glass" /> <input type="text" placeholder="Start search here" className="border-none outline-none" />
      </div>
      <div />
    </header>
  )
}
