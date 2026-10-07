# Inkmaxx ($INKMAXX) — launch-ready utility token package

A complete wrapper for a Solana token with a working product: a meme maker that runs in the browser.
Character, brand kit, a website built as a printing press, X profile, Telegram community
and a launch package for pump.fun and DexScreener.

![The meme press on the Inkmaxx website](case/03_site_press.png)

| | |
|---|---|
| **Type** | Utility token: a meme press in the browser |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | 3.5 hours, measured step by step (see `brand/docs/inkmaxx_timelog.md`) |
| **Role** | Solo: brand, visuals, front-end, socials, community setup |
| **Website** | https://inkmaxxing.vercel.app |
| **X** | https://x.com/inkmaxxing |
| **Telegram** | https://t.me/inkmaxxing |

## Idea

Central banks print money. **Inkmaxx** prints memes. The product is a meme press: pick a picture,
turn it into a two-ink print, add a caption and stickers, download it or share it.

The press is run by **Maxx**, an octopus with eight arms and zero days off, who talks like a productivity coach.

- Slogan: *Eight arms. Zero days off. Your meme is already printing.*
- Second line: *His ink. Your memes.*
- Voice: "productivity coach". A motivational blogger who never sleeps and has no patience for laziness: "You sleep eight hours. He works eight arms."
- Signature props: a yellow sweatband, a coach whistle, a paint roller, a rubber stamp, a paper cup of coffee.
- Recurring cast: tiny pink crabs, his interns. A crab has two claws, and inspiration is for people with two arms.

What the token is for: everyone can print, with a small site tag in the corner of the sheet.
Holders print clean sheets and get a third ink and the full sticker set.
There is no token yet, so the site has a "Holder preview" switch that shows the holder mode without a wallet check.
The real balance check is on the roadmap and is not built.

The whole project plays one joke consistently: the site is a printing press and the visitor is a sheet of paper going through it.

## 1. Character

One character, the same in every image: an octopus with a huge, wide, round blue head and a tiny tired face low on it.
Drawn as a risograph print: riso blue and fluorescent pink with a little yellow on cream paper,
a dark blue outline, halftone dot shading and visible paper grain.

| Main reference | Turnaround | Emotions |
|---|---|---|
| ![Main](brand/references/inkmaxx_main.jpg) | ![Turnaround](brand/references/inkmaxx_turnaround.jpg) | ![Emotions](brand/references/inkmaxx_emotions.jpg) |

Scenes for the website gallery and for posts. The same pictures are the ready-made bases in the meme press.

| | | |
|---|---|---|
| ![Six sheets at once](brand/gallery/inkmaxx_g01.jpg) | ![4 a.m.](brand/gallery/inkmaxx_g02.jpg) | ![The whistle](brand/gallery/inkmaxx_g03.jpg) |
| ![Arm day](brand/gallery/inkmaxx_g04.jpg) | ![Drying line](brand/gallery/inkmaxx_g07.jpg) | ![Sleep mode](brand/gallery/inkmaxx_g08.jpg) |

Stickers for the meme press, with a transparent background: eight poses in one size.

<p>
  <img src="brand/stickers/inkmaxx_s01.png" height="150" alt="Maxx blows his whistle">
  <img src="brand/stickers/inkmaxx_s02.png" height="150" alt="Maxx points at you">
  <img src="brand/stickers/inkmaxx_s03.png" height="150" alt="Maxx hides his face">
  <img src="brand/stickers/inkmaxx_s04.png" height="150" alt="Maxx flexes">
  <img src="brand/stickers/inkmaxx_s05.png" height="150" alt="Maxx holds a blank sheet">
  <img src="brand/stickers/inkmaxx_s06.png" height="150" alt="Maxx with six cups of coffee">
  <img src="brand/stickers/inkmaxx_s07.png" height="150" alt="Maxx lifts a paint roller">
  <img src="brand/stickers/inkmaxx_s08.png" height="150" alt="Maxx gives a slow clap">
</p>

## 2. Brand kit

Palette "Risograph": two inks and a touch of a third on cream paper.

| Element | Value |
|---|---|
| Paper (background) | `#F2EBDD` |
| Sheets | `#FBF7EE` |
| Text and outlines | `#1A1A2E` |
| First ink, riso blue | `#2440D8` |
| Second ink, fluorescent pink | `#FF4F8B` |
| Accent, yellow | `#FFD23F` |
| Headings and ticker | Dela Gothic One |
| Body | Manrope |

The ticker is always set in the heading font, so the `$` sign matches the letters next to it.
Headings are blue with a pink shadow shifted to the side, like two ink layers printed slightly out of register.

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/inkmaxx_avatar.png` | 1000×1000 | Token image, X and Telegram avatar |
| `brand/exports/inkmaxx_avatar_circle.png` | 1000×1000 | Round logo |
| `brand/exports/inkmaxx_avatar_circle_256.png` | 256×256 | Site logo, favicon |
| `brand/exports/inkmaxx_x_header.png` | 1500×500 | X header |
| `brand/exports/inkmaxx_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/inkmaxx_og.png` | 1200×630 | Link preview, Telegram portal |

Two banners were made for two jobs: a close scene at the press for the site and link previews,
and a chase scene drawn as a strip, where every character fits a 3:1 header.

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://inkmaxxing.vercel.app

The site is a printing press. Every section is a stage of printing: paper loaded, blue ink, pink ink, cutting, print run ready.

![The first screen](case/01_site_hero.png)

What happens on the page:

- **Pictures print in two passes.** A picture appears as the blue layer, then the pink layer slides in from the side and settles into register.
- **The paper path follows the scroll.** A small sheet travels along a rail between rollers, and the stage name changes as sections pass.
- **Print-run counter.** The counter in the top bar turns while the page is scrolled and adds one for every meme printed.
- **The coach is watching.** If the visitor does nothing for five seconds, a note slides in: "You stopped. He printed 8 more while you rested."
- **Arms from the edges.** Every section heading is brought in by an arm that reaches from the edge of the screen.
- **Ink levels.** Tokenomics is four ink cartridges that fill up when they come into view. Two of them are empty on purpose.
- **Today's workout.** "How to buy" is four sets. The coach ticks a set off when it has been read.
- **Print your ticket.** The buy button has to be held down until a sheet with the link slides out of the press. Letting go early pulls the sheet back. Enter and Space work for the keyboard, and there is a plain link under it.

Also on the site: the gallery as a drying line where sheets hang on pegs and sway while the page moves,
the roadmap as a shift schedule with a cancelled day off, a contract address block in two places
(before launch it shows a placeholder).

Static site, checked at five widths from 360 to 1440 px, auto-deploy on every push. The effects respect the system
"reduce motion" setting. Images are shrunk at build time: about 40 MB of originals become under 12 MB on the site.

### The meme press

The tool works entirely in the browser. The visitor's picture never leaves the device.

1. **Paper.** Six ready-made scenes or the visitor's own picture. Any sheet from the gallery can be sent to the press with one tap.
2. **Ink.** A filter turns any picture into a two-ink print: halftone dots on rotated grids, the second ink sampled with a small shift, paper grain on top. It switches on by itself for the visitor's own picture.
3. **Captions.** A top line and a bottom line in the brand font. The size is fitted to the width automatically.
4. **Stickers.** Eight poses. A sticker can be dragged, resized with a handle, flipped and removed. Arrow keys work too.
5. **Print.** The sheet slides out of the machine as a 1080×1080 PNG. "Download" saves it, "Share" hands the picture to the system share sheet where the browser supports it and otherwise opens X with the text ready.

- Canvas, no libraries. The filter is written from scratch: for every pixel it works out how much of each ink is needed, so dark areas print in blue, warm areas in pink and yellow areas in the third ink.
- "Holder preview" removes the corner tag and opens the third ink and all eight stickers.
- Everything comes from the project config: pictures, stickers, ink colours, texts. The tool can be reused for another brand.
- Checked with an automated visitor on desktop and phone sizes: every button, drag, hold and download.

On the screenshot at the top of this page: a photo printed in two inks with a caption and a sticker.

| Ink levels and the workout | The drying line and the shift schedule |
|---|---|
| ![Ink levels](case/02_site_ink.png) | ![Drying line](case/08_site_prints.png) |

The printed ticket with the buy button:

![Print your ticket](case/09_site_ticket.png)

### Reusable template

The site is built from a template that lives in `templates/landing`.
A site is three files:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius, overall look. This project uses the `riso` theme.
3. A layout file — which sections to show and in what order. This project uses the `press` layout.

Stages of the paper path, coach lines, ink levels, shift hours and the whole meme press are plain data in the config,
so another site with a tool needs new texts and pictures only.

```
cd templates/landing
npm install
PROJECT=inkmaxx npm run dev
PROJECT=inkmaxx npm run build
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post: the scene at the press and a warning that no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md). Four of them are scheduled.
- No price talk, no promises and no safety claims in any post. "Print" and "print run" are about memes on paper.

<img src="case/05_x_profile.png" width="420" alt="X profile">

## 5. Telegram

- Public channel with a verification portal, private group for the chat.
- **Safeguard** — portal: entry to the group only after verification.
- **Rose** — welcome message with buttons, locks for links, forwards and bots, antiflood, automatic antiraid.
- One entry check on purpose: the portal. The captcha is kept in reserve for launch day.
- The full entry path is tested with a second account.
- Buy bot is connected on launch day, it needs a contract address.
- Full setup with all commands: [`launch/telegram.md`](launch/telegram.md).

<img src="case/06_tg_portal.png" width="340" alt="Telegram portal">

## 6. Launch package

Everything that is needed on launch day is prepared and checked against the live form:

- [`launch/pumpfun.md`](launch/pumpfun.md) — values for every field of the pump.fun form, file limits, checklist before and after creation.
- [`launch/dexscreener.md`](launch/dexscreener.md) — Enhanced Token Info: images, description, links.
- [`launch/telegram.md`](launch/telegram.md) — launch-day checklist for the community.

On pump.fun nothing can be edited after the coin is created.
That is why the site, X and Telegram are finished first, and the form was filled in a dry run without creating the coin.

| Form | Image and banner |
|---|---|
| ![pump.fun form](launch/pumpfun_form.png) | ![pump.fun preview](launch/pumpfun_preview.png) |

## Stack

| Area | Tools |
|---|---|
| Website | Astro, Tailwind CSS, TypeScript, Canvas, SVG |
| Hosting | Vercel, auto-deploy from GitHub |
| Design | Figma |
| Community | Telegram, Rose, Safeguard |

## Folder structure

```
projects/inkmaxx/
  project.config.json   texts, links, images for the site
  brand/                references, logo, banners, exports, gallery, stickers, docs
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
```

## Not done on purpose

- The token is not created. This project is a complete launch package.
- The wallet check for holders is not built. The site shows the holder mode with a preview switch and says so.
- No animation in this project: the motion is on the site itself.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$INKMAXX is a meme project made for fun. It is not an investment and not financial advice.
The coach is a joke: no coaching, training or printing service is sold. The meme maker is free and runs in the browser.

## Contact

**cosa_nostra** — Telegram: [@insider_dev](https://t.me/insider_dev)
