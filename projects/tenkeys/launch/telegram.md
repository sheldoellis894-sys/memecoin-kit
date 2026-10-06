# Ten Keys — Telegram setup

Status on 2026-10-06: set up, token is not live. The channel https://t.me/thetenkeys exists: the verify button and two link buttons were checked on the public page https://t.me/s/thetenkeys, the picture is confirmed by the screenshot case/06_tg_portal.png.

Known flaw, left as is by the owner's decision (2026-10-06): the portal text was replaced by the message meant for the third button. The post reads "Counting room" with the link instead of the text below, so the "not live yet" line is missing from the portal and there is no "Counting room" button. To fix before launch: set the portal text again in the chat with Safeguard.

## 1. Structure

| Part | What it is | Link |
|---|---|---|
| Channel "Ten Keys \| $TENKEYS" | Public. Holds the Safeguard portal post. This is the link we publish everywhere. | https://t.me/thetenkeys |
| Group "Ten Keys \| $TENKEYS" | Private chat. Entry only through the portal. | no public link |

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

- Media: `brand/exports/tenkeys_og.png`
- Text:

```
🔑 Ten Keys — vault entrance

Agree on the split. Then launch.
Tap the button below to verify and take your key.

$TENKEYS is not live yet. No CA = no token. Don't trust fakes.
```

- Verify button name: `🔑 Take my key`
- Extra buttons:

```
Website
https://thetenkeys.vercel.app
```

```
X (Twitter)
https://x.com/thetenkeys
```

```
Counting room
https://thetenkeys.vercel.app/#split
```

Other Safeguard commands (not used yet): `/config` (anti-raid, flood control, scam blocker),
`/aiban` (reply to a spam message), `/switch` (if the verification web app does not open).

## 3. Rose (moderation)

All commands are sent in the group. Rose is admin without "Add new admins".
Safeguard also reacts to `/setwelcome` ("Reply to message to set welcome"): ignore it, the welcome belongs to Rose.

Welcome:

```
/welcome on
/setwelcome 🔑 Key issued, {first}.

10 locks. 100%. 0 arguments.

$TENKEYS is not live yet. No CA = no token.
[Site](buttonurl://https://thetenkeys.vercel.app) [Counting room](buttonurl://https://thetenkeys.vercel.app/#split:same)
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
/allowlist thetenkeys.vercel.app x.com/thetenkeys
```

### Confirmed

| Check | Command | Result |
|---|---|---|
| Welcome | `/setwelcome` | set by the owner on 2026-10-06, the bot reply was not saved |
| Locks | `/locks` | set by the owner on 2026-10-06, the status command reply was not saved |
| Antiflood | `/flood` | set by the owner on 2026-10-06, the status command reply was not saved |
| Allowed links | `/allowlist` | set by the owner on 2026-10-06, the status command reply was not saved |
| Automatic antiraid | `/autoantiraid` | set by the owner on 2026-10-06, the status command reply was not saved |

Note: `/antiraid` shows the manual mode only. If it offers to switch on for 6 hours, press Cancel.
The automatic protection is checked with `/autoantiraid` without a number.

## 4. Entry check

Captcha commands, in case bots get through on launch day (sent in the group):
`/captcha on`, `/captchamode math`, `/captchakick on`, `/captchakicktime 5m`.

A new member passes one check: the Safeguard portal.

Entry path with a second account (portal, Safeguard check, welcome): passed, confirmed by the owner on 2026-10-06.

## 5. Buy bot (launch day)

It needs a contract address, so it cannot be set up before launch.

Plan A — Safeguard buy bot (already admin in the group, docs say it is ad free):

1. In the group send `/add` and press the button.
2. Chain: Solana. Paste the contract address. Choose the top pair.
3. In `/settings`: min buy, emoji `🔑`, step, media (`brand/exports/tenkeys_avatar.png`).

Plan B — Bobby (`@BobbyBuyBot`). Tested on 2026-10-02 in a test group: works on Solana,
but every buy message has 4 ad elements (two text lines, BOOST and GET SEEN buttons, link to a third-party trading bot).

Open question for both bots: buys while the token is still on the pump.fun bonding curve.
Not verified. Check in the first minutes after launch.

Not used: volume bots, paid trending, paid boosts.

## 6. Launch-day checklist

- [ ] Portal text: set the full text again (see the known flaw at the top) with the contract address instead of the "not live yet" line.
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
