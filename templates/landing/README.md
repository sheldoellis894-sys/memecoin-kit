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
| Server functions of the agent tools | `api/inspect.js`, `api/issue.js`, `api/issue-run.js`, `api/_agent/` |
| Schedule of the daily agent | `vercel.json` |

## What is included

| | Options |
|---|---|
| Themes | `mine` (warm dark, rounded cards), `sunset` (pixel fonts, square panels, hard shadows; flavor `arcade`), `office` (paper sheets on a dark wooden desk; flavor `paper`), `sky` (light sky, white cards with thick outlines; flavor `app`), `riso` (a two-ink print on cream paper; flavor `press`), `concrete` (light concrete, dark steel and one signal color; flavor `vault`), `steak` (cream paper, a red cover, dark brown ink and a green accent; flavor `guide`), `aura` (a pink–lilac–blue aura background, glass cards, puffy buttons; flavor `wheel`) |
| Layouts | `longread`, `arcade` (boot screen + title-screen hero), `contract` (the site is a document: numbered sheets, folder tabs, a signature at the end), `delivery` (the site is a food-delivery app on a phone screen), `press` (the site is a printing press, the visitor is a sheet of paper going through it), `vault` (the site is a vault door with ten locks, every section is one lock), `guide` (the site is a restaurant guide, every section is a page of it; the tool is an agent on the server), `wheel` (the site is a zodiac wheel; the tool is a horoscope written by an agent on a schedule) |
| Sections | `header`, `hero`, `heroArcade`, `boot`, `marquee`, `about`, `digGame`, `chaseGame`, `howToBuy`, `tokenomics`, `gallery`, `roadmap`, `footer` |
| Sections of `contract` | `paperFx`, `paperTabs`, `bossGrow`, `paperCover`, `paperClauses`, `feedGame`, `paperDuties`, `paperPayroll`, `deskPhotos`, `paperOrders`, `paperSign`, `paperFooter` (in `src/sections/paper/`) |
| Sections of `delivery` | `appShell`, `appHome`, `appMap`, `appCourier`, `appChat`, `stopGame`, `appRate`, `appCheckout`, `appReceipt`, `appStories`, `appNext`, `appOrder`, `appFooter` (in `src/sections/app/`) |
| Sections of `press` | `pressShell`, `pressHero`, `pressAbout`, `pressStudio`, `pressWorkout`, `pressInk`, `pressLine`, `pressShifts`, `pressBuy`, `pressFooter` (in `src/sections/press/`) |
| Sections of `vault` | `vaultShell`, `vaultHero`, `vaultWhy`, `vaultSplit`, `vaultHolders`, `vaultSteps`, `vaultRack`, `vaultCells`, `vaultPlan`, `vaultRules`, `vaultDoor`, `vaultFooter` (in `src/sections/vault/`) |
| Sections of `guide` | `guideShell`, `guideCover`, `guideAbout`, `guideStars`, `guideInspect`, `guideHolders`, `guideBook`, `guideLabel`, `guidePlates`, `guideEditions`, `guideRules`, `guideReserve`, `guideFooter` (in `src/sections/guide/`) |
| Sections of `wheel` | `wheelShell`, `wheelHero`, `wheelIssue`, `wheelAbout`, `wheelHow`, `wheelHolders`, `wheelMoons`, `wheelStars`, `wheelCalendar`, `wheelBubbles`, `wheelPlan`, `wheelRules`, `wheelBall`, `wheelFooter` (in `src/sections/wheel/`) |
| Tools | `pressStudio` (meme maker: base picture, two-ink print filter, captions, stickers, print, download, share; config key `studio`), `vaultSplit` (creator-fee split calculator: up to ten recipients, checks, SOL breakdown, a sealed sheet as a picture; config key `split`), `guideInspect` (an agent on the server reads a wallet's trades and files a starred review, shown as a guide card and a picture; config key `inspect`, function `api/inspect.js`), `wheelIssue` (a horoscope for twelve signs written once a day by an agent on a schedule, with an archive and a picture card; config key `issue`, functions `api/issue.js` and `api/issue-run.js`) |
| Games | `digGame` (pick a tile, config key `game`), `chaseGame` (side-scrolling runner, config key `chase`), `feedGame` (catch falling food, config key `feed`), `stopGame` (brake exactly at the door, config key `stop`) |

## The agent function

`api/inspect.js` is a Vercel Function deployed together with the site. It answers only for projects that have a persona in `api/_agent/persona.js` (the project is taken from the same `PROJECT` variable), so the other sites of this repository are not affected.

Environment variables of the Vercel project: `LLM_API_KEY` (language model API key), `HELIUS_API_KEY` (Solana data) or `SOLANA_RPC_URL`; optional `LLM_MODEL`, `AGENT_PER_IP`, `AGENT_DAILY_CAP`. Keys never go into the repository.

`npm run dev` does not run the function: the tool then says the kitchen is closed and offers the sample entry from the config.

## The scheduled agent

`api/issue-run.js` is called once a day by the Vercel Cron Job from `vercel.json` (06:00 UTC). It runs the agent from `api/_agent/oracle.js`, which reads the last 24 hours of the Solana market from public services (no keys) and the real sky of the day from `api/_agent/sky.js` (where the planets stand, who is retrograde, the phase of the Moon, computed by code), and writes one issue. Scores and planets to blame come from that sky; the model writes the words only. The issue is stored in Vercel Blob (`api/_agent/journal.js`); `api/issue.js` serves the latest issues to the page. Both functions answer only for projects that have an oracle in `api/_agent/oracle.js`.

One issue per UTC day: when today's issue exists the model is not called, so opening `/api/issue-run` by hand costs nothing. Before the scheduled hour it answers `early`. Before an issue is stored, code checks every field (`flawedFields` in `api/_agent/oracle.js`): a field that states the score, gives advice, speaks about the future, or an entry that does not name the planet the chart blames for its sign goes back to the model once; a field that fails twice is replaced by a plain sentence written from the numbers. A failure answers with a short `error` code (`busy`, `model`, `market`, `storage`, `failed`) and a `detail` word such as `http_401_authentication_error`, `never_filed` or `TimeoutError`; the provider's own sentence about a refusal goes to the function log only.

Environment variables of the Vercel project: `LLM_API_KEY`; `BLOB_READ_WRITE_TOKEN` (added by Vercel when a Blob store is connected to the project); optional `BLOB_ACCESS=private`, `CRON_SECRET`, `ISSUE_HOUR_UTC`, `LLM_MODEL`.

Tests without keys: `node tests/issue.test.mjs` (the scheduled agent) and `node tests/agent.test.mjs` (the inspection).

`npm run dev` does not run the functions: the page then shows the sample issue from the config, marked as a sample.

## Images

`npm run dev` and `npm run build` copy `brand/` into `public/project/` first.
Not copied: the `docs/` folder and files named `*_raw.*`.
With `"images": { "optimize": true }` in the config, big pictures are shrunk and recompressed on the way; originals are not touched.

## New site in 5 steps

1. Copy `projects/molty`, `projects/tsc3000`, `projects/fch`, `projects/goosini`, `projects/inkmaxx`, `projects/tenkeys`, `projects/chefrekt` or `projects/horocope` → `projects/<name>`, replace images in `brand/`.
2. Edit `project.config.json` (texts, links, image paths).
3. Pick `theme` and `layout` in the config.
4. `$env:PROJECT="<name>"; npm run dev -- --host 127.0.0.1` — check on desktop and phone widths.
5. Deploy: new Vercel project → Root Directory `templates/landing` → env var `PROJECT=<name>`.
