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
