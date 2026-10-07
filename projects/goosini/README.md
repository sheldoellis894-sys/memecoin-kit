# Scootini Goosini ($GOOSINI) — launch-ready memecoin package

A complete wrapper for a Solana memecoin: character, brand kit, a website built as a food-delivery app
with a playable game, X profile, Telegram community and a launch package for pump.fun and DexScreener.

![Scootini Goosini website](case/02_site_map.png)

| | |
|---|---|
| **Type** | Memecoin, brainrot + food delivery |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | 3 hours, measured step by step (see `brand/docs/goosini_timelog.md`) |
| **Role** | Solo: brand, visuals, front-end, socials, community setup |
| **Website** | https://scootinigoosini.vercel.app |
| **X** | https://x.com/scootinigoosini |
| **Telegram** | https://t.me/scootinigoosini |

## Idea

**Scootini Goosini** is half goose, half electric scooter and the worst courier in the city.
He accepts every order and delivers none of them. Your pizza is already with him, and he is already leaving.

- Slogan: *He didn't come in peace. He came with your pizza. And he's already leaving.*
- Second line: *Thanks for your order. It was delicious.*
- Voice: "delivery service notifications". The polite, official voice of a delivery app reports total chaos as an order status: "Your courier is nearby. Your courier drove past." Sometimes the courier answers himself, with one word: "Honk."
- Signature props: a handlebar that goes straight through his neck, a helmet two sizes too small, an orange delivery box, a stolen slice of pizza.

The whole project plays one joke consistently: the site is the delivery app itself. The order status changes while you scroll,
the map shows the courier riding away from your address, the chat answers "Honk", tokenomics is a receipt,
the roadmap is a list of orders he will not deliver, and the buy button opens with "slide to order".

## 1. Character

One character, the same in every image: a chubby white goose who is himself a scooter. Two fat wheels grow out of his belly
where the legs would be, his long straight neck is the steering pole, and a blue handlebar goes through it like a bolt.
Drawn as a bold meme sticker: thick uneven black outlines, flat bright colours, one strong expression that reads at avatar size.

| Main reference | Turnaround | Emotions |
|---|---|---|
| ![Main](brand/references/goosini_main.jpg) | ![Turnaround](brand/references/goosini_turnaround.jpg) | ![Emotions](brand/references/goosini_emotions.jpg) |

Delivery reports, for the website and for posts. The recurring cast is the customers in pajamas and bathrobes.

| | | |
|---|---|---|
| ![Left at the door](brand/gallery/goosini_g01.jpg) | ![The chase](brand/gallery/goosini_g05.jpg) | ![In the elevator](brand/gallery/goosini_g02.jpg) |
| ![Charging](brand/gallery/goosini_g04.jpg) | ![Quality control](brand/gallery/goosini_g06.jpg) | ![Lunch break](brand/gallery/goosini_g03.jpg) |

Game sprites with a transparent background: four poses of the courier in one scale and the door he has to stop at.

<p>
  <img src="brand/stickers/goosini_ride.png" height="170" alt="Goosini rides">
  <img src="brand/stickers/goosini_brake.png" height="170" alt="Goosini brakes">
  <img src="brand/stickers/goosini_eat.png" height="170" alt="Goosini eats the order">
  <img src="brand/stickers/goosini_miss.png" height="170" alt="Goosini drove past and looks back">
  <img src="brand/stickers/goosini_door.png" height="170" alt="The orange door">
</p>

## 2. Brand kit

Palette "A clear day": sky blue, signboard blue, white cards and the orange of a goose beak.

| Element | Value |
|---|---|
| Sky (background) | `#BFE3FF` |
| Cards | `#FFFFFF` |
| Text and outlines | `#0E1B3D` |
| Primary, signboard blue | `#1747D1` |
| Accent, beak orange | `#FF6A00` |
| Headings and ticker | Montserrat Black Italic |
| Body | Montserrat |

The ticker is always set in the heading font, so the `$` sign matches the letters next to it.
Cards, buttons and chips repeat the look of the artwork: a thick dark outline and a hard shadow, like stickers.

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/goosini_avatar.png` | 1000×1000 | Token image, X and Telegram avatar |
| `brand/exports/goosini_avatar_circle.png` | 1000×1000 | Round logo |
| `brand/exports/goosini_avatar_circle_256.png` | 256×256 | Site logo, favicon |
| `brand/exports/goosini_x_header.png` | 1500×500 | X header |
| `brand/exports/goosini_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/goosini_og.png` | 1194×603 | Link preview, Telegram portal |

Two banners were made for two jobs: a close chase scene for the site and link previews,
and a wide version of the same scene where every character fits a 3:1 strip.

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://scootinigoosini.vercel.app

The site is a delivery app. On a phone the page is the app: an order bar on top, a tab bar at the bottom.
On a wide screen a phone frame stays in the middle and the page scrolls inside it, with the name on the left
and the order timeline on the right.

What happens on the page:

- **The order status follows the scroll.** "Order received", "Handed to the goose", "Courier is nearby", "Courier drove past", "Order eaten". The bar on top and the timeline at the side change as sections pass.
- **Live tracking.** On the map the courier's marker rides along the route away from the customer's home while the page scrolls. The arrival time goes from "15 min" to "never", the distance grows.
- **Push notifications.** They drop from the top once, when their section comes into view: "Your order was handed to a goose."
- **Chat with the courier.** The visitor taps a ready-made phrase. The courier answers "Honk", sends a photo of an empty box or leaves a system line: "Support is also a goose."
- **Rate your courier.** The visitor taps a star, and the courier rates the visitor back: two stars and a complaint.
- **Receipt.** Tokenomics is printed as a till receipt with dotted leaders, a total, a barcode and the contract address.
- **Checkout.** "How to buy" is a cart line and four numbered steps.
- **Slide to order.** The buy button stays locked until the visitor drags the slider to the end. Enter and Space work for the keyboard, and there is a plain link under it.

Also on the site: the gallery as stories with progress bars and a "Delivered" stamp on every picture,
a courier profile with three numbers (orders accepted, delivered, eaten), the roadmap as three orders with status chips,
a contract address block on two screens (before launch it shows a placeholder).

Static site, checked at five widths from 360 to 1440 px, auto-deploy on every push. The effects respect the system
"reduce motion" setting. Images are shrunk at build time: 9 MB of originals become under 5 MB on the site.

### Mini-game "Stop at the door"

The courier rides to the right by himself. One tap hits the brakes. The goal is to stop exactly at the orange door.

- A good stop means one more order eaten at the door, and the next round is faster: from 25 km/h up to 62 km/h.
- The braking distance grows with the speed, so the tap has to come earlier every round.
- The first miss ends the shift. The result is given in metres: "The courier drove past the door by 3.2 m."
- Tap, click, Space or Enter. The record is remembered, the result can be shared on X.
- Canvas, no libraries. The game pauses when it leaves the screen or the tab is hidden.
- Everything comes from the project config: sprites, texts, units. The game can be reused for another mascot.
- Checked with an automated player on desktop and phone sizes.

The first screen on an iPhone, opened from Telegram:

<img src="case/04_site_mobile.jpg" width="300" alt="The first screen of the site on a phone">

| The game, the rating and the checkout | The courier and the chat |
|---|---|
| ![Game](case/03_site_game.png) | ![Chat](case/08_site_chat.png) |

| The receipt and the stories | The orders and "slide to order" |
|---|---|
| ![Receipt](case/09_site_receipt.png) | ![Order](case/10_site_order.png) |

### Reusable template

The site is built from a template that lives in `templates/landing`.
A site is three files:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius, overall look. This project uses the `sky` theme.
3. A layout file — which sections to show and in what order. This project uses the `delivery` layout.

Statuses, notifications, chat phrases, map numbers and the receipt are plain data in the config,
so another app-style site needs new texts and pictures only.

```
cd templates/landing
npm install
PROJECT=goosini npm run dev
PROJECT=goosini npm run build
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post: the chase scene and a warning that no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md). Four of them are scheduled.
- No price talk, no promises and no safety claims in any post. "Delivered" and "eaten" are about pizza.

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
projects/goosini/
  project.config.json   texts, links, images for the site
  brand/                references, logo, banners, exports, gallery, stickers, docs
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
```

## Not done on purpose

- The token is not created. This project is a complete launch package.
- No animation in this project: the motion is on the site itself.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$GOOSINI is a meme project made for fun. It is not an investment and not financial advice.
The delivery app is a joke: no food is sold, delivered or eaten.

## Contact

**cosa_nostra** — Telegram: [@insider_dev](https://t.me/insider_dev)
