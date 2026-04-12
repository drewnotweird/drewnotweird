# drewnotweird — project notes for Claude

## Repo structure
Each app lives in `apps/<name>/frontend/` (Vite + React). Deployed via GitHub Actions to Fasthosts shared hosting via FTP, into `htdocs/<name>/`.

## Deployment

### Base path
Every app is served at `/<name>/` not `/`. This requires two things:
1. Vite config must read `base: process.env.VITE_BASE_PATH || '/'` and the workflow must set `VITE_BASE_PATH: /<name>/`
2. **`BrowserRouter` must have `basename={import.meta.env.BASE_URL}`** — without this the router won't match any routes and the page renders blank with no console errors

### Photos / large assets
The deploy workflow skips `.jpg` files by default (they're slow and already on the server after first deploy). Use `workflow_dispatch` with `upload_photos: true` to upload photos. The portfolio workflow has this pattern — copy it.

### FTP
Fasthosts FTP drops connections after ~20 files. Reconnect every 20 uploads. Always use `set_pasv(True)`.

### Vite bin symlink
On this machine, `npm install` sometimes creates `node_modules/.bin/vite` as a plain file instead of a symlink, causing `ERR_MODULE_NOT_FOUND`. Fix: `rm node_modules/.bin/vite && ln -s ../vite/bin/vite.js node_modules/.bin/vite`

## Apps

### bigjuicy
- Physics wall of Tennent's photos using Matter.js
- 3 collision layers (z-index 10/20/30) so photos visually interleave
- Photos in `public/photos/`, listed in `src/data/images.js`
- Background: `#ffc72c`, brand red: `#ce0e2d`, font: Stag
- Drag targets topmost card via `Matter.Query.point` + z-index comparison on mousedown

### pointing
- Photos follow the cursor/touch; hotspots calibrated per photo in `src/data/images.js`

### monstermash
- Match-the-monster card game: generator spins up a monster, player finds it among scattered cards
- 15 levels defined in `src/data/levels.js` (LEVEL_CONFIG array); level config drives both time limit and card count
- Level 1: 10s / 2 cards → Level 15: 1s / 12 cards (see levels.js for full table)
- Game phases per level: `generating → countdown → playing → slapping → celebrating/comparing/timeout → [curtain drops] → next level / home`
- Generator curtain (z-index 50) covers all transitions; slides up on `revealed=true` (0.6s ease-in); slides back down (1s ease-out)
- Button pressed state: yellow (matching machine casing); before press: red; pulsing glow animation on idle button
- Home screen starts at last game monster (stored in `localStorage` key `mm_last_monster`)
- `src/data/monsters.js` — heads/bodies/legs image arrays (3 each); titleHeads/Bodies/Legs for start screen (face 0 & 2 are monsters, face 1 is title)
- Timer: full-screen background wash that expands left→right; green→yellow→red; `mix-blend-mode: color`
- Starburst effect on monster lock: `repeating-conic-gradient` blurred, expanding + rotating (CSS-only)
- Gold spark particles also burst from generator centre on monster lock (`GoldSparks` component in Generator.jsx)
- Cards have no entrance animation — they appear in place before curtain rises
- On wrong mash: non-tapped cards fly off screen (`card--fly-away` + `--fly-dx`/`--fly-dy` CSS custom props)
- On correct mash: green goo particles burst from card centre (`GooSplatter` rendered in HandSlap.jsx, no MASH/WRONG text)
- Success screen: dark teal radial gradient + rotating gold starburst `::before` pseudo-element + confetti particles
- Fail screens (CompareOverlay + TimeoutScreen): dark grey/blue gradient; "GAME OVER" Creepster title; level-dependent Knewave message
  - CompareOverlay: correct card larger than wrong card; "You reached level N" (level >1) or "Better luck next time"
  - TimeoutScreen: no monster card shown; "Your time ran out on level N" (level >1) or "Need to go faster next time"
- Hint text ("Find this monster") fades out as curtain rises — `hintFading`/`hintGone` state in Generator; no abrupt removal
- Info `?` button on StartScreen (top-right, disappears after button pressed) opens a modal overlay with game blurb

## New app checklist
When setting up any new app, always do all of the following before considering it done:
1. `vite.config.js` — `base: process.env.VITE_BASE_PATH || '/'`
2. `BrowserRouter basename={import.meta.env.BASE_URL}`
3. `index.html` — full OG + Twitter card block (title, description, og:image, og:url, og:type, twitter:card, twitter:title, twitter:description, twitter:image). Images go at `https://www.drewnotweird.co.uk/<name>/og-<name>.jpg` and `favicon.png`.
4. Deploy workflow targeting both `.com` and `.co.uk` FTP servers, with `VITE_BASE_PATH: /<name>/` and remote dir `htdocs/<name>/`. Always upload favicon and og image (never skip them). Reconnect every 20 files.
5. `index.html` — add Google Analytics snippet (GA4 ID: `G-TNKV47M2TS`) just before `</head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-TNKV47M2TS"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-TNKV47M2TS');
   </script>
   ```
6. After scaffolding, **prompt the user to add `favicon.png` and `og-<name>.jpg` to `apps/<name>/frontend/public/`** before the first deploy.

## Conventions
- DOM-managed animation (no React state in render loops) — use refs + `requestAnimationFrame`
- Avoid `setInterval` for things that need dynamic rates; use recursive `setTimeout` instead
