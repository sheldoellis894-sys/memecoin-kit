# Molty ($MOLTY) — launch-ready memecoin package

A complete wrapper for a Solana memecoin: character, brand kit, website with a mini-game,
X profile, Telegram community and a launch package for pump.fun and DexScreener.

![Molty website](case/01_site_hero.png)

| | |
|---|---|
| **Type** | Memecoin, character + internet animals |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | 2 full working days, from scratch, including the reusable site template |
| **Role** | Solo: brand, visuals, front-end, socials, community setup |
| **Website** | https://molty-ten.vercel.app |
| **X** | https://x.com/moltymole |
| **Telegram** | https://t.me/moltymole |

## Idea

**Molty** is a hard-working mole who digs for gold under Solana, shift after shift.

- Slogan: *Molty knows where the gold is buried.*
- Motto: *WAGMI — We All Go Mining.*
- Voice: a good-natured mine worker, first person, short "shift reports".

## 1. Character

One character, the same in every image: round pink nose, two buck teeth, cocky eyebrows,
yellow hard hat with a headlamp, teal overalls with gold coin buttons.

| Main reference | Turnaround | Emotions |
|---|---|---|
| ![Main](brand/references/molty_main.JPG) | ![Turnaround](brand/references/molty_turnaround.JPG) | ![Emotions](brand/references/molty_emotions.JPG) |

Scenes for the website gallery and for posts:

| | | |
|---|---|---|
| ![g01](brand/gallery/molty_g01.JPG) | ![g02](brand/gallery/molty_g02.JPG) | ![g03](brand/gallery/molty_g03.JPG) |
| ![g04](brand/gallery/molty_g04.JPG) | ![g05](brand/gallery/molty_g05.JPG) | ![g06](brand/gallery/molty_g06.JPG) |

Stickers with a transparent background (used in the mini-game and in Telegram):

<p>
  <img src="brand/stickers/molty_idle.png" width="150" alt="Idle">
  <img src="brand/stickers/molty_gold.png" width="150" alt="Gold">
  <img src="brand/stickers/molty_gem.png" width="150" alt="Gem">
  <img src="brand/stickers/molty_rug.png" width="150" alt="Rug">
</p>

## 2. Brand kit

| Element | Value |
|---|---|
| Background | `#1A1410` |
| Primary | `#FFC93C` |
| Secondary | `#FF7AA8` |
| Accent | `#9B5CFF` |
| Headings | Lilita One |
| Body | Nunito |

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/molty_avatar.png` | 1000×1000 | Token image, X avatar |
| `brand/exports/molty_avatar_circle.png` | 1000×1000 | Site logo, favicon |
| `brand/exports/molty_x_header.png` | 1500×500 | X header |
| `brand/exports/molty_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/molty_og.png` | 1200×630 | Link preview, Telegram portal |

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://molty-ten.vercel.app

- Sections: hero, running ticker, about, mini-game, how to buy, tokenomics, moving gallery, roadmap, footer.
- Mini-game **"Dig with Molty"**: 8 digs on a 4×3 field, gold, gems and rugs, the result can be shared on X.
- Effects: reveal on scroll, parallax in the hero, pickaxe cursor, sparks on click. Each one can be turned off in the config.
- Contract address block with a copy button. Before launch it shows a placeholder.
- Static site, mobile-ready, auto-deploy on every push.

| Mini-game | Mobile |
|---|---|
| ![Game](case/03_site_game.png) | <img src="case/04_site_mobile.png" width="260" alt="Mobile"> |

Full page: [case/02_site_full.png](case/02_site_full.png)

### Reusable template

The site is built from a template that lives in `templates/landing`.
A new site needs no code changes:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius.
3. A layout file — which sections to show and in what order.

```
cd templates/landing
npm install
npm run dev        # PROJECT=molty by default
npm run build
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post with a warning: no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md).
- No price talk and no promises in any post.

![X profile](case/05_x_profile.png)

## 5. Telegram

- Public channel with a verification portal, private group for the chat.
- **Safeguard** — portal: entry to the group only after verification.
- **Rose** — welcome message with buttons, math captcha, locks for links, forwards and bots, antiflood.
- Buy bot is connected on launch day, it needs a contract address.
- Full setup with all commands: [`launch/telegram.md`](launch/telegram.md).

<img src="case/06_tg_portal.png" width="300" alt="Telegram portal">

## 6. Launch package

Everything that is needed on launch day is prepared and checked against the live forms:

- [`launch/pumpfun.md`](launch/pumpfun.md) — values for every field of the pump.fun form, file limits, checklist before and after creation.
- [`launch/dexscreener.md`](launch/dexscreener.md) — Enhanced Token Info: images, description, links.
- [`launch/telegram.md`](launch/telegram.md) — launch-day checklist for the community.

On pump.fun nothing can be edited after the coin is created.
That is why the site, X and Telegram are finished first.

## Stack

| Area | Tools |
|---|---|
| Website | Astro, Tailwind CSS, TypeScript |
| Hosting | Vercel, auto-deploy from GitHub |
| Design | Figma |
| Community | Telegram, Rose, Safeguard |

## Folder structure

```
projects/molty/
  project.config.json   texts, links, images for the site
  brand/                references, logo, banners, exports, gallery, stickers, video
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
```

## Not done on purpose

- The token is not created. This project is a complete launch package.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$MOLTY is a meme project made for fun. It is not an investment and not financial advice.

## Contact

**cosa_nostra** — Telegram: [@insider_dev](https://t.me/insider_dev)
