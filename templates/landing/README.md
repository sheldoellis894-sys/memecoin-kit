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
| Themes | `mine` (warm dark, rounded cards), `sunset` (pixel fonts, square panels, hard shadows; flavor `arcade`) |
| Layouts | `longread`, `arcade` (boot screen + title-screen hero) |
| Sections | `header`, `hero`, `heroArcade`, `boot`, `marquee`, `about`, `digGame`, `chaseGame`, `howToBuy`, `tokenomics`, `gallery`, `roadmap`, `footer` |
| Games | `digGame` (pick a tile, config key `game`), `chaseGame` (side-scrolling runner, config key `chase`) |

## Images

`npm run dev` and `npm run build` copy `brand/` into `public/project/` first.
Not copied: the `docs/` folder and files named `*_raw.*`.
With `"images": { "optimize": true }` in the config, big pictures are shrunk and recompressed on the way; originals are not touched.

## New site in 5 steps

1. Copy `projects/molty` or `projects/tsc3000` → `projects/<name>`, replace images in `brand/`.
2. Edit `project.config.json` (texts, links, image paths).
3. Pick `theme` and `layout` in the config.
4. `$env:PROJECT="<name>"; npm run dev -- --host 127.0.0.1` — check on desktop and phone widths.
5. Deploy: new Vercel project → Root Directory `templates/landing` → env var `PROJECT=<name>`.
