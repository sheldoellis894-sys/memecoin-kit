# Landing template (Astro + Tailwind)

One codebase, many sites. A site = project config + theme + layout.

## Commands (run inside templates/landing)

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (once) |
| `npm run dev` | Local site at http://localhost:4321, auto-refresh on changes |
| `npm run build` | Production build into `dist/` |

Project is chosen by the `PROJECT` variable (default `molty`).
Windows PowerShell: `$env:PROJECT="molty"; npm run dev`

## Where things live

| What | File |
|---|---|
| Texts, links, CA, images | `../../projects/<name>/project.config.json` |
| Images | `../../projects/<name>/brand/` (paths in config are relative to it) |
| Colors, fonts, roundness | `src/themes/<theme>.json` |
| Which sections and their order | `src/layouts/<layout>.json` |
| Section markup | `src/sections/*.astro` |

## New site in 5 steps

1. Copy `projects/molty` → `projects/<ticker>`, replace images in `brand/`.
2. Edit `project.config.json` (texts, links, image paths).
3. Pick `theme` and `layout` in the config.
4. `$env:PROJECT="<ticker>"; npm run dev` — check.
5. Deploy: new Vercel project → Root Directory `templates/landing` → env var `PROJECT=<ticker>`.
