# Landing template (Astro + Tailwind)

One codebase, many sites. A site = project config + theme + layout.
Step-by-step guide in Russian: `../../docs/how-to-stamp-a-site.md`.

## Commands (run inside templates/landing)

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (once) |
| `npm run dev` | Local site at http://localhost:4321, auto-refresh on changes |
| `npm run build` | Production build into `dist/` |

Project is chosen by the `PROJECT` variable (default `molty`).
Windows PowerShell: `$env:PROJECT="tsc3000"; npm run dev -- --host 127.0.0.1`

## Where things live

| What | File |
|---|---|
| Texts, links, CA, images | `../../projects/<name>/project.config.json` |
| Images | `../../projects/<name>/brand/` (paths in config are relative to it) |
| Colors, fonts, roundness, flavor | `src/themes/<theme>.json` |
| Which sections and their order | `src/layouts/<layout>.json` |
| Section markup | `src/sections/*.astro` |

## What is included

| | Options |
|---|---|
| Themes | `mine` (warm dark, rounded cards), `sunset` (pixel fonts, square panels, hard shadows; flavor `arcade`), `office` (paper sheets on a dark wooden desk; flavor `paper`), `sky` (light sky, white cards with thick outlines; flavor `app`), `riso` (a two-ink print on cream paper; flavor `press`) |
| Layouts | `longread`, `arcade` (boot screen + title-screen hero), `contract` (the site is a document: numbered sheets, folder tabs, a signature at the end), `delivery` (the site is a food-delivery app on a phone screen), `press` (the site is a printing press, the visitor is a sheet of paper going through it) |
| Sections | `header`, `hero`, `heroArcade`, `boot`, `marquee`, `about`, `digGame`, `chaseGame`, `howToBuy`, `tokenomics`, `gallery`, `roadmap`, `footer` |
| Sections of `contract` | `paperFx`, `paperTabs`, `bossGrow`, `paperCover`, `paperClauses`, `feedGame`, `paperDuties`, `paperPayroll`, `deskPhotos`, `paperOrders`, `paperSign`, `paperFooter` (in `src/sections/paper/`) |
| Sections of `delivery` | `appShell`, `appHome`, `appMap`, `appCourier`, `appChat`, `stopGame`, `appRate`, `appCheckout`, `appReceipt`, `appStories`, `appNext`, `appOrder`, `appFooter` (in `src/sections/app/`) |
| Sections of `press` | `pressShell`, `pressHero`, `pressAbout`, `pressStudio`, `pressWorkout`, `pressInk`, `pressLine`, `pressShifts`, `pressBuy`, `pressFooter` (in `src/sections/press/`) |
| Tools | `pressStudio` (meme maker: base picture, two-ink print filter, captions, stickers, print, download, share; config key `studio`) |
| Games | `digGame` (pick a tile, config key `game`), `chaseGame` (side-scrolling runner, config key `chase`), `feedGame` (catch falling food, config key `feed`), `stopGame` (brake exactly at the door, config key `stop`) |

## Images

`npm run dev` and `npm run build` copy `brand/` into `public/project/` first.
Not copied: the `docs/` folder and files named `*_raw.*`.
With `"images": { "optimize": true }` in the config, big pictures are shrunk and recompressed on the way; originals are not touched.

## New site in 5 steps

1. Copy `projects/molty`, `projects/tsc3000`, `projects/fch`, `projects/goosini` or `projects/inkmaxx` → `projects/<name>`, replace images in `brand/`.
2. Edit `project.config.json` (texts, links, image paths).
3. Pick `theme` and `layout` in the config.
4. `$env:PROJECT="<name>"; npm run dev -- --host 127.0.0.1` — check on desktop and phone widths.
5. Deploy: new Vercel project → Root Directory `templates/landing` → env var `PROJECT=<name>`.
