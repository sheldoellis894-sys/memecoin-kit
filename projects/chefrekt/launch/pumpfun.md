# Chef Rekt — pump.fun launch package

## Token (IMMUTABLE after creation — double-check)
- Name: Chef Rekt (9 characters with the space)
- Ticker: CHEFREKT (8 characters). Fallback if the form refuses 8: CHEFRKT (7 characters)
- Image: brand/exports/chefrekt_avatar.png (1000x1000)
- Video: none in this project

## Description
Chef Rekt is a restaurant guide for Solana wallets. Paste an address: an AI inspector reads the trades and files a review with stars. Public data only. No wallet is connected. The blockchain remembers everything. Chef reads it out loud.

## Banner
brand/exports/chefrekt_dex_header.png (1500x500)

## Links
- Website: https://thechefrekt.vercel.app
- X: https://x.com/thechefrekt
- Telegram: https://t.me/thechefrekt

## Pre-launch checklist
- [ ] Name and ticker checked letter by letter by two people
- [ ] Image opens correctly, square, under 15 MB
- [ ] Banner opens correctly, 3:1, under 4.5 MB
- [ ] All three links open
- [ ] Site shows the correct ticker everywhere
- [ ] CA field on the site is ready to be filled (next to the label and on the reservation slip)
- [ ] The Inspection works on the live site with a real wallet (keys are set in Vercel, the spend limit is set at the model provider)
- [ ] Launch wallet is a separate work wallet, no personal funds
- [ ] Description field holds the text from this file, not the X bio (the X bio ends with "Not launched yet.")

## After creation (first 5 minutes)
- [ ] Copy CA from pump.fun
- [ ] Put CA and pump.fun link into project.config.json ("ca" and "links.pumpfun"), git push
- [ ] Pin post on X with CA and site link
- [ ] Post CA in Telegram, pin it
- [ ] Holder mode in the Inspection: the "Holder preview" switch stays a preview until the wallet check is built (plan, second edition)

## Verified in the live form (2026-10-06, dry run for this project, coin not created)
- Name "Chef Rekt" (with a space) is accepted
- Ticker: the owner entered the 7-character fallback CHEFRKT. Whether the field takes the 8-character CHEFREKT: TO CONFIRM.
  The banner, the site, X and Telegram all say $CHEFREKT, so the ticker in the form must match them on launch day.
- All three links (Website, X, Telegram) are accepted
- The Description field holds the text from this file
- Image chefrekt_avatar.png and banner chefrekt_dex_header.png upload and preview correctly
- Screenshots: pumpfun_form.png, pumpfun_preview.png (no wallet address in the frame)
- The form opened in German for the owner; the fields were matched by position and content
- Nothing new in the form compared with the dry runs of the earlier projects

## AI agent features of pump.fun: not used
- "Tokenized Agents" (agent revenue buys back and burns the token) was launched on 2026-03-13 and removed on 2026-06-30 (news, not checked in the form). The project does not rely on it.
- Mayhem Mode (an AI trading agent during the first 24 hours, only at creation, can increase supply) — team decision, off by default.
- The agent of this project lives on the site. It does not trade, holds no wallet and has no key to any funds.

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
