# Horocope — pump.fun launch package

## Token (IMMUTABLE after creation — double-check)
- Name: Horocope (8 characters)
- Ticker: HOROCOPE (8 characters; a ticker of this length was accepted by the form on 2026-10-06 in the dry run of the previous project)
- Image: brand/exports/horocope_avatar.png (1000x1000)
- Video: none in this project

## Description
Horocope is a daily horoscope for crypto traders. Every morning an AI agent reads the last 24 hours of the Solana market and writes twelve entries. It was never your fault. The stars knew everything. They just didn't tell you.

## Banner
brand/exports/horocope_dex_header.png (1500x500)

## Links
- Website: https://thehorocope.vercel.app
- X: https://x.com/thehorocope
- Telegram: https://t.me/thehorocope

## Pre-launch checklist
- [ ] Name and ticker checked letter by letter by two people
- [ ] Image opens correctly, square, under 15 MB
- [ ] Banner opens correctly, 3:1, under 4.5 MB
- [ ] All three links open
- [ ] Site shows the correct ticker everywhere
- [ ] CA field on the site is ready to be filled (under the constellation and inside the ball)
- [ ] The morning issue on the live site is a real one, not the sample (the key and the Blob store are set in Vercel, the spend limit is set at the model provider)
- [ ] Launch wallet is a separate work wallet, no personal funds
- [ ] Description field holds the text from this file, not the X bio (the X bio ends with "Not launched yet.")

## After creation (first 5 minutes)
- [ ] Copy CA from pump.fun
- [ ] Put CA and pump.fun link into project.config.json ("ca" and "links.pumpfun"), git push
- [ ] Pin post on X with CA and site link
- [ ] Post CA in Telegram, pin it
- [ ] Holder mode on the site: the "Holder preview" switch stays a preview until the wallet check is built (plan, half moon)

## Dry run of the live form: NOT DONE YET
To do by the owner (coin is not created, nothing is signed, the wallet address stays out of the frame):
- Name "Horocope", ticker "HOROCOPE", the Description from this file, the three links
- Image horocope_avatar.png and banner horocope_dex_header.png
- Screenshots: launch/pumpfun_form.png and launch/pumpfun_preview.png
- Compare the ticker in the form with the ticker on the banner, letter by letter
After the screenshots this section is rewritten as "Verified in the live form".

## AI agent features of pump.fun: not used
- "Tokenized Agents" (agent revenue buys back and burns the token) was launched on 2026-03-13 and removed on 2026-06-30 (news, not checked in the form). The project does not rely on it.
- Mayhem Mode (an AI trading agent during the first 24 hours, only at creation, can increase supply) — team decision, off by default.
- The agent of this project lives on the site. It writes a horoscope once a day. It does not trade, holds no wallet and has no key to any funds.

## Known rules of the form (from the dry runs of the earlier projects, last checked 2026-10-06)
- Image: max 15 MB, jpg/gif/png recommended, min 1000x1000, 1:1
- Video instead of image: mp4, max 30 MB, 16:9 or 9:16, 1080p+
- Banner: up to 4.5 MB (larger images are resized automatically, GIFs are not), jpg/png/webp/gif, 3:1, 1500x500 recommended
- Banner can only be set when creating the coin and cannot be changed later
- Social links: Website, X, Telegram only
- EVERYTHING is immutable after creation: name, ticker, image, banner, links
  -> site, X and Telegram must exist BEFORE creating the coin
- Paired liquidity asset: SOL / USDC / User-defined
- Creator rewards sent to: Creator or Holders
- "Share creator rewards" block: after creation the rewards can be shared with other wallets or charities from the coin page
