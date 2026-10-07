# Fat Cat Holdings ($FCH) — launch-ready memecoin package

A complete wrapper for a Solana memecoin: character, brand kit, animation, a website built as an employment agreement
with a playable game, X profile, Telegram community and a launch package for pump.fun and DexScreener.

![Fat Cat Holdings website](case/01_site_hero.png)

| | |
|---|---|
| **Type** | Memecoin, cats + corporate office and an employment agreement |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | Under 5 hours, measured step by step (see `brand/docs/fch_timelog.md`) |
| **Role** | Solo: brand, visuals, animation, front-end, socials, community setup |
| **Website** | https://fatcatholdings.vercel.app |
| **X** | https://x.com/fatcatholdings |
| **Telegram** | https://t.me/fatcatholdings |

## Idea

**Fat Cat Holdings** is a company run by one very large cat. He is the chairman, the board of directors
and the only one who eats first. The visitor is not his owner. The visitor is his staff.

- Slogan: *You don't own the cat. You work for him.*
- Second line: *He's not fat. He's accumulating.*
- Voice: "the Management". The cat speaks about himself in the third person, in the language of memos, orders and incident reports. Short resolutions in red pen on top: "Denied.", "Approved.", "Faster."
- Signature props: a rubber stamp he uses without looking, a green jacket that no longer closes, a red tie that is too short.

The whole project plays one joke consistently: the site is the employment agreement itself, the sections are its clauses,
the mini-game is the lunch of the Management, the roadmap is a list of orders, and at the end the visitor has to sign.

## 1. Character

One character, the same in every image: a huge round black-and-white cat with a small head and a stone face,
in a green jacket with brass buttons and a short red tie. Shot like a corporate photo from the 1990s: flash, film grain, a look into the camera.

| Main reference | Turnaround | Emotions |
|---|---|---|
| ![Main](brand/references/fch_main.jpg) | ![Turnaround](brand/references/fch_turnaround.jpg) | ![Emotions](brand/references/fch_emotions.jpg) |

Scenes from the office, for the website and for posts. The recurring cast is the staff in grey suits.

| | | |
|---|---|---|
| ![Stuck in the doorway](brand/gallery/fch_g05.jpg) | ![On the keyboard](brand/gallery/fch_g01.jpg) | ![In the elevator](brand/gallery/fch_g06.jpg) |
| ![The mug](brand/gallery/fch_g02.jpg) | ![On the photocopier](brand/gallery/fch_g04.jpg) | ![The second mug](brand/gallery/fch_g03.jpg) |

Game sprites with a transparent background: three poses of the Boss, four dishes and two things he must not catch.

<p>
  <img src="brand/stickers/fch_boss_open.png" height="150" alt="The Boss, mouth open">
  <img src="brand/stickers/fch_boss_chew.png" height="150" alt="The Boss, chewing">
  <img src="brand/stickers/fch_boss_hit.png" height="150" alt="The Boss, offended">
  <img src="brand/stickers/fch_item_sardine.png" height="46" alt="Sardine">
  <img src="brand/stickers/fch_item_sausage.png" height="56" alt="Sausage">
  <img src="brand/stickers/fch_item_can.png" height="60" alt="Can">
  <img src="brand/stickers/fch_item_chicken.png" height="66" alt="Chicken leg">
  <img src="brand/stickers/fch_item_cucumber.png" height="60" alt="Cucumber">
  <img src="brand/stickers/fch_item_clock.png" height="64" alt="Alarm clock">
</p>

### Animation

A 6-second clip, 1080p: the Management approves the agreement without reading it and leaves a red paw print.
It is the pinned post on X, and a silent 290 KB loop of it plays on the first sheet of the website.

[![The Management approves the agreement](brand/video/fch_v02.jpg)](brand/video/fch_v02.mp4)

Files: `brand/video/fch_v02.mp4` (full quality, for posts), `brand/video/fch_v02_web.mp4` (silent loop for the site).

## 2. Brand kit

Palette "The director's office": dark wood, paper, green cloth, brass and red ink.

| Element | Value |
|---|---|
| Desk (background) | `#2E1F17` |
| Paper | `#F3E9D2` |
| Text | `#1E1A16` |
| Primary, green cloth | `#1F5C45` |
| Secondary, brass | `#C9A227` |
| Accent, red ink | `#C4302B` |
| Headings and ticker | Playfair Display Black |
| Body, the text of the agreement | Courier Prime |
| Red-pen notes | Caveat Bold |

The ticker is always set in the heading font, so the `$` sign matches the letters next to it.
Text on pictures has a dark outline placed outside the letters, so it stays readable on a busy photo.

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/fch_avatar.png` | 1000×1000 | Token image, X and Telegram avatar |
| `brand/exports/fch_avatar_circle.png` | 1000×1000 | Round logo |
| `brand/exports/fch_avatar_circle_256.png` | 256×256 | Site logo, favicon |
| `brand/exports/fch_x_header.png` | 1500×500 | X header |
| `brand/exports/fch_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/fch_og.png` | 1200×630 | Link preview, Telegram portal |

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://fatcatholdings.vercel.app

The site is a document. Seven sheets of paper lie on a dark wooden desk: a cover on company letterhead, four sections,
an appendix with the game and a sheet of orders. Each sheet has punch holes, a page number and sometimes a coffee ring.

What happens on the page:

- **The Boss gains weight.** He stands at the edge of the page and grows while the visitor scrolls, from 6.5 to 31.4 kg. On a wide screen he pushes the column of sheets aside. On a phone he peeks from the corner and leaves after a tap.
- **A stamp on every click.** Any click on the page leaves a red paw print with the word "APPROVED". The stamps pile up.
- **Red pen.** Resolutions write themselves when a clause scrolls into view. Inconvenient clauses get struck through: *Vacation: 28 days.* Denied.
- **Blacked-out text.** Black bars over parts of the agreement open on hover or tap.
- **Fine print.** A footnote too small to read, with a magnifying glass instead of the cursor.
- **Folder tabs.** The menu is a row of coloured tabs at the side of the folder.
- **Photographs on the desk.** The gallery is a pile of photos. They can be dragged around, and a click flips a photo to show the note on the back.
- **Signature.** On the last sheet the visitor signs with a mouse or a finger. The stamp lands, the visitor is "Hired", and the buy button appears.

Also on the site: a contract address block with a copy button on two sheets (before launch it shows a placeholder),
how to buy as "Duties of the Staff", tokenomics as "Payroll", the roadmap as three orders of the Management.

Static site, checked at five widths from 360 to 1440 px, auto-deploy on every push. The effects respect the system
"reduce motion" setting, and without JavaScript the page stays a readable document.
Images are shrunk at build time: 45 MB of originals become 9 MB on the site.

### Mini-game "Lunch of the Management"

Food falls from above, the Boss moves left and right and catches it. One round is 40 seconds, the score is counted in kilograms.

- Sardine 1 kg, sausage 2 kg, can 3 kg, chicken leg 4 kg. With every catch the Boss gets wider.
- The cucumber takes 4 kg away, the alarm clock takes 5 seconds away.
- Mouse, finger or arrow keys. The record is remembered, the result can be shared on X.
- Canvas, no libraries. The game pauses when it leaves the screen or the tab is hidden.
- Everything comes from the project config: sprites, points, round length, texts. The game can be reused for another mascot.
- Checked with an automated player on desktop and phone sizes.

| The game and the duties | Payroll and the photographs | Orders and signatures |
|---|---|---|
| ![Game](case/03_site_game.png) | ![Photographs](case/02_site_photos.png) | ![Signatures](case/08_site_sign.png) |

### Reusable template

The site is built from a template that lives in `templates/landing`.
A site is three files:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius, overall look. This project uses the `office` theme.
3. A layout file — which sections to show and in what order. This project uses the `contract` layout.

Red-pen notes, strike-throughs and blacked-out words are written right in the config texts with three short marks,
so another document-style site needs new texts and pictures only.

```
cd templates/landing
npm install
PROJECT=fch npm run dev
PROJECT=fch npm run build
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post: the stamp animation and a warning that no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md).
- No price talk, no promises and no safety claims in any post. "Accumulating" is about the weight of the cat.

<img src="case/05_x_profile.png" width="420" alt="X profile">

## 5. Telegram

- Public channel with a verification portal, private group for the chat.
- **Safeguard** — portal: entry to the group only after verification.
- **Rose** — welcome message with buttons, math captcha, locks for links, forwards and bots, antiflood, automatic antiraid.
- The settings are checked with the bots' own status commands, and the full entry path is tested with a second account.
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
| Website | Astro, Tailwind CSS, TypeScript, Canvas |
| Hosting | Vercel, auto-deploy from GitHub |
| Design | Figma |
| Community | Telegram, Rose, Safeguard |

## Folder structure

```
projects/fch/
  project.config.json   texts, links, images for the site
  brand/                references, logo, banners, exports, gallery, stickers, video, docs
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
```

## Not done on purpose

- The token is not created. This project is a complete launch package.
- The video is not used in the pump.fun form: its 16:9 frame does not fit the 3:1 banner. The form takes the image and the banner, the video goes to X and to the site.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$FCH is a meme project made for fun. It is not an investment and not financial advice.
The employment agreement is a joke: nobody is hired and nobody is paid.

## Contact

**cosa_nostra** — Telegram: [@insider_dev](https://t.me/insider_dev)
