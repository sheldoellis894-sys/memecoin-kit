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
| Server function of the agent tool | `api/inspect.js`, `api/_agent/` |

## What is included

| | Options |
|---|---|
| Themes | `mine` (warm dark, rounded cards), `sunset` (pixel fonts, square panels, hard shadows; flavor `arcade`), `office` (paper sheets on a dark wooden desk; flavor `paper`), `sky` (light sky, white cards with thick outlines; flavor `app`), `riso` (a two-ink print on cream paper; flavor `press`), `concrete` (light concrete, dark steel and one signal color; flavor `vault`), `steak` (cream paper, a red cover, dark brown ink and a green accent; flavor `guide`) |
| Layouts | `longread`, `arcade` (boot screen + title-screen hero), `contract` (the site is a document: numbered sheets, folder tabs, a signature at the end), `delivery` (the site is a food-delivery app on a phone screen), `press` (the site is a printing press, the visitor is a sheet of paper going through it), `vault` (the site is a vault door with ten locks, every section is one lock), `guide` (the site is a restaurant guide, every section is a page of it; the tool is an agent on the server) |
| Sections | `header`, `hero`, `heroArcade`, `boot`, `marquee`, `about`, `digGame`, `chaseGame`, `howToBuy`, `tokenomics`, `gallery`, `roadmap`, `footer` |
| Sections of `contract` | `paperFx`, `paperTabs`, `bossGrow`, `paperCover`, `paperClauses`, `feedGame`, `paperDuties`, `paperPayroll`, `deskPhotos`, `paperOrders`, `paperSign`, `paperFooter` (in `src/sections/paper/`) |
| Sections of `delivery` | `appShell`, `appHome`, `appMap`, `appCourier`, `appChat`, `stopGame`, `appRate`, `appCheckout`, `appReceipt`, `appStories`, `appNext`, `appOrder`, `appFooter` (in `src/sections/app/`) |
| Sections of `press` | `pressShell`, `pressHero`, `pressAbout`, `pressStudio`, `pressWorkout`, `pressInk`, `pressLine`, `pressShifts`, `pressBuy`, `pressFooter` (in `src/sections/press/`) |
| Sections of `vault` | `vaultShell`, `vaultHero`, `vaultWhy`, `vaultSplit`, `vaultHolders`, `vaultSteps`, `vaultRack`, `vaultCells`, `vaultPlan`, `vaultRules`, `vaultDoor`, `vaultFooter` (in `src/sections/vault/`) |
| Sections of `guide` | `guideShell`, `guideCover`, `guideAbout`, `guideStars`, `guideInspect`, `guideHolders`, `guideBook`, `guideLabel`, `guidePlates`, `guideEditions`, `guideRules`, `guideReserve`, `guideFooter` (in `src/sections/guide/`) |
| Tools | `pressStudio` (meme maker: base picture, two-ink print filter, captions, stickers, print, download, share; config key `studio`), `vaultSplit` (creator-fee split calculator: up to ten recipients, checks, SOL breakdown, a sealed sheet as a picture; config key `split`), `guideInspect` (an agent on the server reads a wallet's trades and files a starred review, shown as a guide card and a picture; config key `inspect`, function `api/inspect.js`) |
| Games | `digGame` (pick a tile, config key `game`), `chaseGame` (side-scrolling runner, config key `chase`), `feedGame` (catch falling food, config key `feed`), `stopGame` (brake exactly at the door, config key `stop`) |

## The agent function

`api/inspect.js` is a Vercel Function deployed together with the site. It answers only for projects that have a persona in `api/_agent/persona.js` (the project is taken from the same `PROJECT` variable), so the other sites of this repository are not affected.

Environment variables of the Vercel project: `LLM_API_KEY` (language model API key), `HELIUS_API_KEY` (Solana data) or `SOLANA_RPC_URL`; optional `LLM_MODEL`, `AGENT_PER_IP`, `AGENT_DAILY_CAP`. Keys never go into the repository.

`npm run dev` does not run the function: the tool then says the kitchen is closed and offers the sample entry from the config.

## Images

`npm run dev` and `npm run build` copy `brand/` into `public/project/` first.
Not copied: the `docs/` folder and files named `*_raw.*`.
With `"images": { "optimize": true }` in the config, big pictures are shrunk and recompressed on the way; originals are not touched.

## New site in 5 steps

1. Copy `projects/molty`, `projects/tsc3000`, `projects/fch`, `projects/goosini`, `projects/inkmaxx`, `projects/tenkeys` or `projects/chefrekt` → `projects/<name>`, replace images in `brand/`.
2. Edit `project.config.json` (texts, links, image paths).
3. Pick `theme` and `layout` in the config.
4. `$env:PROJECT="<name>"; npm run dev -- --host 127.0.0.1` — check on desktop and phone widths.
5. Deploy: new Vercel project → Root Directory `templates/landing` → env var `PROJECT=<name>`.
