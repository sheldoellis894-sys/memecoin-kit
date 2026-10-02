# Molty — Telegram setup

Status on 2026-10-02: portal and group are ready, token is not live.

## 1. Structure

| Part | What it is | Link |
|---|---|---|
| Channel "Molty \| $MOLTY" | Public. Holds the Safeguard portal post. This is the link we publish everywhere. | https://t.me/moltymole |
| Group "Molty \| $MOLTY" | Private chat. Entry only through the portal. | no public link |

- Owner posts as anonymous admin.
- Bots: Rose (`@MissRose_bot`) for moderation, Safeguard (`@Safeguard`) for the portal.
- Buy bot is added on launch day (see section 5).

## 2. Safeguard portal

Setup (private chat with `@Safeguard`):

1. Make the group private, create a public channel with the project username.
2. Send `/setup`.
3. Select the group, then select the channel. Safeguard adds itself as admin in both.
4. Turn off "Add new admins" for Safeguard in the group and in the channel.
5. Set media, text and buttons.

Portal content:

- Media: `brand/exports/molty_og.png`
- Text:

```
⛏ Welcome to the Molty mine

Molty knows where the gold is buried.
Tap the button below to verify and join the crew.

$MOLTY is not live yet. No CA = no token. Don't trust fakes.
```

- Verify button name: `⛏ Enter the mine`
- Extra buttons:

```
Website
https://molty-ten.vercel.app
```

```
X (Twitter)
https://x.com/moltymole
```

Other Safeguard commands (not used yet): `/config` (anti-raid, flood control, scam blocker),
`/aiban` (reply to a spam message), `/switch` (if the verification web app does not open).

## 3. Rose (moderation)

All commands are sent in the group. Rose is admin without "Add new admins".

Welcome:

```
/welcome on
/setwelcome <text with Site and Dig! buttons>
/cleanwelcome on
/cleanservice on
```

To see the exact saved welcome text: `/welcome noformat`.

Captcha:

```
/captcha on
/captchamode math
/captchakick on
/captchakicktime 5m
```

Locks (checked with `/locks`):
`bot`, `forward`, `forwardbot`, `forwardchannel`, `forwardstory`, `forwarduser`, `invitelink`, `url`.

Antiflood (checked with `/flood`): 6 messages in a row, action `tmute 10m`, flood messages are deleted.

Not confirmed, check with `/antiraid` and `/allowlist`:

```
/autoantiraid 20
/allowlist molty-ten.vercel.app x.com/moltymole
```

## 4. Known trade-off

A new member passes two checks: the Safeguard portal, then the Rose math captcha
(kick after 5 minutes). Decision on 2026-10-02: keep both.
If people complain on launch day, send `/captcha off` in the group.

The full entry path was not tested with a second account yet.

## 5. Buy bot (launch day)

It needs a contract address, so it cannot be set up before launch.

Plan A — Safeguard buy bot (already admin in the group, docs say it is ad free):

1. In the group send `/add` and press the button.
2. Chain: Solana. Paste the contract address. Choose the top pair.
3. In `/settings`: min buy, emoji `⛏`, step, media (`brand/stickers/molty_gold.png` or an animation from `brand/video/`).

Plan B — Bobby (`@BobbyBuyBot`). Tested on 2026-10-02 in a test group: works on Solana,
but every buy message has 4 ad elements (two text lines, BOOST and GET SEEN buttons, link to a third-party trading bot).

Open question for both bots: buys while the token is still on the pump.fun bonding curve.
Not verified. Check in the first minutes after launch.

Not used: volume bots, paid trending, paid boosts.

## 6. Launch-day checklist

- [ ] Portal text: replace the "not live yet" line with the contract address.
- [ ] Pinned message in the group: contract address + pump.fun link.
- [ ] Rose: `/allowlist pump.fun dexscreener.com`
- [ ] Rose: `/filter ca <contract address>` so the word "ca" always gets the real address.
- [ ] Buy bot: section 5.
- [ ] Post the contract address in the channel and pin it.

## 7. Security rules

- Add bots only by exact username from Telegram search.
- No bot gets "Add new admins".
- Real verification never asks for a phone number, a login code, a QR scan or running a command on a computer.
- Never connect a wallet to a bot and never sign anything in a bot.

## 8. Reuse for the next project

Replace: channel and group name, username, portal media, portal text, button links, welcome text, allowlist domains.
Everything else (commands and their order) stays the same.
