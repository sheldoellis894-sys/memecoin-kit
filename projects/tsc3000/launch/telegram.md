# Turbo Shiba Cop 3000 — Telegram setup

Status on 2026-10-04: portal and group are ready, token is not live.

## 1. Structure

| Part | What it is | Link |
|---|---|---|
| Channel "Turbo Shiba Cop 3000 \| $TSC3000" | Public. Holds the Safeguard portal post. This is the link we publish everywhere. | https://t.me/turboshibacop |
| Group "Turbo Shiba Cop 3000 \| $TSC3000" | Private chat. Entry only through the portal. | no public link |

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

- Media: `brand/exports/tsc3000_og.png`
- Text:

```
🚨 Turbo Shiba Cop 3000 precinct

You have the right to remain silent. He has the right to bark.
Tap the button below to verify and enter.

$TSC3000 is not live yet. No CA = no token. Don't trust fakes.
```

- Verify button name: `🍩 Enter the precinct`
- Extra buttons:

```
Website
https://turboshibacop.vercel.app
```

```
X (Twitter)
https://x.com/turboshibacop
```

```
Play the game
https://turboshibacop.vercel.app/#play
```

Other Safeguard commands (not used yet): `/config` (anti-raid, flood control, scam blocker),
`/aiban` (reply to a spam message), `/switch` (if the verification web app does not open).
Safeguard also answers `/antiraid` in the group: "Antibot is currently NORMAL for this chat".

## 3. Rose (moderation)

All commands are sent in the group. Rose is admin without "Add new admins".
The owner is anonymous, so Rose asks to confirm admin rights with a button on some commands.

Welcome:

```
/welcome on
/setwelcome 🚨 Welcome to the precinct, {first}.

You have the right to remain silent. He has the right to bark.

$TSC3000 is not live yet. No CA = no token.
[Site](buttonurl://https://turboshibacop.vercel.app) [Play the game](buttonurl://https://turboshibacop.vercel.app/#play:same)
/cleanwelcome on
/cleanservice on
```

Captcha:

```
/captcha on
/captchamode math
/captchakick on
/captchakicktime 5m
```

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
/allowlist turboshibacop.vercel.app x.com/turboshibacop
```

### Confirmed on 2026-10-04

| Check | Command | Result |
|---|---|---|
| Locks | `/locks` | `bot`, `forward`, `forwardbot`, `forwardchannel`, `forwardstory`, `forwarduser`, `invitelink`, `url` |
| Antiflood | `/flood` | enabled, 6 consecutive messages, temporary mute for 10 minutes, flood messages are deleted |
| Allowed links | `/allowlist` | `turboshibacop.vercel.app`, `x.com/turboshibacop` |
| Welcome and captcha | `/welcome noformat` | welcome on, old welcomes and service messages are deleted, captcha mode `math`, kick after 5 minutes, welcome text with two buttons saved |
| Manual raid mode | `/antiraid` | disabled (this command shows the manual mode only; it can be switched on for 6 hours with a button) |
| Automatic antiraid | `/autoantiraid` | enabled, threshold 20 joins per minute (confirmed by the owner) |

## 4. Known trade-off

A new member passes two checks: the Safeguard portal, then the Rose math captcha
(kick after 5 minutes). Same decision as on Molty: keep both.
If people complain on launch day, send `/captcha off` in the group.

Entry path with a second account: passed on 2026-10-04 (portal, Safeguard verification, Rose captcha, welcome message with buttons).

## 5. Buy bot (launch day)

It needs a contract address, so it cannot be set up before launch.

Plan A — Safeguard buy bot (already admin in the group, docs say it is ad free):

1. In the group send `/add` and press the button.
2. Chain: Solana. Paste the contract address. Choose the top pair.
3. In `/settings`: min buy, emoji `🍩`, step, media (`brand/stickers/tsc3000_jump.png`).

Plan B — Bobby (`@BobbyBuyBot`). Tested on 2026-10-02 in a test group for Molty: works on Solana,
but every buy message has 4 ad elements (two text lines, BOOST and GET SEEN buttons, link to a third-party trading bot).

Open question for both bots: buys while the token is still on the pump.fun bonding curve.
Not verified. Check in the first minutes after launch.

Not used: volume bots, paid trending, paid boosts.

## 6. Launch-day checklist

- [ ] Portal text: replace the "not live yet" line with the contract address.
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

## 8. Reuse for the next project

Replace: channel and group name, username, portal media, portal text, button links, welcome text, allowlist domains.
Everything else (commands and their order) stays the same.
