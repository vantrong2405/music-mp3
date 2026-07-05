# Musicpage → React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the vanilla HTML/CSS/JS music player at `../musicpage` into `music-mp3` (Vite + React 19 + TypeScript), feature by feature, with identical UI/behavior and unit tests written before implementation.

**Architecture:** All player state (which song is playing, which of the 3 play-modes is active, repeat/random/volume/mute) lives in one pure reducer (`src/player/reducer.ts`) fully unit-testable without a DOM. A thin hook (`usePlayerEngine`) wires that reducer to a real `<audio>` element via a ref and native media events. A React Context exposes the engine to every component. Presentational components (`PlayerBar`, `TopSong`, `ListArtist`, `RecentPlayed`, `AnotherSong`, `LeftBar`, `Header`) consume the context and reuse the original CSS classes/markup shape verbatim so the UI stays pixel-identical.

**Tech Stack:** Vite, React 19, TypeScript, Vitest + jsdom + @testing-library/react (already partially installed) for TDD.

## Global Constraints

- Source of truth for behavior/markup: `../musicpage/index.html`, `../musicpage/main.js`, `../musicpage/style.css` (`listsong.js` is empty — ignore it).
- CSS is copied verbatim into `src/style.css` and imported once in `main.tsx`. Do not rewrite selectors — components must reuse the exact original class names so this file applies unchanged.
- Images/audio are copied byte-for-byte from `musicpage/img`, `musicpage/musics`, `musicpage/icon` into `music-mp3/public/` (same relative paths) — never re-encoded or renamed.
- **TDD mandatory**: every reducer case and every component gets a failing test written first (Vitest for pure logic, @testing-library/react for components), then the minimal implementation, per `superpowers:test-driven-development`.
- **Vertical slicing**: each task below ships one complete, independently playable/testable feature (reducer logic + component + tests + manual browser check together) — never "all reducer cases" then "all components" as separate passes.
- Decisions made on the 2 original quirks raised with the user:
  - **Mobile detection**: use `window.matchMedia('(max-width: 46.1875em)')` (viewport width), not `screen.width` (physical monitor resolution) as the original did — matches the existing CSS breakpoint's intent.
  - **Song-end detection**: use the native `<audio>` `ended` event instead of polling `currentTime == duration` by exact equality — same visible behavior (auto-advance to next track), just reliable instead of flaky.
  - Everything else (index math, artist ordering, "X minutes ago" static labels, non-functional search box, volume default 0–100) is ported bug-for-bug/behavior-for-behavior. If a future task finds another place where original intent is ambiguous, stop and ask — don't silently "improve."
- No backend/API. No new runtime dependencies beyond what's listed in Task 0.

---

## File Structure

```
music-mp3/
├── public/
│   ├── img/<artist>/*.{jpg,webp,jfif}     ← copied from musicpage/img
│   ├── musics/<artist>/*.mp3              ← copied from musicpage/musics
│   └── icon/{wave,list}.gif               ← copied from musicpage/icon
├── src/
│   ├── data/
│   │   ├── types.ts            (Song, Artist, ArtistId)
│   │   ├── topSongs.ts         (topSong[] port)
│   │   ├── songs.ts            (listSongOf[] port)
│   │   └── artists.ts          (5 artists, order + labels from original rightBar markup)
│   ├── utils/
│   │   ├── formatTimer.ts
│   │   └── formatTimer.test.ts
│   ├── player/
│   │   ├── types.ts            (PlayerState, PlayerAction)
│   │   ├── reducer.ts          (pure state machine — grows task by task)
│   │   ├── reducer.test.ts     (grows task by task)
│   │   ├── usePlayerEngine.ts  (useReducer + <audio> side effects)
│   │   ├── usePlayerEngine.test.tsx
│   │   └── PlayerContext.tsx   (Provider + usePlayer() consumer hook)
│   ├── components/
│   │   ├── PlayerBar/{PlayerBar.tsx,PlayerBar.test.tsx}
│   │   ├── TopSong/{TopSong.tsx,TopSong.test.tsx}
│   │   ├── ListArtist/{ListArtist.tsx,ListArtist.test.tsx}
│   │   ├── RecentPlayed/{RecentPlayed.tsx,RecentPlayed.test.tsx}
│   │   ├── AnotherSong/{AnotherSong.tsx,AnotherSong.test.tsx}
│   │   ├── LeftBar/LeftBar.tsx
│   │   └── Header/Header.tsx
│   ├── style.css               (verbatim copy of musicpage/style.css)
│   ├── App.tsx                 (composition root — replaces Vite scaffold)
│   ├── main.tsx                (imports style.css)
│   └── test/setup.ts           (jest-dom matchers, audio mocks)
├── vite.config.ts              (adds `test` block)
└── package.json                (adds `test` script + vitest/jsdom deps)
```

---

## Task 0: Test infrastructure

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: `npm run test` (Vitest, jsdom env, jest-dom matchers loaded, `HTMLMediaElement.prototype.play/pause/load` mocked so components using `<audio>` don't throw "not implemented" in jsdom).

- [ ] **Step 1: Install missing test dependencies**

```bash
npm install --save-dev vitest jsdom @testing-library/jest-dom
```

- [ ] **Step 2: Add test script to `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Add Vitest config to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement real media playback — stub the calls our
// components/hooks invoke so tests don't throw "not implemented".
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => {},
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: () => {},
})
```

- [ ] **Step 5: Add `tsconfig.app.json` test types + verify**

Add `"vitest/globals"` to the `types` array in `tsconfig.app.json` (alongside existing `"vite/client"`), then run:

```bash
npm run test
```

Expected: `No test files found` (not an error) — confirms Vitest boots under jsdom with no test files yet.

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.ts tsconfig.app.json src/test/setup.ts
git commit -m "test: set up vitest + jsdom + testing-library"
```

---

## Task 1: Foundation — data, types, formatTimer, CSS/assets, minimal playable PlayerBar

Smallest vertical slice that is a genuinely playable feature: one hardcoded song, play/pause, seek, volume, mute, timer display — end to end.

**Files:**
- Create: `src/data/types.ts`, `src/data/topSongs.ts`, `src/data/songs.ts`, `src/data/artists.ts`
- Create: `src/utils/formatTimer.ts`, `src/utils/formatTimer.test.ts`
- Create: `src/player/types.ts`, `src/player/reducer.ts`, `src/player/reducer.test.ts`
- Create: `src/player/usePlayerEngine.ts`, `src/player/PlayerContext.tsx`
- Create: `src/components/PlayerBar/PlayerBar.tsx`, `src/components/PlayerBar/PlayerBar.test.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/style.css` (new, copied), `index.html`
- Copy: `../musicpage/img` → `public/img`, `../musicpage/musics` → `public/musics`, `../musicpage/icon` → `public/icon`

**Interfaces:**
- Produces: `Song { nameSong: string; nameArtist: string; nameFile: string; img: string; artist?: ArtistId; time?: string }`
- Produces: `Artist { id: ArtistId; displayName: string; avatar: string; lastPlayedLabel: string }`
- Produces: `formatTimer(totalSeconds: number): string`
- Produces: `PlayerState`, `PlayerAction` (full shape below — later tasks add reducer *cases*, not new fields)
- Produces: `usePlayer()` hook returning `{ state, dispatch, audioRef }` — later tasks import this in every other component.

### Step 1: Copy assets (no test needed — byte-for-byte copy)

```bash
cp -R /Users/trong.doan/Documents/my-project/musicpage/img /Users/trong.doan/Documents/my-project/music-mp3/public/img
cp -R /Users/trong.doan/Documents/my-project/musicpage/musics /Users/trong.doan/Documents/my-project/music-mp3/public/musics
cp -R /Users/trong.doan/Documents/my-project/musicpage/icon /Users/trong.doan/Documents/my-project/music-mp3/public/icon
cp /Users/trong.doan/Documents/my-project/musicpage/style.css /Users/trong.doan/Documents/my-project/music-mp3/src/style.css
```

- [ ] **Step 2: Remove Vite scaffold leftovers**

```bash
rm /Users/trong.doan/Documents/my-project/music-mp3/src/App.css
rm -rf /Users/trong.doan/Documents/my-project/music-mp3/src/assets
```

- [ ] **Step 3: Update `index.html` head (CDN fonts/icons, title — ported from musicpage)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.1.2/css/all.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400&display=swap" rel="stylesheet" />
    <title>Music Page Cute</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `src/data/types.ts`**

```ts
export type ArtistId = 'sontung' | 'amee' | 'dinhdung' | 'ttbinh' | 'ducphuc'

export interface Song {
  nameSong: string
  nameArtist: string
  /** relative to /musics/ */
  nameFile: string
  /** relative to /img/ */
  img: string
  /** present on listSongOf entries, absent on topSong entries */
  artist?: ArtistId
  /** present on topSong entries only, e.g. "4:22" */
  time?: string
}

export interface Artist {
  id: ArtistId
  displayName: string
  /** relative to /img/ */
  avatar: string
  /** static decorative text from the original markup, not computed */
  lastPlayedLabel: string
}
```

- [ ] **Step 5: Write `src/data/topSongs.ts`** (ported verbatim from `musicpage/main.js` `topSong` array)

```ts
import type { Song } from './types'

export const topSongs: Song[] = [
  { nameSong: 'Anh sai rồi', nameArtist: 'Sơn Tùng', nameFile: 'sontung/asairoi.mp3', time: '4:22', img: 'sontung/asairoi.jpg' },
  { nameSong: 'Nàng thơ', nameArtist: 'Amee', nameFile: 'amee/nangtho.mp3', time: '4:22', img: 'amee/nangtho.webp' },
  { nameSong: 'Đế vương', nameArtist: 'Đình Dũng', nameFile: 'dinhdung/devuong.mp3', time: '4:22', img: 'dinhdung/devuong.jpg' },
  { nameSong: 'Khuôn mặt đáng thương', nameArtist: 'Sơn Tùng', nameFile: 'sontung/khuonmatdangthuong.mp3', time: '4:10', img: 'sontung/khuonmatdangthuong.webp' },
  { nameSong: 'Shay nắng', nameArtist: 'Amee', nameFile: 'amee/shaynang.mp3', time: '3:28', img: 'amee/shaynang.jpg' },
  { nameSong: 'Năm ấy', nameArtist: 'Đức phúc', nameFile: 'ducphuc/namay.mp3', time: '4:20', img: 'ducphuc/namay.jpg' },
]
```

- [ ] **Step 6: Write `src/data/songs.ts`** (ported verbatim from `musicpage/main.js` `listSongOf` array — 22 entries)

```ts
import type { Song } from './types'

export const songs: Song[] = [
  { nameSong: 'Khuôn mặt đáng thương', nameArtist: 'Sơn Tùng mtp', nameFile: 'sontung/khuonmatdangthuong.mp3', img: 'sontung/khuonmatdangthuong.webp', artist: 'sontung' },
  { nameSong: 'Anh sai rồi', nameArtist: 'Sơn Tùng MTP', nameFile: 'sontung/asairoi.mp3', img: 'sontung/asairoi.jpg', artist: 'sontung' },
  { nameSong: 'Em của ngày hôm qua', nameArtist: 'Sơn Tùng MTP', nameFile: 'sontung/emcuangayhomqua.mp3', img: 'sontung/emcuangayhomqua.webp', artist: 'sontung' },
  { nameSong: 'Lạc trôi', nameArtist: 'Sơn Tùng MTP', nameFile: 'sontung/lactroi.mp3', img: 'sontung/lactroi.jpg', artist: 'sontung' },
  { nameSong: 'Nắng ấm xa dần', nameArtist: 'Sơn Tùng MTP', nameFile: 'sontung/nangamxadan.mp3', img: 'sontung/nangamxadan.jfif', artist: 'sontung' },
  { nameSong: 'Hãy trao cho anh', nameArtist: 'Sơn Tùng MTP', nameFile: 'sontung/haytraochoanh.mp3', img: 'sontung/haytraochoanh.jpg', artist: 'sontung' },
  { nameSong: 'Nàng thơ', nameArtist: 'Amee', nameFile: 'amee/nangtho.mp3', img: 'amee/nangtho.webp', artist: 'amee' },
  { nameSong: 'Nói hoặc không nói', nameArtist: 'Amee', nameFile: 'amee/noihoackhongnoi.mp3', img: 'amee/noihoackhongnoi.jpg', artist: 'amee' },
  { nameSong: 'Shay nắng', nameArtist: 'Amee', nameFile: 'amee/shaynang.mp3', img: 'amee/shaynang.jpg', artist: 'amee' },
  { nameSong: 'Thay mọi cô gái yêu anh', nameArtist: 'Amee', nameFile: 'amee/thaymoicogaiiuanh.mp3', img: 'amee/thaymoicogaiiuanh.jpg', artist: 'amee' },
  { nameSong: 'Sao ta ngược lối', nameArtist: 'Đình dũng', nameFile: 'dinhdung/saotanguocloi.mp3', img: 'dinhdung/saotanguocloi.jpg', artist: 'dinhdung' },
  { nameSong: 'Câu hẹn câu thề', nameArtist: 'Đình dũng', nameFile: 'dinhdung/cauhencauthe.mp3', img: 'dinhdung/cauhencauthe.jpg', artist: 'dinhdung' },
  { nameSong: 'Đừng hẹn kiếp sau', nameArtist: 'Đình dũng', nameFile: 'dinhdung/dunghenkiepsau.mp3', img: 'dinhdung/dunghenkiepsau.jfif', artist: 'dinhdung' },
  { nameSong: 'Đế vương', nameArtist: 'Đình Dũng', nameFile: 'dinhdung/devuong.mp3', img: 'dinhdung/devuong.jpg', artist: 'dinhdung' },
  { nameSong: 'Khác biệt to lớn', nameArtist: 'Trịnh Thăng Bình', nameFile: 'ttbinh/khacbiettolon.mp3', img: 'ttbinh/khacbiettolon.jpg', artist: 'ttbinh' },
  { nameSong: 'Vỡ tan', nameArtist: 'Trịnh Thăng Bình', nameFile: 'ttbinh/votan.mp3', img: 'ttbinh/votan.jpg', artist: 'ttbinh' },
  { nameSong: 'Người ấy', nameArtist: 'Trịnh Thăng Bình', nameFile: 'ttbinh/nguoiay.mp3', img: 'ttbinh/nguoiay.jpg', artist: 'ttbinh' },
  { nameSong: 'Em ngủ chưa', nameArtist: 'Trịnh Thăng Bình', nameFile: 'ttbinh/emnguchua.mp3', img: 'ttbinh/emnguchua.jpg', artist: 'ttbinh' },
  { nameSong: 'Trái đất đẹp nhất khi có em', nameArtist: 'Đức phúc', nameFile: 'ducphuc/traidatdepnhatkhicoem.mp3', img: 'ducphuc/traidatdepnhatkhicoem.jfif', artist: 'ducphuc' },
  { nameSong: 'Năm ấy', nameArtist: 'Đức phúc', nameFile: 'ducphuc/namay.mp3', img: 'ducphuc/namay.jpg', artist: 'ducphuc' },
  { nameSong: 'Ngày đầu tiên', nameArtist: 'Đức phúc', nameFile: 'ducphuc/ngaydautien.mp3', img: 'ducphuc/ngaydautien.jpg', artist: 'ducphuc' },
  { nameSong: 'Gửi ngàn lời yêu', nameArtist: 'Đức phúc', nameFile: 'ducphuc/guinganloiyeu.mp3', img: 'ducphuc/guinganloiyeu.jpg', artist: 'ducphuc' },
]
```

- [ ] **Step 7: Write `src/data/artists.ts`** (ported from the static `rightBar` `listArtist_item` markup — order and labels are decorative/hardcoded in the original, kept as-is)

```ts
import type { Artist } from './types'

export const artists: Artist[] = [
  { id: 'sontung', displayName: 'Sơn Tùng', avatar: 'sontung/ava.jpg', lastPlayedLabel: '3 minutes ago' },
  { id: 'amee', displayName: 'AMEE', avatar: 'amee/ava.webp', lastPlayedLabel: '1 minutes ago' },
  { id: 'dinhdung', displayName: 'Đình Dũng', avatar: 'dinhdung/ava.jpg', lastPlayedLabel: '4 minutes ago' },
  { id: 'ttbinh', displayName: 'Trịnh Thăng Bình', avatar: 'ttbinh/ava.jpg', lastPlayedLabel: '2 minutes ago' },
  { id: 'ducphuc', displayName: 'Đức Phúc', avatar: 'ducphuc/ava.jpg', lastPlayedLabel: '6 minutes ago' },
]
```

- [ ] **Step 8: Write failing test `src/utils/formatTimer.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { formatTimer } from './formatTimer'

describe('formatTimer', () => {
  it('pads seconds under 10 with a leading zero', () => {
    expect(formatTimer(65)).toBe('1:05')
  })
  it('does not pad seconds 10 or over', () => {
    expect(formatTimer(90)).toBe('1:30')
  })
  it('formats 0 seconds', () => {
    expect(formatTimer(0)).toBe('0:00')
  })
  it('returns 0:00 for NaN (duration not loaded yet)', () => {
    expect(formatTimer(NaN)).toBe('0:00')
  })
})
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npm run test -- formatTimer`
Expected: FAIL — `formatTimer` is not defined / module has no export.

- [ ] **Step 10: Implement `src/utils/formatTimer.ts`**

```ts
export function formatTimer(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds - minutes * 60)
  return seconds < 10 ? `${minutes}:0${seconds}` : `${minutes}:${seconds}`
}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm run test -- formatTimer`
Expected: PASS (4/4)

- [ ] **Step 12: Write `src/player/types.ts`** (full shape — later tasks only add reducer *cases*, this file is written once)

```ts
import type { ArtistId } from '../data/types'

export type PlayMode = 'top' | 'artist' | 'another'

export interface PlayerState {
  mode: PlayMode
  topSongIndex: number
  selectedArtist: ArtistId
  selectedArtistIndex: number
  /** index into songs[] currently playing in artist mode */
  artistSongGlobalIndex: number
  /** position within that artist's filtered song list */
  artistSongPosition: number
  /** indices into songs[], the "Another songs" widget pool */
  anotherSongPool: number[]
  anotherSongPosition: number
  isPlaying: boolean
  isRepeat: boolean
  isRandom: boolean
  /** shuffled indices into songs[], whole-catalog random queue */
  randomQueue: number[]
  randomPosition: number
  volume: number
  isMuted: boolean
  isMobile: boolean
}

export type PlayerAction =
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_MOBILE'; isMobile: boolean }
  | { type: 'PLAY_TOP_SONG'; index: number }

export const initialPlayerState: PlayerState = {
  mode: 'top',
  topSongIndex: 0,
  selectedArtist: 'sontung',
  selectedArtistIndex: 0,
  artistSongGlobalIndex: 0,
  artistSongPosition: 0,
  anotherSongPool: [],
  anotherSongPosition: 0,
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  randomQueue: [],
  randomPosition: 0,
  volume: 100,
  isMuted: false,
  isMobile: false,
}
```

> Remaining action types (`NEXT_TOP_SONG`, `SELECT_ARTIST`, `PLAY_ARTIST_SONG`, `SET_ANOTHER_POOL`, `NEXT`, etc.) are added to this union in the tasks that implement them (Task 2 onward) — adding a union member is a one-line change, done in the task that needs it, per YAGNI.

- [ ] **Step 13: Write failing reducer test `src/player/reducer.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { playerReducer } from './reducer'
import { initialPlayerState } from './types'

describe('playerReducer — Task 1 (transport controls)', () => {
  it('TOGGLE_PLAY flips isPlaying', () => {
    const next = playerReducer(initialPlayerState, { type: 'TOGGLE_PLAY' })
    expect(next.isPlaying).toBe(true)
    const next2 = playerReducer(next, { type: 'TOGGLE_PLAY' })
    expect(next2.isPlaying).toBe(false)
  })

  it('SET_PLAYING sets isPlaying explicitly', () => {
    const next = playerReducer(initialPlayerState, { type: 'SET_PLAYING', playing: true })
    expect(next.isPlaying).toBe(true)
  })

  it('SET_VOLUME clamps to 0-100', () => {
    expect(playerReducer(initialPlayerState, { type: 'SET_VOLUME', volume: 150 }).volume).toBe(100)
    expect(playerReducer(initialPlayerState, { type: 'SET_VOLUME', volume: -10 }).volume).toBe(0)
    expect(playerReducer(initialPlayerState, { type: 'SET_VOLUME', volume: 42 }).volume).toBe(42)
  })

  it('TOGGLE_MUTE flips isMuted', () => {
    const next = playerReducer(initialPlayerState, { type: 'TOGGLE_MUTE' })
    expect(next.isMuted).toBe(true)
  })

  it('TOGGLE_REPEAT flips isRepeat', () => {
    const next = playerReducer(initialPlayerState, { type: 'TOGGLE_REPEAT' })
    expect(next.isRepeat).toBe(true)
  })

  it('SET_MOBILE sets isMobile', () => {
    const next = playerReducer(initialPlayerState, { type: 'SET_MOBILE', isMobile: true })
    expect(next.isMobile).toBe(true)
  })

  it('PLAY_TOP_SONG sets mode to top, sets topSongIndex, starts playing', () => {
    const next = playerReducer(initialPlayerState, { type: 'PLAY_TOP_SONG', index: 3 })
    expect(next.mode).toBe('top')
    expect(next.topSongIndex).toBe(3)
    expect(next.isPlaying).toBe(true)
  })
})
```

- [ ] **Step 14: Run test to verify it fails**

Run: `npm run test -- reducer`
Expected: FAIL — `playerReducer` not defined.

- [ ] **Step 15: Implement `src/player/reducer.ts`**

```ts
import type { PlayerAction, PlayerState } from './types'

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing }
    case 'SET_VOLUME':
      return { ...state, volume: Math.min(100, Math.max(0, action.volume)) }
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }
    case 'TOGGLE_REPEAT':
      return { ...state, isRepeat: !state.isRepeat }
    case 'SET_MOBILE':
      return { ...state, isMobile: action.isMobile }
    case 'PLAY_TOP_SONG':
      return { ...state, mode: 'top', topSongIndex: action.index, isPlaying: true }
    default:
      return state
  }
}
```

- [ ] **Step 16: Run test to verify it passes**

Run: `npm run test -- reducer`
Expected: PASS (7/7)

- [ ] **Step 17: Write `src/player/usePlayerEngine.ts`**

```ts
import { useEffect, useReducer, useRef } from 'react'
import { playerReducer } from './reducer'
import { initialPlayerState } from './types'
import { topSongs } from '../data/topSongs'

export function usePlayerEngine() {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Resolve the currently-playing song from state — Task 1 only knows
  // about "top" mode; later tasks extend this as artist/another modes
  // are implemented.
  const currentSong = topSongs[state.topSongIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = `/musics/${currentSong.nameFile}`
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (state.isPlaying) audio.play()
    else audio.pause()
  }, [state.isPlaying, currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = state.isMuted ? 0 : state.volume / 100
  }, [state.volume, state.isMuted])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 46.1875em)')
    dispatch({ type: 'SET_MOBILE', isMobile: mql.matches })
    const listener = (e: MediaQueryListEvent) => dispatch({ type: 'SET_MOBILE', isMobile: e.matches })
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  return { state, dispatch, audioRef, currentSong }
}
```

- [ ] **Step 18: Write `src/player/PlayerContext.tsx`**

```tsx
import { createContext, useContext, type ReactNode } from 'react'
import { usePlayerEngine } from './usePlayerEngine'

type PlayerEngine = ReturnType<typeof usePlayerEngine>

const PlayerContext = createContext<PlayerEngine | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const engine = usePlayerEngine()
  return (
    <PlayerContext.Provider value={engine}>
      {children}
      <audio ref={engine.audioRef} id="songFile" />
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerEngine {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider')
  return ctx
}
```

- [ ] **Step 19: Write failing component test `src/components/PlayerBar/PlayerBar.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerProvider } from '../../player/PlayerContext'
import { PlayerBar } from './PlayerBar'

function renderPlayerBar() {
  return render(
    <PlayerProvider>
      <PlayerBar />
    </PlayerProvider>,
  )
}

describe('PlayerBar', () => {
  it('shows the current top song name and artist', () => {
    renderPlayerBar()
    expect(screen.getByText('Anh sai rồi')).toBeInTheDocument()
    expect(screen.getByText('Sơn Tùng')).toBeInTheDocument()
  })

  it('toggles play/pause icon on click', () => {
    renderPlayerBar()
    const playBtn = screen.getByTestId('pause')
    expect(playBtn.querySelector('.fa-circle-play')).toBeTruthy()
    fireEvent.click(playBtn)
    expect(playBtn.querySelector('.fa-circle-pause')).toBeTruthy()
  })

  it('mutes and restores volume icon on click', () => {
    renderPlayerBar()
    const volIcon = screen.getByTestId('vol-icon')
    expect(volIcon.querySelector('.fa-volume-high')).toBeTruthy()
    fireEvent.click(volIcon)
    expect(volIcon.querySelector('.fa-volume-slash')).toBeTruthy()
  })
})
```

- [ ] **Step 20: Run test to verify it fails**

Run: `npm run test -- PlayerBar`
Expected: FAIL — `PlayerBar` module not found.

- [ ] **Step 21: Implement `src/components/PlayerBar/PlayerBar.tsx`** (markup/classes ported verbatim from the original `<div class="playerBar">` block)

```tsx
import { usePlayer } from '../../player/PlayerContext'
import { formatTimer } from '../../utils/formatTimer'

export function PlayerBar() {
  const { state, dispatch, audioRef, currentSong } = usePlayer()

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = Number(e.target.value)
  }

  return (
    <div className="playerBar">
      <div className="rangeBar">
        <div className="currTime">{formatTimer(audioRef.current?.currentTime ?? 0)}</div>
        <input
          type="range"
          step={1}
          className="seekbar"
          value={audioRef.current?.currentTime ?? 0}
          max={audioRef.current?.duration || 0}
          onChange={handleSeek}
        />
        <div className="durrTime">{formatTimer(audioRef.current?.duration ?? 0)}</div>
      </div>
      <div className="playerBar_item">
        <div className="playerBar_item-info">
          <div className="playerBar_item-img">
            <img className="playerBar_item-img--thumb" src={`/img/${currentSong.img}`} alt="" />
          </div>
          <div className="playerBar_item-name">
            <div className="playerBar_item-name--nameSong">{currentSong.nameSong}</div>
            <div className="playerBar_item-name--nameArtist">{currentSong.nameArtist}</div>
          </div>
        </div>
        <div className="playerBar_item-action">
          <div className="random" style={{ color: state.isRandom ? 'green' : 'black' }}>
            <i className="fa-light fa-shuffle" />
          </div>
          <div className="back playerBar_item-action--size">
            <i className="fa-solid fa-backward-fast" />
          </div>
          <div
            id="pause"
            data-testid="pause"
            className="pause playerBar_item-action--pausesize"
            onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
          >
            <i className={state.isPlaying ? 'fa-sharp fa-solid fa-circle-pause' : 'fa-solid fa-circle-play'} />
          </div>
          <div className="next playerBar_item-action--size">
            <i className="fa-solid fa-forward-fast" />
          </div>
          <div className="replay" style={{ color: state.isRepeat ? 'green' : 'black' }} onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}>
            <i className="fa-light fa-arrows-repeat" />
          </div>
        </div>
        <div className="playerBar_item-vol">
          <div
            className="playerBar_item-vol--icon"
            data-testid="vol-icon"
            onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
          >
            <i className={state.isMuted ? 'fa-solid fa-volume-slash' : 'fa-solid fa-volume-high'} />
          </div>
          <div className="playerBar_item-vol--bar">
            <input
              type="range"
              value={state.volume}
              onChange={(e) => dispatch({ type: 'SET_VOLUME', volume: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

> `back`/`next` buttons are visually present but not yet wired to dispatch — Task 2 (`NEXT_TOP_SONG`/`PREV_TOP_SONG`) wires them. Leaving them inert here is correct sequencing, not a bug: this task's scope is transport controls (play/pause/seek/volume/mute/repeat toggle) only.

- [ ] **Step 22: Run test to verify it passes**

Run: `npm run test -- PlayerBar`
Expected: PASS (3/3)

- [ ] **Step 23: Wire into `src/App.tsx` and `src/main.tsx`**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`:
```tsx
import { PlayerProvider } from './player/PlayerContext'
import { PlayerBar } from './components/PlayerBar/PlayerBar'

function App() {
  return (
    <PlayerProvider>
      <div id="allPage" className="allPage">
        <div className="main">{/* LeftBar, container, rightBar added in later tasks */}</div>
      </div>
      <PlayerBar />
    </PlayerProvider>
  )
}

export default App
```

- [ ] **Step 24: Manual browser verification**

Run: `npm run dev`, open the shown localhost URL.
Expected: bottom player bar visible with "Anh sai rồi / Sơn Tùng", clicking the center icon plays/pauses real audio, seek bar and volume work, mute icon toggles.

- [ ] **Step 25: Commit**

```bash
git add public/img public/musics public/icon src/style.css src/data src/utils src/player src/components/PlayerBar src/App.tsx src/main.tsx index.html
git commit -m "feat: foundation + minimal playable player bar"
```

---

## Task 2: Top Song feature (thumb, list, rotate animation, next/back within top mode)

**Files:**
- Modify: `src/player/types.ts` (add `NEXT_TOP_SONG`, `PREV_TOP_SONG` to `PlayerAction`)
- Modify: `src/player/reducer.ts`, `src/player/reducer.test.ts`
- Modify: `src/components/PlayerBar/PlayerBar.tsx` (wire back/next buttons)
- Create: `src/components/TopSong/TopSong.tsx`, `src/components/TopSong/TopSong.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `usePlayer()` from Task 1, `topSongs` from `src/data/topSongs.ts`.
- Produces: `<TopSong />` component rendering `.topMusic` (big thumb) + `.topMusic_item--song` (scrollable list), each row clickable via `dispatch({ type: 'PLAY_TOP_SONG', index })`.

- [ ] **Step 1: Add failing reducer tests for wraparound next/back**

Add to `src/player/reducer.test.ts`:
```ts
describe('playerReducer — Task 2 (top song navigation)', () => {
  it('NEXT_TOP_SONG advances and wraps to 0 at the end', () => {
    const atLast = { ...initialPlayerState, topSongIndex: 5 } // topSongs has 6 items (0-5)
    expect(playerReducer(atLast, { type: 'NEXT_TOP_SONG', length: 6 }).topSongIndex).toBe(0)
    const middle = { ...initialPlayerState, topSongIndex: 2 }
    expect(playerReducer(middle, { type: 'NEXT_TOP_SONG', length: 6 }).topSongIndex).toBe(3)
  })

  it('PREV_TOP_SONG retreats and wraps to length-1 at the start', () => {
    const atFirst = { ...initialPlayerState, topSongIndex: 0 }
    expect(playerReducer(atFirst, { type: 'PREV_TOP_SONG', length: 6 }).topSongIndex).toBe(5)
    const middle = { ...initialPlayerState, topSongIndex: 2 }
    expect(playerReducer(middle, { type: 'PREV_TOP_SONG', length: 6 }).topSongIndex).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- reducer`
Expected: FAIL — unknown action type `NEXT_TOP_SONG`/`PREV_TOP_SONG` (TypeScript error until Step 3, then runtime "topSongIndex stays the same").

- [ ] **Step 3: Add action types to `src/player/types.ts`**

```ts
export type PlayerAction =
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_MOBILE'; isMobile: boolean }
  | { type: 'PLAY_TOP_SONG'; index: number }
  | { type: 'NEXT_TOP_SONG'; length: number }
  | { type: 'PREV_TOP_SONG'; length: number }
```

- [ ] **Step 4: Add reducer cases to `src/player/reducer.ts`**

```ts
    case 'NEXT_TOP_SONG': {
      const nextIndex = (state.topSongIndex + 1) % action.length
      return { ...state, mode: 'top', topSongIndex: nextIndex, isPlaying: true }
    }
    case 'PREV_TOP_SONG': {
      const prevIndex = (state.topSongIndex - 1 + action.length) % action.length
      return { ...state, mode: 'top', topSongIndex: prevIndex, isPlaying: true }
    }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- reducer`
Expected: PASS (9/9)

- [ ] **Step 6: Wire back/next buttons in `PlayerBar.tsx`**

```tsx
import { topSongs } from '../../data/topSongs'
// ...
<div
  className="back playerBar_item-action--size"
  onClick={() => dispatch({ type: 'PREV_TOP_SONG', length: topSongs.length })}
>
  <i className="fa-solid fa-backward-fast" />
</div>
{/* ... */}
<div
  className="next playerBar_item-action--size"
  onClick={() => dispatch({ type: 'NEXT_TOP_SONG', length: topSongs.length })}
>
  <i className="fa-solid fa-forward-fast" />
</div>
```

> This wiring is temporarily top-song-only and will be replaced by the mode-aware `NEXT`/`PREV` dispatcher in Task 5 once artist/another modes exist.

- [ ] **Step 7: Write failing test `src/components/TopSong/TopSong.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerProvider } from '../../player/PlayerContext'
import { TopSong } from './TopSong'
import { topSongs } from '../../data/topSongs'

function renderTopSong() {
  return render(
    <PlayerProvider>
      <TopSong />
    </PlayerProvider>,
  )
}

describe('TopSong', () => {
  it('renders one row per top song with rank number', () => {
    renderTopSong()
    topSongs.forEach((song) => {
      expect(screen.getByText(song.nameSong)).toBeInTheDocument()
    })
  })

  it('clicking a row plays that song', () => {
    renderTopSong()
    fireEvent.click(screen.getByText(topSongs[2].nameSong))
    // the big thumb updates to the clicked song's image
    expect(screen.getByTestId('top-thumb')).toHaveAttribute('src', `/img/${topSongs[2].img}`)
  })
})
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npm run test -- TopSong`
Expected: FAIL — `TopSong` module not found.

- [ ] **Step 9: Implement `src/components/TopSong/TopSong.tsx`** (markup ported from `.topMusic` + `renderTopSong()` in `main.js`)

```tsx
import { usePlayer } from '../../player/PlayerContext'
import { topSongs } from '../../data/topSongs'

export function TopSong() {
  const { state, dispatch, currentSong } = usePlayer()

  return (
    <>
      <h2 className="topMusic-title">Top Song 2022</h2>
      <div className="topMusic">
        <div className="topMusic_item--img">
          <img
            data-testid="top-thumb"
            className={`topMusic_item--img--thumb${state.isPlaying ? ' rotatePlay' : ''}`}
            src={`/img/${currentSong.img}`}
            alt=""
          />
        </div>
        <div className="topMusic_item--song">
          {topSongs.map((song, index) => {
            const isActive = state.mode === 'top' && state.topSongIndex === index
            return (
              <div
                key={song.nameFile}
                className="topSong"
                style={isActive ? { backgroundColor: 'white' } : undefined}
                onClick={() => dispatch({ type: 'PLAY_TOP_SONG', index })}
              >
                <div className="topMusicLeft">
                  <div className="topSong_rank">
                    {isActive ? <img className="iconwavegif" src="/icon/wave.gif" alt="" /> : index + 1}
                  </div>
                  <div className="topSong_love">
                    <i className="fa-light fa-heart" />
                  </div>
                  <div className="topSong_name">
                    <div className="topSong_name-nameSong">{song.nameSong}</div>
                    <div className="topSong_name-artist">{song.nameArtist}</div>
                  </div>
                </div>
                <div className="topSong_time" style={isActive ? { color: 'black' } : undefined}>
                  {song.time}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm run test -- TopSong`
Expected: PASS (2/2)

- [ ] **Step 11: Wire into `App.tsx`**

```tsx
import { TopSong } from './components/TopSong/TopSong'
// inside <div className="main"> add a <div className="container"> wrapping <TopSong />
```

- [ ] **Step 12: Manual browser verification**

Run: `npm run dev`.
Expected: top song thumb + list visible, clicking a row switches the playing song and highlights it white, thumb spins while playing, next/back buttons in PlayerBar cycle through the 6 top songs and wrap around.

- [ ] **Step 13: Commit**

```bash
git add src/player src/components/TopSong src/components/PlayerBar/PlayerBar.tsx src/App.tsx
git commit -m "feat: top song list with rotate animation and next/back"
```

---

## Task 3: Artist feature (ListArtist + RecentPlayed, play songs of a selected artist)

**Files:**
- Modify: `src/player/types.ts` (add `SELECT_ARTIST`, `PLAY_ARTIST_SONG`, `NEXT_ARTIST_SONG`, `PREV_ARTIST_SONG`)
- Modify: `src/player/reducer.ts`, `src/player/reducer.test.ts`
- Modify: `src/player/usePlayerEngine.ts` (resolve `currentSong` from `mode`)
- Create: `src/components/ListArtist/ListArtist.tsx`, `.test.tsx`
- Create: `src/components/RecentPlayed/RecentPlayed.tsx`, `.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `artists` from `src/data/artists.ts`, `songs` from `src/data/songs.ts`.
- Produces: clicking an artist in `ListArtist` selects them; `RecentPlayed` shows only that artist's songs (filtered from `songs`), click one to play it.

- [ ] **Step 1: Add failing reducer tests**

Add to `src/player/reducer.test.ts`:
```ts
describe('playerReducer — Task 3 (artist mode)', () => {
  it('SELECT_ARTIST sets selectedArtist/selectedArtistIndex, does not change mode/play state', () => {
    const next = playerReducer(initialPlayerState, { type: 'SELECT_ARTIST', artist: 'amee', artistIndex: 1 })
    expect(next.selectedArtist).toBe('amee')
    expect(next.selectedArtistIndex).toBe(1)
  })

  it('PLAY_ARTIST_SONG sets mode to artist, sets indices, starts playing', () => {
    const next = playerReducer(initialPlayerState, {
      type: 'PLAY_ARTIST_SONG',
      songIndex: 6,
      position: 0,
    })
    expect(next.mode).toBe('artist')
    expect(next.artistSongGlobalIndex).toBe(6)
    expect(next.artistSongPosition).toBe(0)
    expect(next.isPlaying).toBe(true)
  })

  it('NEXT_ARTIST_SONG advances position and wraps within the filtered list length', () => {
    const atStart = { ...initialPlayerState, mode: 'artist' as const, artistSongPosition: 0 }
    const next = playerReducer(atStart, { type: 'NEXT_ARTIST_SONG', filteredLength: 4, songIndices: [6, 7, 8, 9] })
    expect(next.artistSongPosition).toBe(1)
    expect(next.artistSongGlobalIndex).toBe(7)
  })

  it('PREV_ARTIST_SONG retreats position and wraps to the end', () => {
    const atStart = { ...initialPlayerState, mode: 'artist' as const, artistSongPosition: 0 }
    const next = playerReducer(atStart, { type: 'PREV_ARTIST_SONG', filteredLength: 4, songIndices: [6, 7, 8, 9] })
    expect(next.artistSongPosition).toBe(3)
    expect(next.artistSongGlobalIndex).toBe(9)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- reducer`
Expected: FAIL — unknown action types.

- [ ] **Step 3: Add action types to `src/player/types.ts`**

```ts
  | { type: 'SELECT_ARTIST'; artist: ArtistId; artistIndex: number }
  | { type: 'PLAY_ARTIST_SONG'; songIndex: number; position: number }
  | { type: 'NEXT_ARTIST_SONG'; filteredLength: number; songIndices: number[] }
  | { type: 'PREV_ARTIST_SONG'; filteredLength: number; songIndices: number[] }
```

- [ ] **Step 4: Add reducer cases to `src/player/reducer.ts`**

```ts
    case 'SELECT_ARTIST':
      return { ...state, selectedArtist: action.artist, selectedArtistIndex: action.artistIndex }
    case 'PLAY_ARTIST_SONG':
      return {
        ...state,
        mode: 'artist',
        artistSongGlobalIndex: action.songIndex,
        artistSongPosition: action.position,
        isPlaying: true,
      }
    case 'NEXT_ARTIST_SONG': {
      const nextPos = (state.artistSongPosition + 1) % action.filteredLength
      return { ...state, artistSongPosition: nextPos, artistSongGlobalIndex: action.songIndices[nextPos], isPlaying: true }
    }
    case 'PREV_ARTIST_SONG': {
      const prevPos = (state.artistSongPosition - 1 + action.filteredLength) % action.filteredLength
      return { ...state, artistSongPosition: prevPos, artistSongGlobalIndex: action.songIndices[prevPos], isPlaying: true }
    }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- reducer`
Expected: PASS (13/13)

- [ ] **Step 6: Extend `usePlayerEngine.ts` to resolve `currentSong` by mode**

```ts
import { songs } from '../data/songs'
// ...
const currentSong =
  state.mode === 'artist' ? songs[state.artistSongGlobalIndex] : topSongs[state.topSongIndex]
```

- [ ] **Step 7: Write failing test `src/components/ListArtist/ListArtist.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerProvider } from '../../player/PlayerContext'
import { ListArtist } from './ListArtist'
import { artists } from '../../data/artists'

describe('ListArtist', () => {
  it('renders every artist name and label', () => {
    render(<PlayerProvider><ListArtist /></PlayerProvider>)
    artists.forEach((a) => {
      expect(screen.getByText(a.displayName)).toBeInTheDocument()
      expect(screen.getByText(a.lastPlayedLabel)).toBeInTheDocument()
    })
  })

  it('clicking an artist highlights it as selected', () => {
    render(<PlayerProvider><ListArtist /></PlayerProvider>)
    const ameeRow = screen.getByText('AMEE').closest('.listArtist_item')!
    fireEvent.click(ameeRow)
    expect(ameeRow).toHaveClass('recentPlayed_clicked')
  })
})
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npm run test -- ListArtist`
Expected: FAIL — module not found.

- [ ] **Step 9: Implement `src/components/ListArtist/ListArtist.tsx`** (ported from `.listArtist` block + `renderListMusicOf`)

```tsx
import { usePlayer } from '../../player/PlayerContext'
import { artists } from '../../data/artists'

export function ListArtist() {
  const { state, dispatch } = usePlayer()

  return (
    <>
      <h3 className="listArtist_title">Recent Singers</h3>
      <div className="listArtist">
        {artists.map((artist, index) => {
          const isSelected = state.selectedArtistIndex === index
          return (
            <div
              key={artist.id}
              className={`listArtist_item${isSelected ? ' recentPlayed_clicked' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_ARTIST', artist: artist.id, artistIndex: index })}
            >
              <div className="listArtist_item-img">
                <img className="listArtist_item-img" src={`/img/${artist.avatar}`} alt="" />
              </div>
              <div className="listArtist_item-name">
                <span className="listArtist_item-nameSong">{artist.displayName}</span>
                <span className="listArtist_item-nameArtist">{artist.lastPlayedLabel}</span>
              </div>
              <div className="listArtist_item-iconRunning">
                {isSelected ? <img className="iconwavegif" src="/icon/list.gif" alt="" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm run test -- ListArtist`
Expected: PASS (2/2)

- [ ] **Step 11: Write failing test `src/components/RecentPlayed/RecentPlayed.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerProvider } from '../../player/PlayerContext'
import { RecentPlayed } from './RecentPlayed'
import { songs } from '../../data/songs'

describe('RecentPlayed', () => {
  it('shows only songs belonging to the selected artist (sontung by default)', () => {
    render(<PlayerProvider><RecentPlayed /></PlayerProvider>)
    const sontungSongs = songs.filter((s) => s.artist === 'sontung')
    sontungSongs.forEach((s) => expect(screen.getByText(s.nameSong)).toBeInTheDocument())
    const ameeSong = songs.find((s) => s.artist === 'amee')!
    expect(screen.queryByText(ameeSong.nameSong)).not.toBeInTheDocument()
  })

  it('clicking a song plays it', () => {
    render(<PlayerProvider><RecentPlayed /></PlayerProvider>)
    const sontungSongs = songs.filter((s) => s.artist === 'sontung')
    fireEvent.click(screen.getByText(sontungSongs[1].nameSong))
    // no visible assertion needed beyond "doesn't throw" — engine-level
    // effect (audio.src set) is covered by usePlayerEngine tests.
  })
})
```

- [ ] **Step 12: Run test to verify it fails**

Run: `npm run test -- RecentPlayed`
Expected: FAIL — module not found.

- [ ] **Step 13: Implement `src/components/RecentPlayed/RecentPlayed.tsx`** (ported from `.recentPlayed` + `renderRecentSong()`)

```tsx
import { usePlayer } from '../../player/PlayerContext'
import { songs } from '../../data/songs'

export function RecentPlayed() {
  const { state, dispatch } = usePlayer()
  const filtered = songs
    .map((song, globalIndex) => ({ song, globalIndex }))
    .filter(({ song }) => song.artist === state.selectedArtist)

  return (
    <>
      <h3 className="recentPlayed_title">
        {state.mode === 'artist' ? 'Top song of singer' : 'Recent Played'}
      </h3>
      <div className="recentPlayed">
        {filtered.map(({ song, globalIndex }, position) => (
          <div
            key={song.nameFile}
            className="recentPlayed_item"
            onClick={() =>
              dispatch({ type: 'PLAY_ARTIST_SONG', songIndex: globalIndex, position })
            }
          >
            <div className="recentPlayed_item-img1">
              <img
                className={`recentPlayed_item-img${
                  state.mode === 'artist' && state.artistSongPosition === position
                    ? ' recentPlayed_item-img_clicked'
                    : ''
                }`}
                src={`/img/${song.img}`}
                alt=""
              />
            </div>
            <div className="recentPlayed_item-nameSong">{song.nameSong}</div>
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 14: Run test to verify it passes**

Run: `npm run test -- RecentPlayed`
Expected: PASS (2/2)

- [ ] **Step 15: Wire `ListArtist` + `RecentPlayed` into `App.tsx`** (`rightBar`/`container` sections respectively, per original layout)

- [ ] **Step 16: Manual browser verification**

Run: `npm run dev`.
Expected: right bar shows 5 artists; clicking one highlights it and updates the recent-played list below the top-song list to that artist's songs only; clicking a song there plays it and highlights its thumbnail.

- [ ] **Step 17: Commit**

```bash
git add src/player src/components/ListArtist src/components/RecentPlayed src/App.tsx
git commit -m "feat: artist selection and per-artist recent played list"
```

---

## Task 4: Another Song feature (right-bar random song widget)

**Files:**
- Modify: `src/player/types.ts` (add `SET_ANOTHER_POOL`, `PLAY_ANOTHER_SONG`, `NEXT_ANOTHER_SONG`, `PREV_ANOTHER_SONG`)
- Modify: `src/player/reducer.ts`, `src/player/reducer.test.ts`
- Modify: `src/player/usePlayerEngine.ts` (generate pool once on mount, add `another` branch to `currentSong` resolution)
- Create: `src/utils/shuffle.ts`, `src/utils/shuffle.test.ts` (extracted random-subset picker so it's independently testable)
- Create: `src/components/AnotherSong/AnotherSong.tsx`, `.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `pickRandomSubset(poolSize: number, count: number, rng?: () => number): number[]` — pure, injectable RNG for deterministic tests.

- [ ] **Step 1: Write failing test `src/utils/shuffle.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { pickRandomSubset } from './shuffle'

describe('pickRandomSubset', () => {
  it('returns `count` unique indices within [0, poolSize)', () => {
    const result = pickRandomSubset(22, 4, () => 0.999)
    expect(result).toHaveLength(4)
    expect(new Set(result).size).toBe(4)
    result.forEach((i) => expect(i).toBeGreaterThanOrEqual(0) && expect(i).toBeLessThan(22))
  })

  it('is deterministic given a fixed rng sequence', () => {
    const values = [0.1, 0.5, 0.9, 0.3]
    let call = 0
    const rng = () => values[call++ % values.length]
    const a = pickRandomSubset(22, 4, rng)
    call = 0
    const b = pickRandomSubset(22, 4, rng)
    expect(a).toEqual(b)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- shuffle`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/shuffle.ts`** (ported from `pushArray()`/`checkValue()` in `main.js`)

```ts
export function pickRandomSubset(poolSize: number, count: number, rng: () => number = Math.random): number[] {
  const picked: number[] = []
  while (picked.length < count) {
    const candidate = Math.floor(rng() * poolSize)
    if (!picked.includes(candidate)) picked.push(candidate)
  }
  return picked
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- shuffle`
Expected: PASS (2/2)

- [ ] **Step 5: Add failing reducer tests**

Add to `src/player/reducer.test.ts`:
```ts
describe('playerReducer — Task 4 (another song mode)', () => {
  it('SET_ANOTHER_POOL stores the pool', () => {
    const next = playerReducer(initialPlayerState, { type: 'SET_ANOTHER_POOL', pool: [3, 7, 11, 15] })
    expect(next.anotherSongPool).toEqual([3, 7, 11, 15])
  })

  it('PLAY_ANOTHER_SONG sets mode to another, sets position, starts playing', () => {
    const withPool = { ...initialPlayerState, anotherSongPool: [3, 7, 11, 15] }
    const next = playerReducer(withPool, { type: 'PLAY_ANOTHER_SONG', position: 1 })
    expect(next.mode).toBe('another')
    expect(next.anotherSongPosition).toBe(1)
    expect(next.isPlaying).toBe(true)
  })

  it('NEXT_ANOTHER_SONG wraps within the pool length', () => {
    const state = { ...initialPlayerState, mode: 'another' as const, anotherSongPool: [3, 7, 11, 15], anotherSongPosition: 3 }
    expect(playerReducer(state, { type: 'NEXT_ANOTHER_SONG' }).anotherSongPosition).toBe(0)
  })

  it('PREV_ANOTHER_SONG wraps within the pool length', () => {
    const state = { ...initialPlayerState, mode: 'another' as const, anotherSongPool: [3, 7, 11, 15], anotherSongPosition: 0 }
    expect(playerReducer(state, { type: 'PREV_ANOTHER_SONG' }).anotherSongPosition).toBe(3)
  })
})
```

- [ ] **Step 6: Run test to verify it fails, then implement**

Add to `src/player/types.ts`:
```ts
  | { type: 'SET_ANOTHER_POOL'; pool: number[] }
  | { type: 'PLAY_ANOTHER_SONG'; position: number }
  | { type: 'NEXT_ANOTHER_SONG' }
  | { type: 'PREV_ANOTHER_SONG' }
```

Add to `src/player/reducer.ts`:
```ts
    case 'SET_ANOTHER_POOL':
      return { ...state, anotherSongPool: action.pool }
    case 'PLAY_ANOTHER_SONG':
      return { ...state, mode: 'another', anotherSongPosition: action.position, isPlaying: true }
    case 'NEXT_ANOTHER_SONG': {
      const next = (state.anotherSongPosition + 1) % state.anotherSongPool.length
      return { ...state, anotherSongPosition: next, isPlaying: true }
    }
    case 'PREV_ANOTHER_SONG': {
      const prev = (state.anotherSongPosition - 1 + state.anotherSongPool.length) % state.anotherSongPool.length
      return { ...state, anotherSongPosition: prev, isPlaying: true }
    }
```

Run: `npm run test -- reducer` → expect PASS (17/17).

- [ ] **Step 7: Generate the pool once on mount in `usePlayerEngine.ts`**

```ts
import { pickRandomSubset } from '../utils/shuffle'
import { songs } from '../data/songs'
// ...
useEffect(() => {
  const poolSize = state.isMobile ? 8 : 4
  dispatch({ type: 'SET_ANOTHER_POOL', pool: pickRandomSubset(songs.length, poolSize) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // generated once, matching the original's one-time renderAnotherSong() call

const currentSong =
  state.mode === 'artist'
    ? songs[state.artistSongGlobalIndex]
    : state.mode === 'another'
      ? songs[state.anotherSongPool[state.anotherSongPosition]]
      : topSongs[state.topSongIndex]
```

- [ ] **Step 8: Write failing test `src/components/AnotherSong/AnotherSong.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerProvider } from '../../player/PlayerContext'
import { AnotherSong } from './AnotherSong'

describe('AnotherSong', () => {
  it('renders 4 songs on desktop viewport', () => {
    render(<PlayerProvider><AnotherSong /></PlayerProvider>)
    expect(screen.getAllByTestId('another-song-item')).toHaveLength(4)
  })

  it('clicking a song plays it and shows the wave icon on it', () => {
    render(<PlayerProvider><AnotherSong /></PlayerProvider>)
    const items = screen.getAllByTestId('another-song-item')
    fireEvent.click(items[2])
    expect(items[2].querySelector('.iconwavegif')).toBeTruthy()
  })
})
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npm run test -- AnotherSong`
Expected: FAIL — module not found.

- [ ] **Step 10: Implement `src/components/AnotherSong/AnotherSong.tsx`** (ported from `.anotherSong` + `renderAnotherSong()`)

```tsx
import { usePlayer } from '../../player/PlayerContext'
import { songs } from '../../data/songs'

export function AnotherSong() {
  const { state, dispatch } = usePlayer()

  return (
    <>
      <h3 className="anotherSong_title">Another songs</h3>
      <div className="anotherSong">
        {state.anotherSongPool.map((songIndex, position) => {
          const song = songs[songIndex]
          const isActive = state.mode === 'another' && state.anotherSongPosition === position
          return (
            <div
              key={song.nameFile}
              data-testid="another-song-item"
              className={`anotherSong_item${isActive ? ' anotherSong_item-clicked' : ''}`}
              onClick={() => dispatch({ type: 'PLAY_ANOTHER_SONG', position })}
            >
              <div className="anotherSong_item-img">
                <img className="anotherSong_item-img" src={`/img/${song.img}`} alt="" />
              </div>
              <div className="anotherSong_item-name">
                <span className="anotherSong_item-nameSong">{song.nameSong}</span>
                <div className="anotherSong_item-name2">
                  <span className="anotherSong_item-nameArtist">{song.nameArtist}</span>
                  <div className="iconPlaying">
                    {isActive ? <img className="iconwavegif" src="/icon/wave.gif" alt="" /> : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm run test -- AnotherSong`
Expected: PASS (2/2)

- [ ] **Step 12: Wire into `App.tsx`** (rightBar section, below `ListArtist`)

- [ ] **Step 13: Manual browser verification**

Run: `npm run dev`.
Expected: "Another songs" widget shows 4 random songs, clicking one plays it and shows the wave icon next to it.

- [ ] **Step 14: Commit**

```bash
git add src/utils/shuffle.ts src/utils/shuffle.test.ts src/player src/components/AnotherSong src/App.tsx
git commit -m "feat: another-song random widget"
```

---

## Task 5: Cross-mode NEXT/PREV dispatcher, repeat, random-shuffle, song-end auto-advance

This is the "glue" task: a single `NEXT`/`PREV` action that looks at `state.mode` and does the right thing, replacing the Task-2-only wiring in `PlayerBar`. Plus whole-catalog random shuffle and the `ended`-event auto-advance decided in Global Constraints.

**Files:**
- Modify: `src/player/types.ts` (add `NEXT`, `PREV`, `TOGGLE_RANDOM`, `RANDOM_ADVANCE`)
- Modify: `src/player/reducer.ts`, `src/player/reducer.test.ts`
- Modify: `src/player/usePlayerEngine.ts` (wire `ended` event, `TOGGLE_RANDOM` pool generation, random-mode song resolution)
- Modify: `src/components/PlayerBar/PlayerBar.tsx` (back/next dispatch `NEXT`/`PREV`; random icon dispatches `TOGGLE_RANDOM`)

**Interfaces:**
- Consumes: filtered-list helpers already used ad hoc in Tasks 2-4 (`topSongs.length`, per-artist filtered indices, `anotherSongPool`) — this task centralizes their computation into one `selectNavigationContext(state)` helper in `src/player/navigation.ts` so the reducer doesn't need mode-specific data passed in from three different call sites.

- [ ] **Step 1: Write `src/player/navigation.ts` with a failing test first — `src/player/navigation.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { selectArtistSongIndices } from './navigation'
import { songs } from '../data/songs'

describe('selectArtistSongIndices', () => {
  it('returns global song[] indices for the given artist, in catalog order', () => {
    const indices = selectArtistSongIndices(songs, 'amee')
    indices.forEach((i) => expect(songs[i].artist).toBe('amee'))
    expect(indices).toEqual([6, 7, 8, 9])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- navigation`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/player/navigation.ts`**

```ts
import type { ArtistId, Song } from '../data/types'

export function selectArtistSongIndices(songs: Song[], artist: ArtistId): number[] {
  return songs.reduce<number[]>((acc, song, index) => {
    if (song.artist === artist) acc.push(index)
    return acc
  }, [])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- navigation`
Expected: PASS (1/1)

- [ ] **Step 5: Write failing reducer tests for the dispatcher**

Add to `src/player/reducer.test.ts`:
```ts
describe('playerReducer — Task 5 (NEXT/PREV dispatcher + random)', () => {
  it('NEXT in top mode behaves like NEXT_TOP_SONG', () => {
    const state = { ...initialPlayerState, mode: 'top' as const, topSongIndex: 0 }
    const next = playerReducer(state, { type: 'NEXT', topSongsLength: 6, artistSongIndices: [], anotherPoolLength: 0 })
    expect(next.topSongIndex).toBe(1)
  })

  it('NEXT in artist mode behaves like NEXT_ARTIST_SONG', () => {
    const state = { ...initialPlayerState, mode: 'artist' as const, artistSongPosition: 0 }
    const next = playerReducer(state, { type: 'NEXT', topSongsLength: 6, artistSongIndices: [6, 7, 8, 9], anotherPoolLength: 0 })
    expect(next.artistSongPosition).toBe(1)
    expect(next.artistSongGlobalIndex).toBe(7)
  })

  it('NEXT in another mode behaves like NEXT_ANOTHER_SONG', () => {
    const state = { ...initialPlayerState, mode: 'another' as const, anotherSongPool: [3, 7, 11, 15], anotherSongPosition: 0 }
    const next = playerReducer(state, { type: 'NEXT', topSongsLength: 6, artistSongIndices: [], anotherPoolLength: 4 })
    expect(next.anotherSongPosition).toBe(1)
  })

  it('TOGGLE_RANDOM turns random on with a queue and off again', () => {
    const on = playerReducer(initialPlayerState, { type: 'TOGGLE_RANDOM', queue: [4, 1, 9, 0] })
    expect(on.isRandom).toBe(true)
    expect(on.randomQueue).toEqual([4, 1, 9, 0])
    expect(on.randomPosition).toBe(0)
    const off = playerReducer(on, { type: 'TOGGLE_RANDOM', queue: [] })
    expect(off.isRandom).toBe(false)
  })

  it('RANDOM_ADVANCE moves through the queue and wraps', () => {
    const state = { ...initialPlayerState, isRandom: true, randomQueue: [4, 1, 9, 0], randomPosition: 3 }
    expect(playerReducer(state, { type: 'RANDOM_ADVANCE' }).randomPosition).toBe(0)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- reducer`
Expected: FAIL — unknown action types.

- [ ] **Step 7: Add action types to `src/player/types.ts`**

```ts
  | { type: 'NEXT'; topSongsLength: number; artistSongIndices: number[]; anotherPoolLength: number }
  | { type: 'PREV'; topSongsLength: number; artistSongIndices: number[]; anotherPoolLength: number }
  | { type: 'TOGGLE_RANDOM'; queue: number[] }
  | { type: 'RANDOM_ADVANCE' }
```

- [ ] **Step 8: Add reducer cases to `src/player/reducer.ts`**

```ts
    case 'NEXT': {
      if (state.mode === 'top') return playerReducer(state, { type: 'NEXT_TOP_SONG', length: action.topSongsLength })
      if (state.mode === 'artist')
        return playerReducer(state, {
          type: 'NEXT_ARTIST_SONG',
          filteredLength: action.artistSongIndices.length,
          songIndices: action.artistSongIndices,
        })
      return playerReducer(state, { type: 'NEXT_ANOTHER_SONG' })
    }
    case 'PREV': {
      if (state.mode === 'top') return playerReducer(state, { type: 'PREV_TOP_SONG', length: action.topSongsLength })
      if (state.mode === 'artist')
        return playerReducer(state, {
          type: 'PREV_ARTIST_SONG',
          filteredLength: action.artistSongIndices.length,
          songIndices: action.artistSongIndices,
        })
      return playerReducer(state, { type: 'PREV_ANOTHER_SONG' })
    }
    case 'TOGGLE_RANDOM':
      return state.isRandom
        ? { ...state, isRandom: false }
        : { ...state, isRandom: true, randomQueue: action.queue, randomPosition: 0 }
    case 'RANDOM_ADVANCE': {
      const nextPos = (state.randomPosition + 1) % state.randomQueue.length
      return { ...state, randomPosition: nextPos, isPlaying: true }
    }
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test -- reducer`
Expected: PASS (22/22)

- [ ] **Step 10: Wire the `ended` event and random-mode resolution into `usePlayerEngine.ts`**

```ts
import { selectArtistSongIndices } from './navigation'
// ...
const artistSongIndices = selectArtistSongIndices(songs, state.selectedArtist)

const currentSong = state.isRandom
  ? songs[state.randomQueue[state.randomPosition]]
  : state.mode === 'artist'
    ? songs[state.artistSongGlobalIndex]
    : state.mode === 'another'
      ? songs[state.anotherSongPool[state.anotherSongPosition]]
      : topSongs[state.topSongIndex]

useEffect(() => {
  const audio = audioRef.current
  if (!audio) return
  const handleEnded = () => {
    if (state.isRepeat) {
      audio.currentTime = 0
      audio.play()
      return
    }
    if (state.isRandom) {
      dispatch({ type: 'RANDOM_ADVANCE' })
      return
    }
    dispatch({ type: 'NEXT', topSongsLength: topSongs.length, artistSongIndices, anotherPoolLength: state.anotherSongPool.length })
  }
  audio.addEventListener('ended', handleEnded)
  return () => audio.removeEventListener('ended', handleEnded)
}, [state.isRepeat, state.isRandom, state.mode, artistSongIndices, state.anotherSongPool.length])

function toggleRandom() {
  const queue = state.isRandom ? [] : pickRandomSubset(songs.length, songs.length)
  dispatch({ type: 'TOGGLE_RANDOM', queue })
}

function next() {
  dispatch({ type: 'NEXT', topSongsLength: topSongs.length, artistSongIndices, anotherPoolLength: state.anotherSongPool.length })
}

function prev() {
  dispatch({ type: 'PREV', topSongsLength: topSongs.length, artistSongIndices, anotherPoolLength: state.anotherSongPool.length })
}

return { state, dispatch, audioRef, currentSong, next, prev, toggleRandom }
```

- [ ] **Step 11: Update `PlayerBar.tsx` to use the new `next`/`prev`/`toggleRandom` from the engine**

```tsx
const { state, dispatch, audioRef, currentSong, next, prev, toggleRandom } = usePlayer()
// ...
<div className="back playerBar_item-action--size" onClick={prev}>
<div className="next playerBar_item-action--size" onClick={next}>
<div className="random" style={{ color: state.isRandom ? 'green' : 'black' }} onClick={toggleRandom}>
```

- [ ] **Step 12: Manual browser verification**

Run: `npm run dev`.
Expected: next/back now correctly cycle within whichever mode is active (top songs, current artist's songs, or the another-song widget); toggling the shuffle icon turns green and plays through the whole catalog in random order; enabling repeat restarts the same track at the end instead of advancing; letting a track play to completion auto-advances reliably (this is the `ended`-event fix from Global Constraints — confirm it actually fires, unlike the original's flaky polling).

- [ ] **Step 13: Commit**

```bash
git add src/player src/components/PlayerBar/PlayerBar.tsx
git commit -m "feat: unified next/prev dispatcher, random shuffle, reliable song-end auto-advance"
```

---

## Task 6: Static shell — LeftBar, Header, full-page composition, cleanup

No new player logic — this task assembles everything built so far into the full original layout and removes scaffold cruft. No unit tests needed (purely static markup); verify with a manual side-by-side visual check instead, per the project's own testing note (no need to test decorative, non-interactive markup).

**Files:**
- Create: `src/components/LeftBar/LeftBar.tsx`
- Create: `src/components/Header/Header.tsx`
- Modify: `src/App.tsx` (final composition matching original DOM order exactly)

- [ ] **Step 1: Implement `src/components/LeftBar/LeftBar.tsx`** (static — ported verbatim from `.leftBar` block, no original JS ever attached behavior to these items)

```tsx
export function LeftBar() {
  return (
    <div className="leftBar">
      <h3 className="leftBar_title">
        <i className="fa-solid fa-align-left" /> MUSIC PAGE
      </h3>
      <div className="leftBar_recommend">
        <span className="leftBar_title2">Recommend</span>
        <ul>
          <li className="leftBar_recommend-item item1">For you</li>
          <li className="leftBar_recommend-item item2">Library</li>
          <li className="leftBar_recommend-item item3">Radio Station</li>
          <li className="leftBar_recommend-item item4">Music Video</li>
        </ul>
      </div>
      <div className="leftBar_mymusic">
        <span className="leftBar_title2">My music</span>
        <ul>
          <li className="leftBar_mymusic-item">Liked song</li>
          <li className="leftBar_mymusic-item">Album</li>
          <li className="leftBar_mymusic-item">Artist</li>
          <li className="leftBar_mymusic-item">Recent</li>
        </ul>
      </div>
      <div className="leftBar_playlist">
        <span className="leftBar_title2">Playlist</span>
        <ul>
          <li className="leftBar_playlist-item">Hip-hop</li>
          <li className="leftBar_playlist-item">Jazz</li>
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/components/Header/Header.tsx`** (static — the search input has zero wired behavior in the original; ported as decorative, matching original exactly)

```tsx
export function Header() {
  return (
    <header>
      <div className="search">
        <i className="fa-regular fa-magnifying-glass" /> <input type="text" placeholder="Start search here" />
      </div>
      <div className="account" />
    </header>
  )
}
```

- [ ] **Step 3: Final composition in `src/App.tsx`** (DOM order matches original `index.html` exactly: leftBar → container[header, TopSong, RecentPlayed] → rightBar[ListArtist, AnotherSong] → PlayerBar)

```tsx
import { PlayerProvider } from './player/PlayerContext'
import { LeftBar } from './components/LeftBar/LeftBar'
import { Header } from './components/Header/Header'
import { TopSong } from './components/TopSong/TopSong'
import { RecentPlayed } from './components/RecentPlayed/RecentPlayed'
import { ListArtist } from './components/ListArtist/ListArtist'
import { AnotherSong } from './components/AnotherSong/AnotherSong'
import { PlayerBar } from './components/PlayerBar/PlayerBar'

function App() {
  return (
    <PlayerProvider>
      <div id="allPage" className="allPage">
        <div className="main">
          <LeftBar />
          <div className="container">
            <Header />
            <TopSong />
            <RecentPlayed />
          </div>
          <div className="rightBar">
            <ListArtist />
            <AnotherSong />
          </div>
        </div>
      </div>
      <PlayerBar />
    </PlayerProvider>
  )
}

export default App
```

- [ ] **Step 4: Run the full test suite + build**

```bash
npm run test
npm run lint
npm run build
```

Expected: all tests pass, no lint errors, build succeeds.

- [ ] **Step 5: Manual side-by-side visual check**

Open `music-mp3` (`npm run dev`) and `../musicpage/index.html` side by side at the same window width.
Expected: identical layout, spacing, colors, fonts, icons at desktop width.

- [ ] **Step 6: Commit**

```bash
git add src/components/LeftBar src/components/Header src/App.tsx
git commit -m "feat: static shell (left sidebar, header) and full page composition"
```

---

## Task 7: Mobile/responsive QA pass

No new features — verifies the `window.matchMedia` mobile detection (Global Constraints decision) actually reproduces the original's mobile layout and the another-song pool size switch (4 → 8 items).

- [ ] **Step 1: Add a reducer/engine-level test confirming pool size follows `isMobile`**

Add to a new `src/player/usePlayerEngine.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PlayerProvider } from './PlayerContext'
import { AnotherSong } from '../components/AnotherSong/AnotherSong'

describe('usePlayerEngine — responsive pool size', () => {
  it('uses 8 items when the viewport matches the mobile media query', () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia

    const { getAllByTestId } = render(
      <PlayerProvider>
        <AnotherSong />
      </PlayerProvider>,
    )
    expect(getAllByTestId('another-song-item')).toHaveLength(8)
  })
})
```

- [ ] **Step 2: Run test to verify it fails, then confirm the Task-4/5 implementation already satisfies it**

Run: `npm run test -- usePlayerEngine`
Expected: PASS immediately — this test documents/locks in behavior implemented in Tasks 4-5, no new implementation code needed. If it fails, the pool-size effect from Task 4 Step 7 needs the `state.isMobile` dependency fixed.

- [ ] **Step 3: Manual responsive QA checklist**

Run: `npm run dev`, resize the browser window (not just device toolbar zoom — actual viewport width) across the 738px breakpoint.
Expected, matching `../musicpage/style.css`'s `@media (max-width: 46.1875em)` block:
- [ ] Left sidebar hides
- [ ] Player bar's song name/artist text and volume control hide; only transport controls remain
- [ ] Top song list switches to `flex-direction: column`
- [ ] Recent-played row hides, artist list hides, their titles hide
- [ ] Container goes full width
- [ ] Another-song widget becomes scrollable with a fixed height

- [ ] **Step 4: Commit**

```bash
git add src/player/usePlayerEngine.test.tsx
git commit -m "test: lock in responsive another-song pool size behavior"
```

---

## Self-Review Notes

- **Spec coverage**: Global Constraints items (CSS verbatim, assets verbatim, mobile-detect decision, song-end-detect decision, no backend) are each addressed in Task 1 (assets/CSS) and Task 5 (song-end) / Task 1 usePlayerEngine (mobile). Every original interactive element (play/pause, seek, volume, mute, repeat, random, top-song list, artist list, recent-played, another-song, next/back in all 3 modes) has a task. The non-functional search box and static left sidebar are explicitly covered in Task 6 as intentionally inert.
- **Placeholder scan**: none — every step has runnable code or an exact shell command.
- **Type consistency**: `PlayerAction`/`PlayerState` fields introduced in Task 1 are reused with identical names through Task 7 (`artistSongGlobalIndex`, `anotherSongPool`, `randomQueue`, etc. — no renames across tasks).
