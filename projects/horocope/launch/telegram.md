# Horocope — Telegram setup

Status on 2026-10-07: NOT SET UP YET. This file is the plan; the "Confirmed" table is filled in after the owner sets it up.
The username `thehorocope` looked free on the public page on 2026-10-07; it is confirmed when the channel is created. (`horocope` is taken on X, so one handle `thehorocope` is used everywhere.)

## 1. Structure

| Part | What it is | Link |
|---|---|---|
| Channel "Horocope \| $HOROCOPE" | Public. Holds the Safeguard portal post. This is the link we publish everywhere. | https://t.me/thehorocope |
| Group "Horocope \| $HOROCOPE" | Private chat. Entry only through the portal. | no public link |

- Bots: Rose (`@MissRose_bot`) for moderation, Safeguard (`@Safeguard`) for the portal.
- Buy bot is added on launch day (see section 5).
- Madame Cope herself does not post in Telegram yet: "The morning issue posted to Telegram by the agent" is on the plan, half moon.
- Read the channel name letter by letter after saving it: on the previous project the last letter of the ticker was lost.

## 2. Safeguard portal

Setup (private chat with `@Safeguard`):

1. Make the group private, create a public channel with the project username.
2. Send `/setup`.
3. Select the group, then select the channel. Safeguard adds itself as admin in both.
4. Turn off "Add new admins" for Safeguard in the group and in the channel.
5. Set media, text and buttons.

The portal TEXT and every BUTTON are separate messages to Safeguard.
A button message sent at the wrong moment replaces the portal text. After setup, read the portal on https://t.me/s/thehorocope word by word.

Portal content:

- Media: `brand/exports/horocope_og.png`
- Text:

```
🔮 Horocope — a daily horoscope for traders

The stars knew everything. They just didn't tell you.
Tap the button below to verify and come in.

$HOROCOPE is not live yet. No CA = no token. Don't trust fakes.
```

- Verify button name: `🔮 Come in`
- Extra buttons (the name and the link on separate lines, every button in its own message):

```
Website
https://thehorocope.vercel.app
```

```
X (Twitter)
https://x.com/thehorocope
```

```
Today's sky
https://thehorocope.vercel.app/#today
```

Other Safeguard commands (not used yet): `/config` (anti-raid, flood control, scam blocker),
`/aiban` (reply to a spam message), `/switch` (if the verification web app does not open).

## 3. Rose (moderation)

All commands are sent in the group, one at a time. Rose is admin without "Add new admins".
Safeguard also reacts to `/setwelcome` ("Reply to message to set welcome"): ignore it, the welcome belongs to Rose.

Welcome:

```
/welcome on
/setwelcome 🔮 Come in, {first}.

Madame Cope has been expecting you. Whatever happened, a planet did it.

$HOROCOPE is not live yet. No CA = no token.
[Site](buttonurl://https://thehorocope.vercel.app) [Today's sky](buttonurl://https://thehorocope.vercel.app/#today:same)
/cleanwelcome on
/cleanservice on
```

Captcha: not used by default. The Safeguard portal is the only entry check.

Locks:

```
/lock bot
/lock forward
/lock invitelink
/lock url
```

Antiflood and raids:

```
/setflood 6
/floodmode tmute 10m
/clearflood on
/autoantiraid 20
```

Allowed links:

```
/allowlist thehorocope.vercel.app x.com/thehorocope
```

### Confirmed

| Check | Command | Result |
|---|---|---|
| Welcome | `/setwelcome` | not set yet |
| Locks | `/locks` | not set yet |
| Antiflood | `/flood` | not set yet |
| Allowed links | `/allowlist` | not set yet |
| Automatic antiraid | `/autoantiraid` | not set yet |

Note: `/antiraid` shows the manual mode only. If it offers to switch on for 6 hours, press Cancel.
The automatic protection is checked with `/autoantiraid` without a number.

## 4. Entry check

Captcha commands, in case bots get through on launch day (sent in the group):
`/captcha on`, `/captchamode math`, `/captchakick on`, `/captchakicktime 5m`.

A new member passes one check: the Safeguard portal.

Entry path with a second account (portal, Safeguard check, welcome): not checked yet.

## 5. Buy bot (launch day)

It needs a contract address, so it cannot be set up before launch.

Plan A — Safeguard buy bot (already admin in the group, docs say it is ad free):

1. In the group send `/add` and press the button.
2. Chain: Solana. Paste the contract address. Choose the top pair.
3. In `/settings`: min buy, emoji `🔮`, step, media (`brand/exports/horocope_avatar.png`).

Plan B — Bobby (`@BobbyBuyBot`). Tested on 2026-10-02 in a test group: works on Solana,
but every buy message has 4 ad elements (two text lines, BOOST and GET SEEN buttons, link to a third-party trading bot).

Open question for both bots: buys while the token is still on the pump.fun bonding curve.
Not verified. Check in the first minutes after launch.

Not used: volume bots, paid trending, paid boosts.

## 6. Launch-day checklist

- [ ] Portal text: replace the "not live yet" line with the contract address. Read the portal word by word afterwards.
- [ ] Welcome text in Rose: replace the "not live yet" line with the contract address.
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
- The horoscope on the site asks for nothing: no wallet, no address, no birthday on the server. Anyone asking for a seed phrase, a private key or a wallet connection "for a personal reading" is a fake.

## 8. Reuse for the next project

Replace: channel and group name, username, portal media, portal text, button links, welcome text, allowlist domains.
Everything else (commands and their order) stays the same.
