// What may not stand on the street: names on doors and words on own neon signs.
// Used by the server (api/street.js: a house with such words is not taken, and an old one is not shown) and by the page
// (the visitor sees why at once, and a friend's name from an invite link is not shown).
//
// Blocked: swearing and sexual words (English, Hindi and Russian in Latin letters), slurs, hate, links and other sites,
// promo and fake "official" names, other coins' tickers on signs, and holy names next to a mocking word.
// Holy names alone are allowed: Ram, Krishna, Mohammed, Jesus and the rest are also everyday first names.
//
// How it reads a text: lower case, accents off, look-alike digits and signs become letters (0→o, 1→i, 3→e, 4→a, 5→s,
// 7→t, 8→b, 9→g, @→a, $→s, !→i), a letter may repeat (fuuuck), separate letters are joined (f u c k, f.u.c.k).
// Two kinds of lists: TOKEN words count only as a whole word (so "class", "peacock" and "cumin" stay fine),
// PART words count anywhere inside a word ("fuckyou"). Words are checked one by one, never glued together,
// so "push it" or "bass hit" are not read as a swear word.
// More words for one site: env STREET_BLOCK on the server (see api/street.js).

const PART = [
  // English
  'fuck', 'shit', 'cunt', 'nigg', 'faggot', 'fagot', 'bitch', 'whore', 'slut', 'bastard', 'motherf', 'dickhead', 'asshole', 'arsehole',
  'wanker', 'twat', 'retard', 'penis', 'vagina', 'dildo', 'blowjob', 'handjob', 'porn', 'hentai', 'orgasm', 'jizz', 'onlyfans', 'pussies',
  'cocksuck', 'bullshit', 'phuck', 'phuk',
  // Hindi in Latin letters
  'madarchod', 'madarchot', 'maderchod', 'madarjat', 'behenchod', 'bhenchod', 'bhanchod', 'benchod', 'bahanchod', 'chutiya', 'chutia',
  'chootiya', 'chutiye', 'bhosd', 'bhosad', 'gaandu', 'gandu', 'lavda', 'lawda', 'jhaant', 'jhant', 'harami', 'haraami', 'randwa', 'chinal',
  'kutiya', 'chodu', 'gaand',
  // Russian in Latin letters
  'blyat', 'blyad', 'pizd', 'zalupa', 'pidor', 'pidar', 'gandon', 'shluha', 'yebat', 'huesos', 'ebanat',
  // hate
  'hitler', 'genocide', 'terrorist', 'kafir', 'kaafir', 'katua', 'katwa', 'wetback', 'raghead', 'towelhead', 'tranny', 'jihadi',
  // other sites and promo
  'telegram', 'discord', 'whatsapp', 'instagram', 'youtube', 'tiktok', 'airdrop', 'giveaway', 'presale', 'rugpull', 'honeypot',
  'dotcom', 'https', 'http', 'www',
];
const TOKEN = [
  'ass', 'arse', 'cum', 'tit', 'cock', 'dick', 'fag', 'sex', 'sexy', 'xxx', 'anal', 'rape', 'raped', 'prick', 'nude', 'boob', 'horny', 'milf',
  'pedo', 'rapist', 'fuk', 'fck', 'fk', 'stfu', 'kys', 'wank', 'pussy', 'lund', 'loda', 'lauda', 'randi', 'tatti', 'gand', 'chod', 'bc', 'mc', 'bkl',
  'mkc', 'suka', 'huy', 'hui', 'khuy', 'ebat', 'ebal', 'mudak', 'nazi', 'heil', 'kkk', 'isis', 'paki', 'chink', 'spic', 'gook', 'coon',
  'dyke', 'negro', 'kike', 'chamar', 'bhangi', 'dm', 'tg', 'admin', 'mod', 'moderator', 'support', 'official', 'scam',
];
// holy names, faiths and holy places: allowed alone, blocked next to a MOCK word
const HOLY = [
  'god', 'allah', 'muhammad', 'mohammed', 'mohammad', 'muhammed', 'prophet', 'jesus', 'christ', 'krishna', 'shiva', 'shiv', 'vishnu',
  'brahma', 'ganesh', 'ganesha', 'ganpati', 'ganapati', 'hanuman', 'lakshmi', 'laxmi', 'durga', 'kali', 'saraswati', 'parvati', 'rama',
  'ram', 'sita', 'buddha', 'nanak', 'quran', 'koran', 'bible', 'gita', 'veda', 'torah', 'temple', 'mandir', 'mosque', 'masjid', 'church',
  'gurdwara', 'pope', 'hindu', 'muslim', 'islam', 'christian', 'sikh', 'jew', 'jewish', 'jain', 'bhagwan', 'ishwar', 'mahadev', 'bajrang',
];
// the ones that also count inside a longer word ("allahsucks"); not the ones that start everyday words (christmas, churchill, shivam)
const HOLY_PART = ['allah', 'muhammad', 'mohammed', 'mohammad', 'muhammed', 'prophet', 'jesus', 'krishna', 'vishnu', 'ganesh', 'ganpati',
  'ganapati', 'hanuman', 'lakshmi', 'laxmi', 'durga', 'saraswati', 'parvati', 'buddha', 'quran', 'koran', 'bible', 'mosque', 'masjid',
  'mandir', 'gurdwara', 'muslim', 'bhagwan', 'mahadev', 'bajrang'];
const MOCK = [
  'pig', 'pork', 'beef', 'dog', 'donkey', 'monkey', 'rat', 'gay', 'loser', 'fake', 'fraud', 'suck', 'sucks', 'stupid', 'idiot', 'fool',
  'ullu', 'dumb', 'joke', 'lol', 'lmao', 'hate', 'hater', 'kill', 'die', 'dead', 'burn', 'trash', 'garbage', 'anti', 'ugly', 'liar',
  'devil', 'satan', 'demon', 'evil', 'shame', 'crap', 'poop', 'potty', 'not', 'down', 'death',
];
// the end of a web address: a dot, then one of these
const TLD = 'com|net|org|io|xyz|fun|sol|app|gg|me|co|ru|in|ly|to|sh|tv|live|site|online|club|link|pro|ai|so|dev|top|vip|cc|biz|info|us|uk|eth|bet|cash|money|finance|exchange|trade|wtf|meme|art|nft|dao|game|games|world|space|tech|store|shop|lol';

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', 9: 'g', '@': 'a', $: 's', '!': 'i', '|': 'i' };
const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// each letter may repeat: "fuck" also catches "fuuuck"; double letters stay double ("ass" never matches "as")
const pat = (w) => w.split('').map((c) => `${esc(c)}+`).join('');
const whole = (list) => new RegExp(`^(?:${list.map(pat).join('|')})s*$`);
const inside = (list) => new RegExp(list.map(pat).join('|'));
const RE = {
  part: inside(PART), token: whole(TOKEN),
  holyTok: whole(HOLY), holyIn: inside(HOLY_PART),
  mockTok: whole(MOCK), mockIn: inside(MOCK.filter((w) => w.length >= 5)),
  link: new RegExp(`(https?|www\\.|:\\/\\/|t\\.me\\b|\\.(?:${TLD})\\b|\\bdot\\s*(?:${TLD})\\b)`, 'i'),
};

/** The text as the filter sees it: the words as written, plus very short pieces glued back (f u c k, fu ck, f.u.c.k). */
export function readText(text) {
  const low = String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const plain = low.replace(/[0-9@$!|]/g, (c) => LEET[c] ?? c);
  const raw = plain.split(/[^a-z]+/).filter(Boolean);
  // pieces of one or two letters next to each other are one word: f u c k, fu ck, f.u.c.k
  const words = [];
  let glue = false;
  for (const t of raw) {
    const short = t.length <= 2;
    if (short && glue) words[words.length - 1] += t; else words.push(t);
    glue = short;
  }
  return { low, words: [...new Set([...raw, ...words])] };
}

/**
 * True when a name or a sign may not stand on the street.
 * opts.ticker: the site's own ticker (a sign may say $ULLU, not another coin's ticker); opts.extra: more words (STREET_BLOCK).
 */
export function isBadText(text, opts = {}) {
  const s = String(text || '');
  if (!s.trim()) return false;
  const { low, words } = readText(s);
  if (RE.link.test(low)) return true;
  if (/1488/.test(low)) return true;
  // another coin's ticker on a sign is an ad
  const own = String(opts.ticker || '').toLowerCase();
  for (const m of low.matchAll(/\$([a-z][a-z0-9]{1,11})/g)) if (m[1] !== own) return true;
  if (words.some((w) => RE.part.test(w) || RE.token.test(w))) return true;
  const holy = words.some((w) => RE.holyTok.test(w) || RE.holyIn.test(w));
  if (holy && words.some((w) => RE.mockTok.test(w) || RE.mockIn.test(w))) return true;
  const extra = (opts.extra || []).map((w) => String(w).trim().toLowerCase()).filter(Boolean);
  if (extra.some((w) => low.includes(w))) return true;
  return false;
}
