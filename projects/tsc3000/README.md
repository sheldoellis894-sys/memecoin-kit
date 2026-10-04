# Turbo Shiba Cop 3000 ($TSC3000) — launch-ready memecoin package

A complete wrapper for a Solana memecoin: character, brand kit, website with a playable game,
X profile, Telegram community and a launch package for pump.fun and DexScreener.

![Turbo Shiba Cop 3000 website](case/01_site_hero.png)

| | |
|---|---|
| **Type** | Memecoin, dogs + retro games and VHS action movies |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | 5.5 hours, measured step by step (see `brand/docs/tsc3000_timelog.md`) |
| **Role** | Solo: brand, visuals, front-end, socials, community setup |
| **Website** | https://turboshibacop.vercel.app |
| **X** | https://x.com/turboshibacop |
| **Telegram** | https://t.me/turboshibacop |

## Idea

**Turbo Shiba Cop 3000** is a 16-bit game from 1994 that nobody ever played. The cartridge has just turned up.
Its hero, Turbo, is a dog cop from the year 3000 who patrols Solana and chases a cat that steals rugs.

- Slogan: *You have the right to remain silent. He has the right to bark.*
- Voice: the narrator of a 1980s action movie trailer. Third person, short lines, total seriousness about absurd things.
- Signature props: a pink donut he treats more seriously than his badge, and a sunset reflected in his mirrored shades.

The whole project plays one joke consistently: the site boots like an old console, the hero section is a title screen,
the mini-game is the "lost game" itself, the roadmap is a list of levels.

## 1. Character

One character, the same in every image: a small fluffy Shiba Inu head on an action-hero body, police cap,
mirrored aviators, torn-off sleeves, gold star badge, chrome collar, a toothpick and a pink donut.

| Main reference | Turnaround | Emotions |
|---|---|---|
| ![Main](brand/references/tsc3000_main.jpg) | ![Turnaround](brand/references/tsc3000_turnaround.jpg) | ![Emotions](brand/references/tsc3000_emotions.jpg) |

Scenes for the website gallery and for posts. Recurring cast: the rug cat, the bear in a suit, the nervous hamster.

| | | |
|---|---|---|
| ![g01](brand/gallery/tsc3000_g01.jpg) | ![g02](brand/gallery/tsc3000_g02.jpg) | ![g04](brand/gallery/tsc3000_g04.jpg) |
| ![g05](brand/gallery/tsc3000_g05.jpg) | ![g06](brand/gallery/tsc3000_g06.jpg) | ![g09](brand/gallery/tsc3000_g09.jpg) |

Four more scenes are in `brand/gallery/`.

Game sprites with a transparent background: two run frames, jump, crash, the rival, the pickup and three obstacles.

<p>
  <img src="brand/stickers/tsc3000_run1.png" height="130" alt="Run, frame 1">
  <img src="brand/stickers/tsc3000_run2.png" height="130" alt="Run, frame 2">
  <img src="brand/stickers/tsc3000_jump.png" height="140" alt="Jump">
  <img src="brand/stickers/tsc3000_crash.png" height="110" alt="Crash">
  <img src="brand/stickers/tsc3000_cat.png" height="105" alt="The rug cat">
  <img src="brand/stickers/tsc3000_donut.png" height="50" alt="Donut">
  <img src="brand/stickers/tsc3000_barrier.png" height="60" alt="Barrier">
  <img src="brand/stickers/tsc3000_hydrant.png" height="62" alt="Hydrant">
  <img src="brand/stickers/tsc3000_carpet.png" height="66" alt="Rug">
</p>

## 2. Brand kit

Palette "Sunset and chrome", taken from 1980s action movie posters.

| Element | Value |
|---|---|
| Background | `#1A0B2E` |
| Primary | `#FF6B1A` |
| Secondary | `#E0218A` |
| Accent | `#CFE8FF` |
| Headings and ticker | Press Start 2P |
| Body | VT323 |

The ticker is always set in the heading font, so the `$` sign matches the letters next to it.
On pictures, text is white with a dark outline: it stays readable on a busy sunset.

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/tsc3000_avatar.png` | 1000×1000 | Token image, X and Telegram avatar |
| `brand/exports/tsc3000_avatar_circle.png` | 1000×1000 | Round logo |
| `brand/exports/tsc3000_avatar_circle_256.png` | 256×256 | Site logo, favicon |
| `brand/exports/tsc3000_x_header.png` | 1500×500 | X header |
| `brand/exports/tsc3000_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/tsc3000_og.png` | 1200×630 | Link preview, Telegram portal |

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://turboshibacop.vercel.app

- Boot screen: lines appear like an old console starting up, then "Press start". Shown once per tab.
- Hero as a game title screen. On a phone the picture comes first in full view, the text follows.
- Sections: running band, the story of the lost cartridge, mini-game, how to buy, tokenomics, moving gallery, roadmap, footer.
- Contract address block with a copy button. Before launch it shows a placeholder.
- Static site, mobile-ready, auto-deploy on every push. Images are shrunk at build time: 27 MB of originals become 7 MB on the site.

### Mini-game "Chase the cat"

A one-button side-scrolling runner. Turbo runs after the cat, jumps over barriers, hydrants and rugs and collects donuts.
Space, arrow up or a tap is a jump. The speed grows, the best distance is remembered, the result can be shared on X.

- Canvas, no libraries. The skyline, the sunset and the neon street are drawn by code from the theme colors.
- Everything else comes from the project config: sprites, texts, labels. The game can be reused for another mascot.
- Checked with an automated player on desktop and phone sizes: every obstacle can be cleared up to the top speed.

| Mini-game | Mobile |
|---|---|
| ![Game](case/03_site_game.png) | <img src="case/04_site_mobile.png" width="260" alt="Mobile"> |

Full page: [case/02_site_full.png](case/02_site_full.png)

### Reusable template

The site is built from a template that lives in `templates/landing`.
A new site needs no code changes:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius, overall look. This project uses the `sunset` theme.
3. A layout file — which sections to show and in what order. This project uses the `arcade` layout.

```
cd templates/landing
npm install
PROJECT=tsc3000 npm run dev
PROJECT=tsc3000 npm run build
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post with a warning: no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md).
- No price talk, no promises and no safety claims in any post.

<img src="case/05_x_profile.png" width="420" alt="X profile">

## 5. Telegram

- Public channel with a verification portal, private group for the chat.
- **Safeguard** — portal: entry to the group only after verification.
- **Rose** — welcome message with buttons, math captcha, locks for links, forwards and bots, antiflood, automatic antiraid.
- Every setting is confirmed with the bots' own status commands, and the full entry path is tested with a second account.
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
projects/tsc3000/
  project.config.json   texts, links, images for the site
  brand/                references, logo, banners, exports, gallery, stickers, docs
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
```

## Not done on purpose

- The token is not created. This project is a complete launch package.
- No animation in this project: video is planned for the next ones.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$TSC3000 is a meme project made for fun. It is not an investment and not financial advice.

## Contact

**cosa_nostra** — Telegram: [@insider_gang](https://t.me/insider_gang)
