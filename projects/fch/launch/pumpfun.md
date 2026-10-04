# Fat Cat Holdings — pump.fun launch package

## Token (IMMUTABLE after creation — double-check)
- Name: Fat Cat Holdings (16 characters)
- Ticker: FCH (3 characters)
- Image: brand/exports/fch_avatar.png (1000x1000, 1.7 MB)
- Video: brand/video/fch_v02.mp4 (1920x1080, 16:9, 6.3 s, 5.6 MB) — not used in the form, see the dry run notes below

## Description
You don't own the cat. You work for him. Fat Cat Holdings is run by one very large cat. He is not fat. He is accumulating. Read the agreement, sign it, report for duty.

## Banner
brand/exports/fch_dex_header.png (1500x500, 1.2 MB)

## Links
- Website: https://fatcatholdings.vercel.app
- X: https://x.com/fatcatholdings
- Telegram: https://t.me/fatcatholdings

## Pre-launch checklist
- [ ] Name and ticker checked letter by letter by two people
- [ ] Image opens correctly, square, under 15 MB
- [ ] Banner opens correctly, 3:1, under 4.5 MB
- [ ] All three links open
- [ ] Site shows the correct ticker everywhere
- [ ] CA field on the site is ready to be filled (Payroll sheet and Signatures sheet)
- [ ] Launch wallet is a separate work wallet, no personal funds

## After creation (first 5 minutes)
- [ ] Copy CA from pump.fun
- [ ] Put CA and pump.fun link into project.config.json ("ca" and "links.pumpfun"), git push
- [ ] Pin post on X with CA and site link
- [ ] Post CA in Telegram, pin it

## Verified in the live form (2026-10-04, dry run for this project, coin not created)
- Name "Fat Cat Holdings" and ticker "FCH" are accepted as is
- Description and all three links (Website, X, Telegram) are accepted
- Image fch_avatar.png and banner fch_dex_header.png upload and preview correctly
- Video fch_v02.mp4 was tried: its 16:9 frame does not fit the banner (3:1). Decision: launch with the image and the banner, the video goes to the pinned post on X
- Screenshots: pumpfun_form.png, pumpfun_preview.png
- Image: max 15 MB, jpg/gif/png recommended, min 1000x1000, 1:1
- Video instead of image: mp4, max 30 MB, 16:9 or 9:16, 1080p+
- Banner: up to 4.5 MB (larger images are resized automatically, GIFs are not), jpg/png/webp/gif, 3:1, 1500x500 recommended
- Banner can only be set when creating the coin and cannot be changed later
- Social links: Website, X, Telegram only
- EVERYTHING is immutable after creation: name, ticker, image, banner, links
  -> site, X and Telegram must exist BEFORE creating the coin
- Paired liquidity asset: SOL / USDC / User-defined
- Creator rewards sent to: Creator or Holders
- New since the previous run: a "Share creator rewards" block. After creation the rewards can be shared
  with other wallets or charities from the coin page
- Mayhem Mode: 24h, only at creation, can increase supply — team decision
