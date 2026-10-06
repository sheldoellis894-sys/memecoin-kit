# Ten Keys — pump.fun launch package

## Token (IMMUTABLE after creation — double-check)
- Name: Ten Keys (8 characters with the space)
- Ticker: TENKEYS (7 characters)
- Image: brand/exports/tenkeys_avatar.png (1000x1000)
- Video: none in this project

## Description
Ten Keys is a counting room for creator fees. Set up to ten shares, check that they add up to 100%, seal the sheet. It runs in your browser. Agree on the split. Then launch.

## Banner
brand/exports/tenkeys_dex_header.png (1500x500)

## Links
- Website: https://thetenkeys.vercel.app
- X: https://x.com/thetenkeys
- Telegram: https://t.me/thetenkeys

## Pre-launch checklist
- [ ] Name and ticker checked letter by letter by two people
- [ ] Image opens correctly, square, under 15 MB
- [ ] Banner opens correctly, 3:1, under 4.5 MB
- [ ] All three links open
- [ ] Site shows the correct ticker everywhere
- [ ] CA field on the site is ready to be filled (under the rack of keys and next to the open door)
- [ ] Launch wallet is a separate work wallet, no personal funds
- [ ] Description field holds the text from this file, not the X bio (the X bio ends with "Not launched yet.")

## After creation (first 5 minutes)
- [ ] Copy CA from pump.fun
- [ ] Put CA and pump.fun link into project.config.json ("ca" and "links.pumpfun"), git push
- [ ] Pin post on X with CA and site link
- [ ] Post CA in Telegram, pin it
- [ ] Holder check in the counting room: the "Holder preview" switch stays a preview until the wallet check is built (plan, Count 3)

## Dry run of the form: NOT DONE YET (2026-10-06)
To do with a separate work wallet, without pressing "Create coin" and without signing anything:
- [ ] Name "Ten Keys" (with a space) and ticker "TENKEYS" are accepted as is
- [ ] All three links (Website, X, Telegram) are accepted
- [ ] Image tenkeys_avatar.png and banner tenkeys_dex_header.png upload and preview correctly
- [ ] Screenshots saved by the owner: launch/pumpfun_form.png, launch/pumpfun_preview.png (wallet address out of the frame)

## Creator fee sharing: what the site says and what to check in the live form
The site and the tool are built on these statements. Sources: news from January 2026 (Cointelegraph, The Block)
and the "Share creator rewards" block seen in the form during the dry run of the previous project on 2026-10-05.
- Fees can be shared with up to 10 wallets — to confirm in the live form (the site says "up to 10 wallets" in three places)
- Shares are set after launch by the creator or the community admin — to confirm
- Recipients can claim at any time — from the news, cannot be checked without a live coin
- NOT KNOWN: can the shares be changed later; is there a minimum share; how many decimals a share may have
  (the counting room allows two decimals); can a share go to something other than a wallet
If the live form shows a different limit than 10, the texts to change are in project.config.json:
hero.text, vault.why.facts[0], split.lead, split.max and split.labels.checkCount.

## Known rules of the form (from the dry runs of the earlier projects, last checked 2026-10-05)
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
- Mayhem Mode: 24h, only at creation, can increase supply — team decision
