# Horocope ($HOROCOPE) — launch-ready token package with an AI agent that works on a schedule

A complete wrapper for a Solana token whose product is a daily horoscope for crypto traders.
Every morning an AI agent reads the last 24 hours of the Solana market and the real sky of the day,
and writes one issue: twelve entries, one per zodiac sign. The trader is never to blame. A planet is.
Brand kit, a website built around a zodiac wheel, the agent on a scheduled serverless function,
X profile, Telegram community and a launch package for pump.fun and DexScreener.

![The morning issue](case/03_site_issue.png)

| | |
|---|---|
| **Type** | Token with an AI agent: a horoscope written once a day from market data and the real sky |
| **Chain** | Solana (pump.fun) |
| **Status** | Ready to launch. The token is not created. |
| **Time** | 5 hours, measured step by step (see `brand/docs/horocope_timelog.md`) |
| **Role** | Solo: brand, visuals, front-end, agent back-end, socials, community setup |
| **Website** | https://thehorocope.vercel.app |
| **X** | https://x.com/thehorocope |
| **Telegram** | https://t.me/thehorocope |

## Idea

Every trader has bought a top and sold a bottom, and every trader would like to hear that it was not their fault.

**Horocope** says exactly that, every morning, with evidence. **Madame Cope** is a crystal ball in a blue turban.
She has watched every chart since the first one and has never once blamed a trader.
She reads what the market did, looks up at the sky, finds the planet responsible and hands over a tissue.

- Slogan: *The stars knew everything. They just didn't tell you.*
- Second line: *Reads the market. Blames the stars.*
- Voice: "gentle fortune teller". Warm, calm, a little tired: "Saturn is building a house you cannot enter."

The joke has a real half. The sky in every issue is the true sky of that date: where each planet stands,
who is retrograde, the phase of the Moon. What the planets mean for a trade is the part everyone is in on.

What the token is for: everyone gets today's issue, their sign remembered, a picture card with a small site tag
and the last seven days of the archive. Holders get the whole archive, the compatibility of two signs and a clean card.
There is no token yet, so the site has a "Holder preview" switch that shows the holder mode without a wallet check.
The real balance check is on the plan and is not built.

## 1. Character

Madame Cope: a round crystal ball with a pink and lilac swirl inside the glass, heavy half-closed eyes, a blush,
a blue turban with a pink star brooch, two small lilac hands and a dark stand.
She does not carry a wand. She carries a pink box of tissues.
The look is an airbrush cartoon: soft shading, glossy highlights, a few sparkles.

| Main reference | Turnaround |
|---|---|
| ![Madame Cope](brand/references/horocope_main.jpg) | ![Turnaround](brand/references/horocope_turnaround.jpg) |

Scenes for the website gallery and for posts.

| | | | |
|---|---|---|---|
| ![She brought tissues](brand/gallery/horocope_g01.jpg) | ![Seen from inside](brand/gallery/horocope_g02.jpg) | ![It was Mercury](brand/gallery/horocope_g03.jpg) | ![Up at six](brand/gallery/horocope_g04.jpg) |
| ![Tea](brand/gallery/horocope_g05.jpg) | ![One excuse for every sign](brand/gallery/horocope_g06.jpg) | ![The usual suspects](brand/gallery/horocope_g07.jpg) | ![A green day](brand/gallery/horocope_g08.jpg) |

Three poses for the entry of a sign: a low day, an ordinary day and a suspiciously good one. The site picks the pose from the score.

| Low | Middle | High |
|---|---|---|
| ![Low day](brand/stickers/horocope_s01.png) | ![Ordinary day](brand/stickers/horocope_s02.png) | ![Good day](brand/stickers/horocope_s03.png) |

## 2. Brand kit

Palette "Aura": the page looks like an aura photograph, and its colours move as the visitor scrolls.

| Element | Value |
|---|---|
| Background: pink, lilac and blue in one soft gradient | `#FFC2E2` · `#D9C8FF` · `#B5E3FF` |
| Text, headings, dark sections: ink of the night sky | `#1F1B3A` |
| Second colour, the blush: ticker, scores, marks | `#FF5FB7` |
| Accent, the turban: buttons, the chosen sign | `#3D7BFF` |
| Headings and ticker | Bagel Fat One |
| Body | Nunito |

The ticker is always set in the heading font, so the `$` sign matches the letters next to it.

Exports, ready for every platform:

| File | Size | Used for |
|---|---|---|
| `brand/exports/horocope_avatar.png` | 1000×1000 | Token image, X and Telegram avatar |
| `brand/exports/horocope_avatar_circle.png` | 1000×1000 | Round logo |
| `brand/exports/horocope_avatar_circle_256.png` | 256×256 | Site logo, favicon |
| `brand/exports/horocope_x_header.png` | 1500×500 | X header |
| `brand/exports/horocope_dex_header.png` | 1500×500 | pump.fun banner, DexScreener header |
| `brand/exports/horocope_og.png` | 1200×630 | Link preview, Telegram portal, pinned post |

![Brand kit in Figma](case/07_figma_brandkit.png)

## 3. Website

https://thehorocope.vercel.app

The first screen is a wheel of twelve signs with Madame Cope in the middle. The visitor turns the wheel,
taps a sign or enters a birthday, and the whole page follows that sign.

![The wheel](case/01_site_hero.png)

What happens on the page:

- **The wheel.** It turns by drag, by the arrows and from the keyboard. The chosen sign stays in the top bar and is remembered in the browser. A birthday finds the sign; the date never leaves the browser.
- **The aura.** The background is one gradient whose colours shift while the page scrolls.
- **The issue.** The headline, two sentences about the day, four numbers, the real sky as a row of chips with a mark on every retrograde planet, and the planet of the day with a "Blame" button and a counter.
- **The entry.** The entry of the chosen sign comes out of the fog and is typed letter by letter: the score, the planet to blame, the real reason and three sentences from Madame Cope.
- **The card.** Every entry is drawn as a 1080×1350 picture to save or share on X.
- **The agent's log.** The steps the agent took for the issue on screen, in the order it took them.
- **Moon phases.** "How to buy" is four phases of the Moon, from new to full.
- **A small constellation.** Tokenomics is drawn as stars joined by a line.
- **The archive.** A calendar where every day carries the real phase of the Moon for that date. A day with an issue opens it.
- **Bubbles.** The gallery is glass bubbles that float; a tap opens the whole picture.
- **The ball.** The last section is a crystal ball full of fog. The visitor wipes the fog with a finger or the mouse and finds the buy button inside.

| The ball | The archive |
|---|---|
| ![The ball](case/02_site_ball.png) | ![The archive](case/11_site_archive.png) |

| How it works, the agent's log | How to buy, tokenomics |
|---|---|
| ![How it works](case/09_site_how.png) | ![The token](case/10_site_token.png) |

| Madame Cope, scores of the day | Gallery and plan |
|---|---|
| ![Madame Cope](case/08_site_madame.png) | ![Gallery](case/12_site_gallery.png) |

![House rules](case/13_site_rules.png)

Static pages plus two serverless functions, checked at five widths from 360 to 1440 px, auto-deploy on every push.
The effects respect the system "reduce motion" setting.

### The morning issue: the agent

Nobody presses a button. A scheduled job starts the agent once a day, at 06:00 UTC.

1. **The agent decides what to read.** A language model runs in a loop with four tools: read the sky, read the movers, read the newborn tokens, file the issue. It has to read the sky first and take at least one more reading. Six turns at most.
2. **The market comes from public data.** The move of SOL, how many of the traded tokens were green or red, the biggest winners and losers, the newest pools. No keys are needed for this part.
3. **The sky is computed, not imagined.** Code works out the position of the Sun, the Moon and eight planets for the moment of the run, finds who is retrograde and the phase of the Moon. The results were checked against known dates: an equinox, two eclipses, the retrogrades of the year.
4. **The chart comes from code.** For every sign the code finds the planet that really stands against it today, in the sign, opposite it, square to it, or its ruler walking backward, and gives the day a score. The mood of the market moves every score up or down. The same sky and the same market always give the same chart.
5. **The model writes the words only.** It gets the facts, the sky and the chart, and writes a headline, two sentences about the day and twelve entries. Every number on the page comes from code.
6. **An editor in code reads the issue before it is stored.** A field that states the score, gives advice, speaks about the future, blames the wrong planet, repeats the printed reason word for word or writes numbers in words goes back to the model once. A field that fails twice is replaced by a plain sentence written from the numbers.
7. **The issue goes into the journal.** One file in a private store, one issue per day. The page reads it through a second function.

An entry from the first issue, for Cancer, on a red day with Saturn retrograde in Aries (the checks for a repeated reason and for numbers in words were added after it):

> Saturn is retrograde in Aries, square to your sign. A token eleven days old rose 736.6 percent somewhere else. Saturn is building a house you cannot enter.

How it is built:

- **Untrusted text stays out.** Token names are written by strangers on a public chain. The agent never sees them: tokens reach the model as short ids and numbers, and the text of an issue is cleaned of tickers, links and anything that looks like an address.
- **One issue a day.** When today's issue exists the model is not called, so opening the address of the function costs nothing. With a secret set in the hosting project, the function answers only to the scheduler and to the owner.
- **The archive is hard to lose.** The kind of the store is set explicitly, an empty journal is written before the model is called, and a damaged file is never overwritten.
- **Failures are short words.** A failed run answers with a code and a detail such as `http_401_authentication_error`; the provider's own sentence goes to the function log only. The key lives in the environment of the hosting project and never reaches the browser, the answer or the log.
- **When the agent is not reachable** (local preview, a deployment without keys), the page shows a sample issue from the config, dated today and drawn from the same real sky.
- **What the horoscope never does** is in the prompt, in the code and on the site: it names no token, gives no advice, predicts nothing and never calls a token safe.
- **Tests.** `node tests/issue.test.mjs` runs both functions against scripted answers of the market services and the model: the normal path, one issue a day, the archive, the hour gate and the secret, an unfinished issue, the editor, a refused key, a silent data source, a broken store, and the sky at known dates.

Three things were found only on the live site and fixed the same evening: a refused key that the function could not tell from other failures,
a first issue that kept the rules of the prompt badly, and the build queue of the hosting plan. They are in the time log.

### Reusable template

The site is built from a template that lives in `templates/landing`.
A site is three files:

1. `project.config.json` — all texts, links and images of the project.
2. A theme file — colors, fonts, corner radius, overall look. This project uses the `aura` theme.
3. A layout file — which sections to show and in what order. This project uses the `wheel` layout.

The agent is two functions, `templates/landing/api/issue-run.js` (writes) and `templates/landing/api/issue.js` (reads), deployed together with the site.
They answer only for projects that have an oracle, so the other sites built from the same template are not affected.

```
cd templates/landing
npm install
PROJECT=horocope npm run dev
PROJECT=horocope npm run build
node tests/issue.test.mjs
```

## 4. X (Twitter)

- Profile: avatar, header, bio, link to the site.
- Pinned post: Madame Cope pointing at the planets and a warning that no contract address means no token.
- Content plan for 7 days, 12 posts with images and alt texts: [`launch/x_content.md`](launch/x_content.md). Four of them are scheduled.
- No price talk, no promises and no safety claims in any post. A planet is called retrograde or placed in a sign only when it really is.

<img src="case/05_x_profile.png" width="340" alt="X profile">

## 5. Telegram

- Public channel with a verification portal, private group for the chat.
- **Safeguard** — portal: entry to the group only after verification.
- **Rose** — welcome message with buttons, locks for links, forwards and bots, antiflood, automatic antiraid.
- One entry check on purpose: the portal. The captcha is kept in reserve for launch day.
- The entry path is tested with a second account.
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
| ![pump.fun form](launch/pumpfun_form.png) | ![pump.fun image and banner](launch/pumpfun_preview.png) |

## Stack

| Area | Tools |
|---|---|
| Website | Astro, Tailwind CSS, TypeScript, Canvas, SVG |
| Agent | Vercel Functions (Node.js), Vercel Cron, Vercel Blob, a language model API with tool calling |
| Data | GeckoTerminal and DexScreener public APIs, an ephemeris computed in code |
| Hosting | Vercel, auto-deploy from GitHub |
| Design | Figma |
| Community | Telegram, Rose, Safeguard |

## Folder structure

```
projects/horocope/
  project.config.json   texts, links, images for the site, labels and the sample issue
  brand/                references, logo, banners, exports, gallery, poses, docs
  launch/               pump.fun, DexScreener, X content plan, Telegram setup
  case/                 screenshots for this page
templates/landing/
  vercel.json           the schedule
  api/issue-run.js      the function that writes the issue
  api/issue.js          the function that serves the issues to the page
  api/_agent/           the agent loop and the persona, market data, the sky, the journal
  tests/                the agent against scripted upstream answers
```

## Not done on purpose, and not confirmed

- The token is not created. This project is a complete launch package.
- The schedule is set and the function is live, but the first scheduled run falls on the morning after this page was written. The issue on the site was started by hand through the same function.
- The wallet check for holders is not built. The site shows the holder mode with a preview switch and says so.
- An AI agent writes the words and it can be wrong. The numbers and the sky come from code; the editor in code catches the rules that can be checked, not the quality of a joke.
- The positions of the planets are computed with a compact model: accurate to the sign and to the day of a retrograde, not to the arc minute.
- The market reading covers trending and newest pools from public services, not the whole chain.
- The Rose settings were sent by the owner and not re-checked with the checking commands. The site was not checked on a real phone.
- The agent does not trade, holds no wallet and has no key to any funds.
- No animation in this project: the motion is on the site itself.
- No volume bots, no paid trending, no paid boosts.

## Disclaimer

$HOROCOPE is a meme project made for fun. It is not an investment and not financial, legal or tax advice.
The horoscope is entertainment written by an AI agent from public market data and may be inaccurate. It predicts nothing.
Astrology is a joke here. Madame Cope is a crystal ball. For anything important, consult a human.

## Contact

**cosa_nostra** — Telegram: [@insider_gang](https://t.me/insider_gang)
