// The decorations of the "lights" layout: about 120 of them in nine groups, all drawn by code (no pictures needed).
// Each one has a rarity (how often the owl brings it), how much light it adds, where it may go on the house
// (slots, see lights-houses.js) and an English name and note (config.house.items can change the words).
//
// Slot kinds: line and door (garlands across), hang (under a window or a balcony), sill (on a window sill),
// side (on the ground next to the door), step (the doorstep), roof, win (inside a window), wall (anywhere: free only).
// Every item except window and paint items can also be put anywhere on the picture ("free"), dragged and resized.
import { OUT, f1 } from './lights-houses.js';

const INK = '#141026';
export const RARITIES = { common: 70, rare: 22, epic: 7, legendary: 1 };
export const RARITY_IDS = Object.keys(RARITIES);
export const CATEGORIES = ['lamps', 'lanterns', 'garlands', 'neon', 'signs', 'stickers', 'yard', 'windows', 'paint'];

// ---------------------------------------------------------------- the catalogue
// [id, type, category, rarity, light, kinds, options, name, note]
const STAND = ['sill', 'side', 'roof'], HANG = ['hang'], LINE = ['line', 'door'], WALL = ['wall'];
const C = [
  // lamps
  ['diya', 'diya', 'lamps', 'common', 6, ['sill', 'side'], {}, 'Diya', 'A clay lamp. The owl says it is a classic.'],
  ['diya-pink', 'diya', 'lamps', 'common', 6, ['sill', 'side'], { body: '#E0218A', rim: '#FFC94A' }, 'Painted diya', 'A clay lamp painted pink. Somebody had a lot of free time.'],
  ['diya-teal', 'diya', 'lamps', 'common', 6, ['sill', 'side'], { body: '#0F9D8F', rim: '#FFE47A' }, 'Peacock diya', 'Teal and gold. Fancy.'],
  ['diya-brass', 'diya', 'lamps', 'rare', 10, ['sill', 'side'], { body: '#C9A227', rim: '#FFF3B0', tall: true }, 'Brass lamp', 'Heavy, shiny, from somebody\'s grandmother.'],
  ['diya-five', 'diya', 'lamps', 'epic', 18, ['sill', 'side', 'roof'], { body: '#B5651D', rim: '#FFD27A', wicks: 5 }, 'Five-flame lamp', 'Five flames. The owl approves of excess.'],
  ['diya-float', 'diya', 'lamps', 'rare', 9, ['sill', 'side'], { body: '#2EC4B6', rim: '#FFFFFF', bowl: true }, 'Floating lamp', 'A lamp in a bowl of water with petals.'],
  ['golddiya', 'diya', 'lamps', 'epic', 14, ['sill', 'side'], { body: '#F7C531', rim: '#E0218A', holder: true }, 'Golden diya', 'A diya of gold, for holders. Twice the light.'],
  ['jar', 'jar', 'lamps', 'common', 5, STAND, { glass: '#FFB2D9' }, 'Candle jar', 'A candle in a pink jar. Smells like roses. Allegedly.'],
  ['jar-blue', 'jar', 'lamps', 'common', 5, STAND, { glass: '#9EDBFF' }, 'Blue candle jar', 'Calm light for calm people.'],
  ['oillamp', 'oillamp', 'lamps', 'rare', 10, ['sill', 'side', 'hang'], {}, 'Hurricane lamp', 'Works in wind, rain and family arguments.'],
  ['bulb', 'bulb', 'lamps', 'common', 12, ['hang', 'sill'], { color: '#FFE47A' }, 'Bare bulb', 'One very bright bulb. The owl hugged it for an hour before leaving it.'],
  ['bulb-pink', 'bulb', 'lamps', 'common', 11, ['hang', 'sill'], { color: '#FF8AD1' }, 'Pink bulb', 'Everything looks better in pink.'],
  ['bulb-cyan', 'bulb', 'lamps', 'common', 11, ['hang', 'sill'], { color: '#7AF0FF' }, 'Cyan bulb', 'Cold light, warm heart.'],
  ['bulb-lime', 'bulb', 'lamps', 'common', 11, ['hang', 'sill'], { color: '#B6FF7A' }, 'Lime bulb', 'The colour of a green candle.'],
  ['bulb-giant', 'bulb', 'lamps', 'epic', 22, HANG, { color: '#FFE47A', big: true }, 'Giant bulb', 'Seen from space. The owl checked.'],
  ['disco', 'disco', 'lamps', 'epic', 18, HANG, {}, 'Disco ball', 'The house is a club now.'],
  ['jhoomar', 'jhoomar', 'lamps', 'legendary', 24, HANG, { holder: true }, 'Golden chandelier', 'A jhoomar for holders. The street will see it from the moon.'],
  ['crystal', 'crystal', 'lamps', 'legendary', 26, HANG, {}, 'Crystal chandelier', 'Stolen from a palace. The owl will not say which one.'],
  // lanterns
  ['lantern', 'star', 'lanterns', 'common', 9, ['hang', 'side', 'roof'], { color: '#E0218A' }, 'Sky lantern', 'A paper star lantern. Visible from very far, which is the point.'],
  ['star-orange', 'star', 'lanterns', 'common', 9, HANG, { color: '#FF8A1C' }, 'Orange star lantern', 'A paper star the colour of marigolds.'],
  ['star-teal', 'star', 'lanterns', 'common', 9, HANG, { color: '#0FB5A6' }, 'Teal star lantern', 'A paper star from the market, slightly bent.'],
  ['star-gold', 'star', 'lanterns', 'rare', 13, HANG, { color: '#F7C531' }, 'Golden star lantern', 'Shiny paper. Feels expensive.'],
  ['kandil', 'kandil', 'lanterns', 'rare', 11, HANG, { color: '#8F5CFF' }, 'Kandil', 'A tall hexagon lantern with tassels.'],
  ['kandil-red', 'kandil', 'lanterns', 'rare', 11, HANG, { color: '#E63946' }, 'Red kandil', 'Tassels everywhere. The owl got tangled.'],
  ['chinese', 'chinese', 'lanterns', 'common', 9, HANG, { color: '#D7263D' }, 'Red lantern', 'A round red lantern. Good luck, they say.'],
  ['chinese-gold', 'chinese', 'lanterns', 'rare', 12, HANG, { color: '#F2B705' }, 'Gold lantern', 'A round gold lantern. Better luck, they say.'],
  ['paper', 'paper', 'lanterns', 'common', 8, HANG, { color: '#FFF3DD' }, 'Paper ball', 'A white paper ball lamp. Simple, glowing.'],
  ['paper-pink', 'paper', 'lanterns', 'common', 8, HANG, { color: '#FFC2E2' }, 'Pink paper ball', 'A paper ball lamp, pink edition.'],
  ['skylamp', 'skylamp', 'lanterns', 'rare', 10, ['roof', 'hang'], {}, 'Flying lantern', 'It wants to fly. Tie it down.'],
  ['moonlamp', 'moonlamp', 'lanterns', 'epic', 18, HANG, {}, 'Moon lantern', 'A little moon of your own. The real one is jealous.'],
  // garlands
  ['string', 'string', 'garlands', 'common', 14, LINE, { colors: ['#FFE47A', '#FF7AC8', '#7AF0FF', '#FFB52E', '#B6FF7A'] }, 'Fairy lights', 'A string of bulbs. The owl tangled it on the way.'],
  ['string-warm', 'string', 'garlands', 'common', 13, LINE, { colors: ['#FFE9A8', '#FFD36B'] }, 'Warm fairy lights', 'Warm white, like a hotel lobby.'],
  ['string-candy', 'string', 'garlands', 'common', 13, LINE, { colors: ['#FF7AC8', '#7AF0FF'] }, 'Candy lights', 'Pink and blue. Tastes like sugar.'],
  ['string-jungle', 'string', 'garlands', 'common', 13, LINE, { colors: ['#B6FF7A', '#FFC94A'] }, 'Jungle lights', 'Green and gold, like a parrot.'],
  ['string-icicle', 'string', 'garlands', 'rare', 15, LINE, { colors: ['#E8F6FF'], icicle: true }, 'Icicle lights', 'Cold light dripping from the roof.'],
  ['string-heart', 'string', 'garlands', 'rare', 15, LINE, { colors: ['#FF3F7F', '#FF8AD1'], shape: 'heart' }, 'Heart lights', 'Hearts on a wire. Romantic and slightly too much.'],
  ['string-star', 'string', 'garlands', 'epic', 18, LINE, { colors: ['#FFE47A', '#FFFFFF'], shape: 'star' }, 'Star lights', 'Little stars on a wire. The owl thinks they are his.'],
  ['string-blink', 'string', 'garlands', 'epic', 18, LINE, { colors: ['#FF7AC8', '#7AF0FF', '#FFE47A', '#B6FF7A'], blink: true }, 'Blinking lights', 'They blink. The neighbours cannot sleep.'],
  ['string-gold', 'string', 'garlands', 'legendary', 24, LINE, { colors: ['#F7C531', '#FFF3B0'], blink: true, holder: true }, 'Golden lights', 'Gold bulbs on a gold wire, for holders.'],
  ['marigold', 'marigold', 'garlands', 'common', 4, LINE, { colors: ['#FF8A1C', '#FF8A1C', '#FFC94A'] }, 'Marigolds', 'A garland of marigolds. Smells like a wedding.'],
  ['marigold-yellow', 'marigold', 'garlands', 'common', 4, LINE, { colors: ['#FFC94A', '#FFE066'] }, 'Yellow marigolds', 'Yellow, like the sun at seven in the morning.'],
  ['toran', 'toran', 'garlands', 'rare', 6, LINE, {}, 'Toran', 'Mango leaves and marigolds over the door. Very proper.'],
  ['bunting', 'bunting', 'garlands', 'common', 2, LINE, { colors: ['#E0218A', '#FFC94A', '#2EC4B6', '#8F5CFF'] }, 'Paper flags', 'Little flags. Every house party needs them.'],
  ['bunting-gold', 'bunting', 'garlands', 'rare', 5, LINE, { colors: ['#F7C531', '#FFF3B0'] }, 'Gold flags', 'Shiny flags. Fancier party.'],
  ['tassels', 'tassels', 'garlands', 'rare', 3, LINE, { colors: ['#E0218A', '#FF8A1C', '#8F5CFF'] }, 'Tassel garland', 'Colourful tassels that dance in the wind.'],
  ['pompom', 'pompom', 'garlands', 'common', 2, LINE, { colors: ['#FF7AC8', '#FFE066', '#7AF0FF'] }, 'Pom-pom string', 'Soft balls on a string. Cats love it.'],
  // neon (free, anywhere)
  ['neon-heart', 'neon', 'neon', 'rare', 12, WALL, { shape: 'heart', color: '#FF3FA4' }, 'Neon heart', 'A pink heart that hums a little.'],
  ['neon-star', 'neon', 'neon', 'rare', 12, WALL, { shape: 'star', color: '#FFE066' }, 'Neon star', 'A star that never falls.'],
  ['neon-moon', 'neon', 'neon', 'rare', 12, WALL, { shape: 'moon', color: '#7AF0FF' }, 'Neon moon', 'A moon for your wall. The owl likes it.'],
  ['neon-bolt', 'neon', 'neon', 'common', 10, WALL, { shape: 'bolt', color: '#FFE066' }, 'Neon bolt', 'Pure energy. Mostly decorative.'],
  ['neon-arrow', 'neon', 'neon', 'common', 10, WALL, { shape: 'arrow', color: '#B6FF7A' }, 'Neon arrow', 'Points up. Only up.'],
  ['neon-coin', 'neon', 'neon', 'rare', 13, WALL, { shape: 'coin', color: '#FFC94A' }, 'Neon coin', 'A glowing coin. Not legal tender.'],
  ['neon-diamond', 'neon', 'neon', 'epic', 16, WALL, { shape: 'diamond', color: '#9EF0FF' }, 'Neon diamond', 'Diamond hands, in neon.'],
  ['neon-rocket', 'neon', 'neon', 'epic', 16, WALL, { shape: 'rocket', color: '#FF8A1C' }, 'Neon rocket', 'Pointing at the moon. Obviously.'],
  ['neon-owl', 'neon', 'neon', 'legendary', 24, WALL, { shape: 'owl', color: '#FFE066' }, 'Neon owl', 'The owl in neon. He posed for it.'],
  ['net', 'net', 'neon', 'rare', 16, WALL, { colors: ['#FFE47A', '#FF7AC8', '#7AF0FF'] }, 'Net lights', 'A whole wall of tiny bulbs.'],
  ['curtain', 'curtainlights', 'neon', 'epic', 18, WALL, { colors: ['#FFF3B0', '#FFE47A'] }, 'Curtain lights', 'Strands of light falling down the wall.'],
  // signs (free, anywhere)
  ['sign-gm', 'sign', 'signs', 'common', 8, WALL, { text: 'GM', color: '#FFE066' }, 'GM sign', 'Good morning. At night. As usual.'],
  ['sign-wagmi', 'sign', 'signs', 'rare', 10, WALL, { text: 'WAGMI', color: '#B6FF7A' }, 'WAGMI sign', 'We are all going to make it. The sign says so.'],
  ['sign-hodl', 'sign', 'signs', 'rare', 10, WALL, { text: 'HODL', color: '#7AF0FF' }, 'HODL sign', 'Hold the light. Hold everything.'],
  ['sign-lfg', 'sign', 'signs', 'common', 8, WALL, { text: 'LFG', color: '#FF8A1C' }, 'LFG sign', 'Three letters, maximum energy.'],
  ['sign-moon', 'sign', 'signs', 'epic', 12, WALL, { text: 'TO THE MOON', color: '#FFE066' }, 'To the moon sign', 'The owl says he has been there. Twice.'],
  ['sign-open', 'sign', 'signs', 'common', 8, WALL, { text: 'OPEN 24/7', color: '#FF3F7F' }, 'Open sign', 'This house never closes.'],
  ['sign-nosleep', 'sign', 'signs', 'rare', 10, WALL, { text: 'NO SLEEP', color: '#8F5CFF' }, 'No sleep sign', 'For the night owls. And the owl.'],
  ['sign-owlhouse', 'sign', 'signs', 'rare', 10, WALL, { text: 'OWL HOUSE', color: '#FFC94A' }, 'Owl house sign', 'So the owl does not have to ask for directions.'],
  ['sign-hoot', 'sign', 'signs', 'common', 8, WALL, { text: 'HOOT', color: '#7AF0FF' }, 'Hoot sign', 'One word. Says everything.'],
  ['sign-brightest', 'sign', 'signs', 'epic', 12, WALL, { text: 'BRIGHTEST', color: '#FFE066' }, 'Brightest sign', 'Modest it is not.'],
  ['sign-ticker', 'sign', 'signs', 'legendary', 20, WALL, { text: '$TICKER', color: '#FFC94A' }, 'Ticker sign', 'The ticker in lights. The owl\'s favourite word.'],
  ['sign-custom', 'sign', 'signs', 'epic', 12, WALL, { text: '', color: '#FF3FA4', custom: true }, 'Your own sign', 'Write anything. Well, almost anything.'],
  // stickers and posters (free)
  ['poster-moon', 'poster', 'stickers', 'common', 0, WALL, { kind: 'moon' }, 'Moon poster', 'A poster of the moon, slightly torn.'],
  ['poster-candle', 'poster', 'stickers', 'rare', 0, WALL, { kind: 'candle' }, 'Green candle poster', 'One big green candle. Inspirational.'],
  ['poster-wanted', 'poster', 'stickers', 'rare', 0, WALL, { kind: 'wanted' }, 'Wanted poster', 'Wanted: one owl. Reward: everything.'],
  ['poster-rocket', 'poster', 'stickers', 'common', 0, WALL, { kind: 'rocket' }, 'Rocket poster', 'A rocket on a poster. Up only.'],
  ['poster-chart', 'poster', 'stickers', 'epic', 1, WALL, { kind: 'chart' }, 'Up only chart', 'A chart that goes only up. Framed.'],
  ['sticker-star', 'sticker', 'stickers', 'common', 1, WALL, { kind: 'star', color: '#FFE066' }, 'Star sticker', 'A shiny star sticker.'],
  ['sticker-heart', 'sticker', 'stickers', 'common', 1, WALL, { kind: 'heart', color: '#FF3FA4' }, 'Heart sticker', 'Love, in sticker form.'],
  ['sticker-fire', 'sticker', 'stickers', 'common', 1, WALL, { kind: 'fire', color: '#FF8A1C' }, 'Fire sticker', 'This house is on fire. In a good way.'],
  ['sticker-coin', 'sticker', 'stickers', 'rare', 2, WALL, { kind: 'coin', color: '#FFC94A' }, 'Coin sticker', 'A golden coin. Peel carefully.'],
  ['sticker-sparkle', 'sticker', 'stickers', 'common', 2, WALL, { kind: 'sparkle', color: '#FFFFFF' }, 'Sparkle sticker', 'Sparkles make everything better.'],
  ['sticker-diamond', 'sticker', 'stickers', 'rare', 2, WALL, { kind: 'diamond', color: '#9EF0FF' }, 'Diamond sticker', 'Fake diamond. Real shine.'],
  ['sticker-eye', 'sticker', 'stickers', 'rare', 1, WALL, { kind: 'eye', color: '#2440D8' }, 'Lucky eye', 'A blue glass eye that watches over the house.'],
  ['graffiti', 'graffiti', 'stickers', 'epic', 2, WALL, { color: '#B6FF7A' }, 'Graffiti', 'Somebody tagged your wall. It is actually good.'],
  // yard and roof
  ['rangoli', 'rangoli', 'yard', 'common', 7, ['step'], { colors: ['#E0218A', '#FF9F1C', '#2EC4B6', '#FFC94A', '#8F5CFF'] }, 'Rangoli', 'A pattern for the doorstep. The owl stepped on one corner.'],
  ['rangoli-sun', 'rangoli', 'yard', 'common', 7, ['step'], { colors: ['#FF8A1C', '#FFE066', '#E63946', '#FFC94A', '#7A1F5C'], petals: 12 }, 'Sun rangoli', 'Orange and yellow, like a sunrise on the step.'],
  ['rangoli-sea', 'rangoli', 'yard', 'rare', 9, ['step'], { colors: ['#2440D8', '#7AF0FF', '#2EC4B6', '#FFFFFF', '#8F5CFF'], petals: 10 }, 'Sea rangoli', 'Blue waves on the doorstep.'],
  ['rangoli-gold', 'rangoli', 'yard', 'epic', 14, ['step'], { colors: ['#F7C531', '#FFF3B0', '#E0218A', '#FFC94A', '#B5651D'], petals: 16 }, 'Golden rangoli', 'Gold powder. Do not sneeze.'],
  ['pot', 'pot', 'yard', 'common', 2, STAND, { plant: 'marigold' }, 'Flower pot', 'Marigolds in a pot. Does not glow, looks rich.'],
  ['pot-cactus', 'pot', 'yard', 'common', 1, STAND, { plant: 'cactus' }, 'Cactus', 'Needs no water and no attention. Relatable.'],
  ['pot-palm', 'pot', 'yard', 'common', 1, STAND, { plant: 'palm' }, 'Little palm', 'A palm tree for the window. Holiday mood.'],
  ['pot-roses', 'pot', 'yard', 'rare', 2, STAND, { plant: 'roses' }, 'Roses', 'Red roses. Somebody likes you.'],
  ['kite', 'kite', 'yard', 'rare', 1, ['roof'], { color: '#FF3FA4' }, 'Kite', 'A kite on the roof, waiting for wind.'],
  ['kite-blue', 'kite', 'yard', 'rare', 1, ['roof'], { color: '#2440D8' }, 'Blue kite', 'This one won a kite fight. Allegedly.'],
  ['scooter', 'scooter', 'yard', 'epic', 4, ['side'], { color: '#2EC4B6' }, 'Scooter', 'A scooter with fairy lights on the handlebars.'],
  ['speaker', 'speaker', 'yard', 'rare', 3, ['side'], {}, 'Speaker', 'Very loud. The street dances.'],
  ['owlstatue', 'owlstatue', 'yard', 'epic', 4, ['side', 'roof'], {}, 'Owl statue', 'A stone owl. The real owl is offended.'],
  ['catfig', 'catfig', 'yard', 'rare', 2, ['side', 'roof', 'sill'], {}, 'Lucky cat', 'A cat that waves forever.'],
  ['dish-lights', 'dish', 'yard', 'rare', 8, ['roof'], {}, 'Satellite dish lights', 'Receives 200 channels and the owl\'s signals.'],
  ['slipper', 'slipper', 'yard', 'common', 0, ['roof', 'step'], {}, 'One slipper', 'Wrong address. The owl left a slipper instead.'],
  ['feather', 'feather', 'yard', 'common', 1, ['sill', 'roof'], {}, 'Owl feather', 'The owl flew by and left a feather. A promise, he says.'],
  // windows
  ['curtains-pink', 'curtains', 'windows', 'common', 3, ['win'], { color: '#FF7AC8' }, 'Pink curtains', 'Pink curtains with a warm glow behind them.'],
  ['curtains-gold', 'curtains', 'windows', 'rare', 5, ['win'], { color: '#F7C531' }, 'Gold curtains', 'Silk curtains. The house is fancy now.'],
  ['curtains-blue', 'curtains', 'windows', 'common', 3, ['win'], { color: '#5EC8F2' }, 'Blue curtains', 'Calm blue curtains.'],
  ['dancers', 'dancers', 'windows', 'epic', 6, ['win'], {}, 'Party in the window', 'Shadows of people dancing. Every night.'],
  ['tvglow', 'tvglow', 'windows', 'common', 4, ['win'], {}, 'TV glow', 'Somebody is watching the match.'],
  ['wincat', 'wincat', 'windows', 'rare', 3, ['win'], {}, 'Cat in the window', 'A cat watching the street. Judging.'],
  ['winhearts', 'winhearts', 'windows', 'rare', 6, ['win'], {}, 'Window hearts', 'Little heart lights hanging in the window.'],
  ['winstar', 'winstar', 'windows', 'common', 5, ['win'], {}, 'Window star', 'A paper star stuck to the glass.'],
  // paint for the walls
  ['paint-gold', 'paint', 'paint', 'rare', 0, ['paint'], { color: '#F7B32B' }, 'Gold paint', 'Paints the whole house gold.'],
  ['paint-pink', 'paint', 'paint', 'common', 0, ['paint'], { color: '#FF7AA2' }, 'Pink paint', 'Paints the whole house pink.'],
  ['paint-mint', 'paint', 'paint', 'common', 0, ['paint'], { color: '#7FE0C2' }, 'Mint paint', 'Paints the whole house mint.'],
  ['paint-sky', 'paint', 'paint', 'common', 0, ['paint'], { color: '#7EC8F2' }, 'Sky paint', 'Paints the whole house sky blue.'],
  ['paint-lilac', 'paint', 'paint', 'common', 0, ['paint'], { color: '#B892FF' }, 'Lilac paint', 'Paints the whole house lilac.'],
  ['paint-white', 'paint', 'paint', 'common', 0, ['paint'], { color: '#F4F1EA' }, 'White paint', 'A clean white house. Lights look brighter on it.'],
  ['paint-neon', 'paint', 'paint', 'epic', 0, ['paint'], { color: '#FF3FA4' }, 'Neon paint', 'Hot pink, all of it. Visible from the next city.'],
  ['paint-goldleaf', 'paint', 'paint', 'legendary', 0, ['paint'], { color: '#E8C547', holder: true }, 'Gold leaf', 'Real-looking gold on every wall, for holders.'],
];

// no prototype: a key from outside (a house code, the browser's storage) like "constructor" is not an item
export const ITEMS = Object.create(null);
for (const [id, type, cat, rarity, light, kinds, o, name, note] of C) ITEMS[id] = { id, type, cat, rarity, light, kinds, ...o, holder: Boolean(o.holder), name, note, free: !kinds.includes('win') && !kinds.includes('paint') };
export const ITEM_IDS = Object.keys(ITEMS);
/** The item with this id, or undefined. Only a string can be an id: an object from a crafted code is not looked up
 * at all (looking it up would call its own toString). */
export const itemOf = (id) => (typeof id === 'string' ? ITEMS[id] : undefined);
export const START_ITEMS = { diya: 2, string: 1 };
/** Open from the first visit: every common decoration (not the golden holder ones). They never run out (OPEN_STOCK each);
 * the owl brings only rare, epic and legendary ones. */
export const OPEN_STOCK = 99;
export const OPEN_ITEMS = ITEM_IDS.filter((i) => ITEMS[i].rarity === 'common' && !ITEMS[i].holder);
export const isOpen = (i) => typeof i === 'string' && OPEN_ITEMS.includes(i);

// ---------------------------------------------------------------- drawing helpers
const flame = (x, y, k = 1) => `<path d="M${f1(x)} ${f1(y - 16 * k)}c${f1(5 * k)} ${f1(7 * k)} ${f1(8 * k)} ${f1(11 * k)} ${f1(8 * k)} ${f1(15 * k)}a${f1(8 * k)} ${f1(8 * k)} 0 0 1-${f1(16 * k)} 0c0-${f1(4 * k)} ${f1(3 * k)}-${f1(8 * k)} ${f1(8 * k)}-${f1(15 * k)}z" fill="#FFB52E"/><path d="M${f1(x)} ${f1(y - 9 * k)}c${f1(2.6 * k)} ${f1(4 * k)} ${f1(4 * k)} ${f1(6 * k)} ${f1(4 * k)} ${f1(8 * k)}a${f1(4 * k)} ${f1(4 * k)} 0 0 1-${f1(8 * k)} 0c0-${f1(2 * k)} ${f1(1.4 * k)}-${f1(4 * k)} ${f1(4 * k)}-${f1(8 * k)}z" fill="#FFF3B0"/>`;
const glow = (x, y, r, g) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#ul-glow)" opacity="${(0.55 + 0.45 * g).toFixed(2)}"/>`;
const tint = (x, y, r, col, g) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" opacity="${(0.05 + 0.07 * g).toFixed(2)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.6)}" fill="${col}" opacity="${(0.07 + 0.1 * g).toFixed(2)}"/>`;
export const sag = (x1, x2, y, d) => `M${f1(x1)} ${f1(y)}Q${f1((x1 + x2) / 2)} ${f1(y + d)} ${f1(x2)} ${f1(y)}`;
const onSag = (x1, x2, y, d, t) => { const mx = (x1 + x2) / 2, my = y + d, u = 1 - t; return [u * u * x1 + 2 * u * t * mx + t * t * x2, u * u * y + 2 * u * t * my + t * t * y]; };
const blinkAnim = (i) => `<animate attributeName="opacity" values="1;.25;1" dur="1.4s" begin="${(i * 0.18).toFixed(2)}s" repeatCount="indefinite"/>`;
const heartPath = (x, y, s) => `M${f1(x)} ${f1(y + s * 0.9)}C${f1(x - s * 1.6)} ${f1(y - s * 0.2)} ${f1(x - s * 0.7)} ${f1(y - s * 1.3)} ${f1(x)} ${f1(y - s * 0.4)}C${f1(x + s * 0.7)} ${f1(y - s * 1.3)} ${f1(x + s * 1.6)} ${f1(y - s * 0.2)} ${f1(x)} ${f1(y + s * 0.9)}z`;
const starPath = (x, y, r, n = 5, k = 0.45) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n - Math.PI / 2, rr = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`; } return d + 'z'; };
const neonStroke = (d, col, w = 4) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w * 3.2}" stroke-linecap="round" stroke-linejoin="round" opacity=".22"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="${(w * 0.35).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Words allowed on a custom sign: capital Latin letters, numbers and a few signs, up to 14 characters. */
export function cleanSign(t) {
  // only text or a number: an object from a crafted code (with its own toString) must not reach String()
  const s = (typeof t === 'string' || typeof t === 'number' ? String(t) : '').toUpperCase().replace(/[^A-Z0-9 !?$#&.+\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14);
  if (/(HTTPS?|WWW\.|\.COM|\.IO|\.XYZ|\.FUN|\.SOL|T\.ME)/.test(s)) return '';
  return s;
}

/**
 * SVG of one decoration. A point slot gives {x,y}; a line slot gives {x1,x2,y}; a window slot gives {x,y,w,h}.
 * g = glow 0…1. Glow uses the gradient #ul-glow. ctx: { ticker, text } for signs.
 */
export function drawItem(id, slot, g = 1, ctx = {}) {
  const it = itemOf(id);
  if (!it) return '';
  const { x = 0, y = 0 } = slot;
  switch (it.type) {
    case 'diya': {
      const k = it.wicks ? 1.25 : 1;
      let s = glow(x, y - 12, (it.wicks ? 46 : 30) * (it.holder ? 1.3 : 1), g);
      if (it.bowl) s += `<ellipse cx="${x}" cy="${y - 2}" rx="22" ry="7" fill="${it.body}" ${OUT}/><circle cx="${x - 14}" cy="${y - 5}" r="3.5" fill="#FF7AC8"/><circle cx="${x + 13}" cy="${y - 4}" r="3.5" fill="#FFC94A"/>`;
      if (it.tall) s += `<path d="M${x - 5} ${y - 4}h10l4 6h-18z" fill="${it.body}" ${OUT}/>`;
      s += `<path d="M${f1(x - 15 * k)} ${y - 8 - (it.tall ? 4 : 0)}h${f1(30 * k)}c-2 9-8 13-${f1(15 * k)} 13s-13-4-${f1(15 * k)}-13z" fill="${it.body || '#D9682B'}" ${OUT}/><path d="M${f1(x - 11 * k)} ${y - 5 - (it.tall ? 4 : 0)}h${f1(22 * k)}" stroke="${it.rim || '#FFD27A'}" stroke-width="2"/>`;
      if (it.wicks) for (const dx of [-14, -7, 0, 7, 14]) s += flame(x + dx, y - 9, 0.5);
      else s += flame(x, y - 8 - (it.tall ? 4 : 0), it.holder ? 0.95 : 0.8);
      return s;
    }
    case 'jar': return glow(x, y - 16, 30, g) + `<rect x="${x - 11}" y="${y - 30}" width="22" height="28" rx="5" fill="${it.glass}" opacity=".85" ${OUT}/><rect x="${x - 6}" y="${y - 16}" width="12" height="12" fill="#FFF8EC"/>` + flame(x, y - 15, 0.45);
    case 'oillamp': return glow(x, y - 20, 38, g) + `<path d="M${x - 8} ${y - 46}h16M${x} ${y - 52}v6" stroke="${INK}" stroke-width="2.5"/><path d="M${x - 10} ${y - 44}q-4 14 0 26h20q4 -12 0 -26z" fill="#FFE9A8" opacity=".9" ${OUT}/><rect x="${x - 13}" y="${y - 18}" width="26" height="14" rx="3" fill="#B03A2E" ${OUT}/>` + flame(x, y - 24, 0.6);
    case 'bulb': {
      const r = it.big ? 22 : 13;
      return glow(x, y + 12 + r, r * 3.4, g) + tint(x, y + 12 + r, r * 2.4, it.color, g) + `<path d="M${x} ${y - 18}v16" stroke="${INK}" stroke-width="2"/><rect x="${x - 6}" y="${y - 3}" width="12" height="9" rx="2" fill="#9AA0B5" ${OUT}/><circle cx="${x}" cy="${y + 6 + r}" r="${r}" fill="${it.color}" ${OUT}/><path d="M${x - 4} ${y + 4 + r}q4 7 8 0" stroke="#FF9F1C" stroke-width="2" fill="none"/>`;
    }
    case 'disco': {
      let s = glow(x, y + 24, 54, g) + `<path d="M${x} ${y - 18}v20" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${y + 22}" r="20" fill="#C9D3E3" ${OUT}/>`;
      for (let i = -2; i <= 2; i++) s += `<path d="M${x - 19} ${y + 22 + i * 7}h38M${x + i * 7} ${y + 3}v38" stroke="#7D8AA3" stroke-width="1.2"/>`;
      return s + `<path d="M${x - 8} ${y + 12}l6 0l-3 -5z" fill="#FFFFFF"/>` + ['#FF7AC8', '#7AF0FF', '#FFE47A'].map((c, i) => `<circle cx="${x - 34 + i * 34}" cy="${y + 60}" r="4" fill="${c}" opacity=".8"/>`).join('');
    }
    case 'jhoomar': case 'crystal': {
      const gold = it.type === 'jhoomar';
      return glow(x, y + 30, 70, g) + `<path d="M${x} ${y - 18}v14" stroke="${INK}" stroke-width="2"/><path d="M${x - 30} ${y + 14}h60l-10 16h-40z" fill="${gold ? '#F7C531' : '#DCE7F5'}" ${OUT}/><path d="M${x - 18} ${y}h36l-6 14h-24z" fill="${gold ? '#FFD95A' : '#FFFFFF'}" ${OUT}/>` + [-24, -12, 0, 12, 24].map((d) => `<path d="M${x + d} ${y + 30}l4 8-4 8-4-8z" fill="#BFF4FF" stroke="${INK}" stroke-width="1.5"/>`).join('') + (gold ? '' : [-18, 0, 18].map((d) => `<path d="M${x + d} ${y + 46}l3 6-3 6-3-6z" fill="#E8FBFF" stroke="${INK}" stroke-width="1"/>`).join(''));
    }
    case 'star': return glow(x, y + 26, 42, g) + tint(x, y + 20, 30, it.color, g) + `<path d="M${x} ${y - 18}v18" stroke="${INK}" stroke-width="2"/><path d="${starPath(x, y + 20, 21, 5, 0.5)}" fill="${it.color}" ${OUT}/><path d="${starPath(x, y + 20, 9, 5, 0.5)}" fill="#FFF3B0"/><path d="M${x - 5} ${y + 38}l-3 14M${x} ${y + 38}v16M${x + 5} ${y + 38}l3 14" stroke="#FF9F1C" stroke-width="3" stroke-linecap="round"/>`;
    case 'kandil': return glow(x, y + 26, 40, g) + `<path d="M${x} ${y - 18}v16" stroke="${INK}" stroke-width="2"/><path d="M${x - 14} ${y + 4}h28l6 12v20l-6 12h-28l-6 -12v-20z" fill="${it.color}" ${OUT}/><path d="M${x - 6} ${y + 10}h12v32h-12z" fill="#FFE9A8" opacity=".9"/>` + [-12, -4, 4, 12].map((d) => `<path d="M${x + d} ${y + 48}v14" stroke="${it.color}" stroke-width="3"/>`).join('');
    case 'chinese': return glow(x, y + 24, 40, g) + `<path d="M${x} ${y - 18}v14" stroke="${INK}" stroke-width="2"/><rect x="${x - 8}" y="${y - 4}" width="16" height="6" fill="#F2B705" ${OUT}/><ellipse cx="${x}" cy="${y + 22}" rx="20" ry="18" fill="${it.color}" ${OUT}/><path d="M${x - 10} ${y + 8}q-4 14 0 28M${x + 10} ${y + 8}q4 14 0 28M${x} ${y + 4}v36" stroke="${INK}" stroke-width="1.3" opacity=".45" fill="none"/><rect x="${x - 8}" y="${y + 40}" width="16" height="5" fill="#F2B705" ${OUT}/><path d="M${x} ${y + 45}v14" stroke="#F2B705" stroke-width="3"/>`;
    case 'paper': return glow(x, y + 22, 38, g) + `<path d="M${x} ${y - 18}v18" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${y + 20}" r="19" fill="${it.color}" ${OUT}/><path d="M${x - 19} ${y + 14}q19 6 38 0M${x - 18} ${y + 26}q18 6 36 0" stroke="${INK}" stroke-width="1" opacity=".3" fill="none"/>`;
    case 'skylamp': return glow(x, y - 20, 36, g) + `<path d="M${x - 12} ${y - 40}h24l-4 32h-16z" fill="#FFB52E" ${OUT}/><path d="M${x - 8} ${y - 8}l-4 8M${x + 8} ${y - 8}l4 8" stroke="${INK}" stroke-width="1.5"/>`;
    case 'moonlamp': return glow(x, y + 24, 52, g) + tint(x, y + 24, 34, '#FFF3C4', g) + `<path d="M${x} ${y - 18}v18" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${y + 24}" r="22" fill="#FFF3C4" ${OUT}/><circle cx="${x - 7}" cy="${y + 18}" r="4" fill="#E8D9A0"/><circle cx="${x + 8}" cy="${y + 30}" r="5" fill="#E8D9A0"/>`;
    case 'string': {
      const { x1, x2 } = slot, d = Math.max(14, (x2 - x1) * 0.09), n = Math.max(5, Math.round((x2 - x1) / 28)), cols = it.colors;
      let s = `<path d="${sag(x1, x2, y, d)}" stroke="${it.holder ? '#C9A227' : INK}" stroke-width="2.4" fill="none"/>`;
      for (let i = 0; i <= n; i++) {
        const [bx, by] = onSag(x1, x2, y, d, i / n), c = cols[i % cols.length];
        let bulb;
        if (it.icicle) bulb = `<path d="M${f1(bx - 2.5)} ${f1(by + 2)}h5l-2.5 ${10 + (i % 3) * 6}z" fill="${c}" stroke="${INK}" stroke-width="1"/>`;
        else if (it.shape === 'heart') bulb = `<path d="${heartPath(bx, by + 8, 5)}" fill="${c}" stroke="${INK}" stroke-width="1.4"/>`;
        else if (it.shape === 'star') bulb = `<path d="${starPath(bx, by + 8, 7)}" fill="${c}" stroke="${INK}" stroke-width="1.3"/>`;
        else bulb = `<circle cx="${f1(bx)}" cy="${f1(by + 6)}" r="5" fill="${c}" stroke="${INK}" stroke-width="1.6"/>`;
        const lit = glow(bx, by + 7, 15, g) + bulb;
        s += it.blink ? `<g>${lit}${blinkAnim(i)}</g>` : lit;
      }
      return s;
    }
    case 'marigold': {
      const { x1, x2 } = slot, d = Math.max(16, (x2 - x1) * 0.12), n = Math.max(7, Math.round((x2 - x1) / 13)), cols = it.colors;
      let s = '';
      for (let i = 0; i <= n; i++) { const [bx, by] = onSag(x1, x2, y, d, i / n); s += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="7" fill="${cols[i % cols.length]}" stroke="#7A3A0A" stroke-width="1.4"/>`; }
      for (const bx of [x1, x2]) for (let k = 1; k <= 3; k++) s += `<circle cx="${f1(bx)}" cy="${f1(y + k * 12)}" r="6" fill="${cols[k % cols.length]}" stroke="#7A3A0A" stroke-width="1.4"/>`;
      return s;
    }
    case 'toran': {
      const { x1, x2 } = slot, n = Math.max(6, Math.round((x2 - x1) / 16));
      let s = `<path d="M${f1(x1)} ${y}H${f1(x2)}" stroke="#7A3A0A" stroke-width="3"/>`;
      for (let i = 0; i <= n; i++) { const bx = x1 + ((x2 - x1) * i) / n; s += i % 2 ? `<path d="M${f1(bx)} ${y}q-7 12 0 26q7 -14 0 -26z" fill="#2E8B57" stroke="${INK}" stroke-width="1.2"/>` : `<circle cx="${f1(bx)}" cy="${y + 6}" r="6" fill="#FF8A1C" stroke="#7A3A0A" stroke-width="1.3"/>`; }
      return s;
    }
    case 'bunting': {
      const { x1, x2 } = slot, d = Math.max(10, (x2 - x1) * 0.07), n = Math.max(5, Math.round((x2 - x1) / 24));
      let s = `<path d="${sag(x1, x2, y, d)}" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
      for (let i = 0; i < n; i++) { const [ax, ay] = onSag(x1, x2, y, d, (i + 0.15) / n), [bx, by] = onSag(x1, x2, y, d, (i + 0.85) / n); s += `<path d="M${f1(ax)} ${f1(ay)}L${f1(bx)} ${f1(by)}L${f1((ax + bx) / 2)} ${f1((ay + by) / 2 + 18)}z" fill="${it.colors[i % it.colors.length]}" stroke="${INK}" stroke-width="1.3"/>`; }
      return s;
    }
    case 'tassels': case 'pompom': {
      const { x1, x2 } = slot, d = Math.max(10, (x2 - x1) * 0.07), n = Math.max(6, Math.round((x2 - x1) / 20));
      let s = `<path d="${sag(x1, x2, y, d)}" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
      for (let i = 0; i <= n; i++) { const [bx, by] = onSag(x1, x2, y, d, i / n), c = it.colors[i % it.colors.length]; s += it.type === 'pompom' ? `<circle cx="${f1(bx)}" cy="${f1(by + 6)}" r="6" fill="${c}" stroke="${INK}" stroke-width="1.2"/>` : `<path d="M${f1(bx)} ${f1(by)}l-4 18h8z" fill="${c}" stroke="${INK}" stroke-width="1.1"/>`; }
      return s;
    }
    case 'rangoli': {
      const cols = it.colors, p = it.petals || 8;
      let s = glow(x, y, 46, g * 0.5) + `<ellipse cx="${x}" cy="${y}" rx="48" ry="15" fill="${cols[2]}" ${OUT}/>`;
      for (let i = 0; i < p; i++) { const a = (i / p) * Math.PI * 2; s += `<ellipse cx="${f1(x + Math.cos(a) * 30)}" cy="${f1(y + Math.sin(a) * 9)}" rx="${p > 10 ? 7 : 9}" ry="3.4" fill="${cols[i % 2 ? 0 : 1]}"/>`; }
      return s + `<ellipse cx="${x}" cy="${y}" rx="16" ry="5" fill="${cols[3]}" stroke="${INK}" stroke-width="1.5"/><ellipse cx="${x}" cy="${y}" rx="6" ry="2" fill="${cols[4]}"/>`;
    }
    case 'pot': {
      let plant;
      if (it.plant === 'cactus') plant = `<path d="M${x} ${y - 26}v-28M${x} ${y - 40}h-8v-8M${x} ${y - 36}h8v-10" stroke="#2E8B57" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="${x}" cy="${y - 56}" r="3.5" fill="#FF7AC8"/>`;
      else if (it.plant === 'palm') plant = `<path d="M${x} ${y - 26}v-22" stroke="#7A4E2D" stroke-width="4"/>` + [-50, -20, 20, 50].map((a) => `<path d="M${x} ${y - 48}q${f1(Math.sin((a * Math.PI) / 180) * 26)} -10 ${f1(Math.sin((a * Math.PI) / 180) * 30)} 6" stroke="#2E8B57" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
      else if (it.plant === 'roses') plant = `<path d="M${x - 6} ${y - 26}v-14M${x + 6} ${y - 26}v-18M${x} ${y - 26}v-22" stroke="#2E8B57" stroke-width="3"/>` + [[-6, -42], [6, -46], [0, -50]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="6" fill="#D7263D" ${OUT}/>`).join('');
      else plant = `<path d="M${x - 8} ${y - 26}c-8-10-4-20 2-22M${x + 6} ${y - 26}c6-10 10-16 4-24" stroke="#2E8B57" stroke-width="3.5" fill="none" stroke-linecap="round"/>` + [[-9, -38], [3, -46], [12, -34]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="6.5" fill="#FF9F1C" ${OUT}/>`).join('');
      return `<path d="M${x - 14} ${y - 22}h28l-4 22h-20z" fill="#C2552B" ${OUT}/><path d="M${x - 16} ${y - 26}h32v6h-32z" fill="#D9682B" ${OUT}/>` + plant;
    }
    case 'kite': return `<path d="M${x} ${y - 56}l20 22-20 26-20-26z" fill="${it.color}" ${OUT}/><path d="M${x} ${y - 56}v48M${x - 20} ${y - 34}h40" stroke="${INK}" stroke-width="1.4"/><path d="M${x} ${y - 8}q10 4 2 8" stroke="#FFC94A" stroke-width="2.5" fill="none"/>`;
    case 'scooter': return `<g transform="translate(${x} ${y})"><circle cx="-20" cy="-10" r="10" fill="#222" ${OUT}/><circle cx="22" cy="-10" r="10" fill="#222" ${OUT}/><path d="M-30 -18h30q10 0 14 -18h8l-6 28h-8" fill="${it.color}" ${OUT}/><path d="M14 -36l4 -12h8" stroke="${INK}" stroke-width="3" fill="none"/></g>` + [0, 1, 2, 3].map((i) => glow(x + 6 + i * 5, y - 48 + i * 2, 6, g) + `<circle cx="${x + 6 + i * 5}" cy="${y - 48 + i * 2}" r="2.2" fill="${['#FF7AC8', '#7AF0FF', '#FFE47A', '#B6FF7A'][i]}"/>`).join('');
    case 'speaker': return `<rect x="${x - 15}" y="${y - 46}" width="30" height="46" rx="4" fill="#2B2B36" ${OUT}/><circle cx="${x}" cy="${y - 16}" r="10" fill="#555" ${OUT}/><circle cx="${x}" cy="${y - 36}" r="5" fill="#555" ${OUT}/>` + glow(x, y - 16, 14, g * 0.6) + `<path d="M${x + 20} ${y - 30}q6 6 0 12M${x + 26} ${y - 34}q10 10 0 20" stroke="#7AF0FF" stroke-width="2" fill="none"/>`;
    case 'owlstatue': return `<path d="M${x - 14} ${y}v-30q0 -16 14 -16t14 16v30z" fill="#9EA4B0" ${OUT}/><circle cx="${x - 6}" cy="${y - 34}" r="4.5" fill="#FFF" ${OUT}/><circle cx="${x + 6}" cy="${y - 34}" r="4.5" fill="#FFF" ${OUT}/><path d="M${x - 3} ${y - 28}l3 5 3-5z" fill="#FF9F1C"/><path d="M${x - 14} ${y - 44}l4 -8 4 6M${x + 14} ${y - 44}l-4 -8 -4 6" stroke="${INK}" stroke-width="2" fill="#9EA4B0"/>`;
    case 'catfig': return `<rect x="${x - 13}" y="${y - 26}" width="26" height="26" rx="8" fill="#FFFFFF" ${OUT}/><circle cx="${x}" cy="${y - 32}" r="11" fill="#FFFFFF" ${OUT}/><path d="M${x - 9} ${y - 40}l2 -9 5 5M${x + 9} ${y - 40}l-2 -9 -5 5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/><path d="M${x + 12} ${y - 22}v-16" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="${y - 14}" r="4" fill="#F7C531" ${OUT}/><circle cx="${x - 4}" cy="${y - 33}" r="1.6" fill="${INK}"/><circle cx="${x + 4}" cy="${y - 33}" r="1.6" fill="${INK}"/>`;
    case 'dish': return `<path d="M${x} ${y}v-14" stroke="#2B2B36" stroke-width="3"/><ellipse cx="${x}" cy="${y - 26}" rx="18" ry="14" fill="#E8E8EE" ${OUT} transform="rotate(-25 ${x} ${y - 26})"/>` + Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; return glow(x + Math.cos(a) * 17, y - 26 + Math.sin(a) * 12, 6, g) + `<circle cx="${f1(x + Math.cos(a) * 17)}" cy="${f1(y - 26 + Math.sin(a) * 12)}" r="2.2" fill="${['#FF7AC8', '#7AF0FF', '#FFE47A'][i % 3]}"/>`; }).join('');
    case 'slipper': return `<g transform="rotate(-14 ${x} ${y})"><rect x="${x - 22}" y="${y - 10}" width="44" height="14" rx="7" fill="#2EC4B6" ${OUT}/><path d="M${x - 2} ${y - 9}q8-12 14 0" stroke="#E0218A" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    case 'feather': return `<g transform="rotate(28 ${x} ${y})"><path d="M${x} ${y - 30}c12 8 12 24 0 30c-12-6-12-22 0-30z" fill="#FFFFFF" ${OUT}/><path d="M${x} ${y - 28}v34" stroke="#C9B48A" stroke-width="2"/></g>`;
    case 'neon': {
      const c = it.color;
      const shapes = {
        heart: heartPath(x, y, 18), star: starPath(x, y, 24), moon: `M${x + 8} ${y - 22}a22 22 0 1 0 0 44a17 17 0 1 1 0 -44z`,
        bolt: `M${x + 4} ${y - 26}l-14 28h12l-6 24l16 -30h-12z`, arrow: `M${x} ${y + 24}v-46M${x - 14} ${y - 8}l14 -14l14 14`,
        coin: `M${x} ${y - 22}a22 22 0 1 0 0.1 0M${x + 7} ${y - 10}q-7 -6 -14 0q-3 6 7 9q10 3 7 9q-7 6 -14 0M${x} ${y - 16}v32`,
        diamond: `M${x - 22} ${y - 6}l10 -14h24l10 14l-22 28zM${x - 22} ${y - 6}h44`, rocket: `M${x} ${y - 28}q14 12 8 34h-16q-6 -22 8 -34zM${x - 8} ${y + 6}l-8 10h8M${x + 8} ${y + 6}l8 10h-8M${x} ${y - 10}a3 3 0 1 0 0.1 0`,
        owl: `M${x - 18} ${y + 20}v-26q0 -18 18 -18t18 18v26zM${x - 18} ${y - 22}l4 -8l6 6M${x + 18} ${y - 22}l-4 -8l-6 6M${x - 8} ${y - 8}a5 5 0 1 0 0.1 0M${x + 8} ${y - 8}a5 5 0 1 0 0.1 0M${x - 3} ${y}l3 5l3 -5`,
      };
      return tint(x, y, 40, c, g) + neonStroke(shapes[it.shape] || shapes.star, c);
    }
    case 'net': {
      let s = `<rect x="${x - 60}" y="${y - 40}" width="120" height="80" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>`;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const bx = x - 54 + c * 18, by = y - 34 + r * 17, col = it.colors[(r + c) % it.colors.length]; s += `<circle cx="${bx}" cy="${by}" r="5" fill="${col}" opacity=".3"/><circle cx="${bx}" cy="${by}" r="2.2" fill="${col}"/>`; }
      return tint(x, y, 60, it.colors[0], g) + s;
    }
    case 'curtainlights': {
      let s = `<path d="M${x - 60} ${y - 40}h120" stroke="${INK}" stroke-width="1.5"/>`;
      for (let i = 0; i < 9; i++) { const sx = x - 56 + i * 14, len = 40 + ((i * 37) % 40); s += `<path d="M${sx} ${y - 40}v${len}" stroke="${INK}" stroke-width=".8" opacity=".5"/>`; for (let k = 8; k < len; k += 11) s += `<g><circle cx="${sx}" cy="${y - 40 + k}" r="4.5" fill="${it.colors[k % 2]}" opacity=".3"/><circle cx="${sx}" cy="${y - 40 + k}" r="2" fill="${it.colors[(k + i) % 2]}"/>${blinkAnim(i + k)}</g>`; }
      return tint(x, y, 60, '#FFE9A8', g) + s;
    }
    case 'sign': {
      let text = it.custom ? cleanSign(ctx.text) || 'HOOT' : it.text;
      if (text === '$TICKER') text = ctx.ticker ? `$${ctx.ticker}` : '$OWL';
      const size = text.length > 9 ? 16 : text.length > 5 ? 20 : 26, w = Math.max(70, text.length * size * 0.66 + 26);
      return tint(x, y, w * 0.6, it.color, g) + `<rect x="${f1(x - w / 2)}" y="${y - size - 2}" width="${f1(w)}" height="${size * 2 + 4}" rx="10" fill="#140F2E" opacity=".72"/>` + neonStroke(`M${f1(x - w / 2 + 4)} ${y - size + 2}h${f1(w - 8)}v${size * 2 - 4}h-${f1(w - 8)}z`, it.color, 2) +
        `<text x="${x}" y="${f1(y + size * 0.36)}" text-anchor="middle" font-family="'Baloo 2','Arial Rounded MT Bold',Arial,sans-serif" font-weight="800" font-size="${size}" fill="none" stroke="${it.color}" stroke-width="5" opacity=".3">${esc(text)}</text>` +
        `<text x="${x}" y="${f1(y + size * 0.36)}" text-anchor="middle" font-family="'Baloo 2','Arial Rounded MT Bold',Arial,sans-serif" font-weight="800" font-size="${size}" fill="#FFFFFF" stroke="${it.color}" stroke-width="1.6">${esc(text)}</text>`;
    }
    case 'poster': {
      const k = it.kind;
      const bg = { moon: '#1B2048', candle: '#0F1A12', wanted: '#F4E3C3', rocket: '#2440D8', chart: '#F4F1EA' }[k];
      let inner = '';
      if (k === 'moon') inner = `<circle cx="${x}" cy="${y - 4}" r="14" fill="#FFF3C4"/><circle cx="${x + 6}" cy="${y - 8}" r="12" fill="${bg}"/>`;
      if (k === 'candle') inner = `<path d="M${x} ${y - 26}v52" stroke="#3BD16F" stroke-width="2"/><rect x="${x - 7}" y="${y - 18}" width="14" height="34" fill="#3BD16F"/>`;
      if (k === 'wanted') inner = `<text x="${x}" y="${y - 14}" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="9" fill="#5A3A1A">WANTED</text><circle cx="${x}" cy="${y + 4}" r="9" fill="#FFFFFF" stroke="#5A3A1A" stroke-width="1.5"/><path d="M${x - 9} ${y - 3}q9 -8 18 0" fill="#FF9F1C"/><circle cx="${x - 3}" cy="${y + 4}" r="1.5" fill="${INK}"/><circle cx="${x + 3}" cy="${y + 4}" r="1.5" fill="${INK}"/>`;
      if (k === 'rocket') inner = `<path d="M${x} ${y - 22}q10 10 6 28h-12q-4 -18 6 -28z" fill="#FFFFFF"/><path d="M${x - 4} ${y + 8}l4 10l4 -10" fill="#FF8A1C"/>`;
      if (k === 'chart') inner = `<path d="M${x - 16} ${y + 16}l8 -8l6 4l8 -14l8 -10" stroke="#3BD16F" stroke-width="3" fill="none"/><path d="M${x + 14} ${y - 12}l2 -8l-8 2" stroke="#3BD16F" stroke-width="3" fill="none"/>`;
      return `<rect x="${x - 22}" y="${y - 30}" width="44" height="60" fill="${bg}" ${OUT} transform="rotate(-3 ${x} ${y})"/>` + inner + `<circle cx="${x}" cy="${y - 27}" r="2.5" fill="#C9C9C9"/>`;
    }
    case 'sticker': {
      const c = it.color, k = it.kind;
      const shape = { star: `<path d="${starPath(x, y, 18)}" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/>`, heart: `<path d="${heartPath(x, y, 13)}" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/>`,
        fire: `<path d="M${x} ${y - 20}c10 10 14 16 14 24a14 14 0 0 1-28 0c0-6 4-10 6-14c2 6 4 8 6 8c0-6-2-12 2-18z" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/>`,
        coin: `<circle cx="${x}" cy="${y}" r="16" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="#B5651D">$</text>`,
        sparkle: `<path d="M${x} ${y - 20}q3 17 20 20q-17 3 -20 20q-3 -17 -20 -20q17 -3 20 -20z" fill="${c}" stroke="#FFC94A" stroke-width="3" paint-order="stroke"/>`,
        diamond: `<path d="M${x - 16} ${y - 6}l8 -10h16l8 10l-16 20z" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/>`,
        eye: `<circle cx="${x}" cy="${y}" r="16" fill="${c}" stroke="#FFFFFF" stroke-width="4" paint-order="stroke"/><circle cx="${x}" cy="${y}" r="10" fill="#FFFFFF"/><circle cx="${x}" cy="${y}" r="6" fill="#7EC8F2"/><circle cx="${x}" cy="${y}" r="3" fill="${INK}"/>` };
      return (k === 'sparkle' || k === 'coin' ? tint(x, y, 22, c, g) : '') + (shape[k] || shape.star);
    }
    case 'graffiti': return `<path d="M${x - 40} ${y + 6}c6 -24 18 -24 14 0s14 -28 18 -6s12 -20 16 0s10 -16 14 4" stroke="${it.color}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x - 40} ${y + 6}c6 -24 18 -24 14 0s14 -28 18 -6s12 -20 16 0s10 -16 14 4" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/><circle cx="${x + 30}" cy="${y + 14}" r="3" fill="${it.color}"/><path d="M${x - 34} ${y + 14}v8" stroke="${it.color}" stroke-width="3"/>`;
    case 'curtains': case 'dancers': case 'tvglow': case 'wincat': case 'winhearts': case 'winstar': {
      const w = slot.w || 50, h = slot.h || 64, l = x - w / 2, t = y;
      if (it.type === 'curtains') return tint(x, t + h / 2, w * 0.7, it.color, g) + `<path d="M${l + 2} ${t + 2}h${f1(w * 0.3)}q-4 ${f1(h * 0.5)} -${f1(w * 0.18)} ${f1(h - 4)}h-${f1(w * 0.12)}z" fill="${it.color}" stroke="${INK}" stroke-width="1.5"/><path d="M${l + w - 2} ${t + 2}h-${f1(w * 0.3)}q4 ${f1(h * 0.5)} ${f1(w * 0.18)} ${f1(h - 4)}h${f1(w * 0.12)}z" fill="${it.color}" stroke="${INK}" stroke-width="1.5"/>`;
      if (it.type === 'dancers') return `<rect x="${l + 2}" y="${t + 2}" width="${w - 4}" height="${h - 4}" fill="#FF7AC8" opacity=".35"/>` + [0.3, 0.7].map((k, i) => `<g transform="translate(${f1(l + w * k)} ${f1(t + h * 0.92)}) scale(${f1(h / 120)})"><circle cy="-62" r="9" fill="${INK}"/><path d="M-8 -50h16l6 34h-28z" fill="${INK}"/><path d="M-8 -48l-16 ${i ? 14 : -18}M8 -48l14 ${i ? -18 : 12}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`).join('');
      if (it.type === 'tvglow') return `<rect x="${l + 2}" y="${t + 2}" width="${w - 4}" height="${h - 4}" fill="#6FC3FF" opacity=".55"><animate attributeName="opacity" values=".55;.35;.6;.45;.55" dur="2.2s" repeatCount="indefinite"/></rect>`;
      if (it.type === 'wincat') return `<g transform="translate(${x} ${f1(t + h - 4)})"><ellipse cx="0" cy="-8" rx="${f1(w * 0.22)}" ry="9" fill="#2B2440"/><circle cx="0" cy="-22" r="8" fill="#2B2440"/><path d="M-7 -27l2 -8 4 5M7 -27l-2 -8 -4 5" fill="#2B2440"/><circle cx="-3" cy="-23" r="1.5" fill="#FFE066"/><circle cx="3" cy="-23" r="1.5" fill="#FFE066"/></g>`;
      if (it.type === 'winhearts') return [0.25, 0.5, 0.75].map((k, i) => `<path d="M${f1(l + w * k)} ${t + 2}v${10 + i * 8}" stroke="${INK}" stroke-width="1"/><path d="${heartPath(l + w * k, t + 18 + i * 8, 5)}" fill="#FF3F7F"/>` + tint(l + w * k, t + 18 + i * 8, 10, '#FF3F7F', g)).join('');
      return `<path d="${starPath(x, t + h * 0.45, Math.min(w, h) * 0.3)}" fill="#FFE47A" stroke="${INK}" stroke-width="1.5"/>` + tint(x, t + h * 0.45, w * 0.5, '#FFE47A', g);
    }
    case 'paint': return `<path d="M${x - 14} ${y - 26}h28v26h-28z" fill="#B0B6C2" ${OUT}/><path d="M${x - 14} ${y - 26}h28v8h-28z" fill="${it.color}" stroke="${INK}" stroke-width="2"/><path d="M${x - 8} ${y - 18}q2 8 0 12" stroke="${it.color}" stroke-width="4" stroke-linecap="round"/><path d="M${x - 12} ${y - 30}q12 -12 24 0" stroke="${INK}" stroke-width="2" fill="none"/>`;
    default: return '';
  }
}

// where an item is centred when it is put anywhere ("free"): the drawing is moved so its middle sits on the point
const LINE_TYPES = ['string', 'marigold', 'toran', 'bunting', 'tassels', 'pompom'];
const HANG_TYPES = ['bulb', 'disco', 'jhoomar', 'crystal', 'star', 'kandil', 'chinese', 'paper', 'moonlamp'];
export const isLine = (id) => LINE_TYPES.includes(itemOf(id)?.type);
/** A decoration put anywhere: x, y (centre), s (size, 0.4…2.5), r (turn in degrees). */
export function drawFree(f, g = 1, ctx = {}) {
  const it = itemOf(f.i); if (!it) return '';
  let body;
  if (LINE_TYPES.includes(it.type)) body = drawItem(f.i, { x1: -70, x2: 70, y: -12 }, g, ctx);
  else if (HANG_TYPES.includes(it.type)) body = drawItem(f.i, { x: 0, y: -24 }, g, ctx);
  else if (['neon', 'net', 'curtainlights', 'sign', 'poster', 'sticker', 'graffiti'].includes(it.type)) body = drawItem(f.i, { x: 0, y: 0 }, g, { ...ctx, text: f.t });
  else if (it.type === 'rangoli') body = drawItem(f.i, { x: 0, y: 0 }, g, ctx);
  else body = drawItem(f.i, { x: 0, y: 22 }, g, ctx);
  return `<g transform="translate(${f1(f.x)} ${f1(f.y)}) rotate(${Math.round(f.r || 0)}) scale(${(f.s || 1).toFixed(2)})">${body}</g>`;
}

export const GLOW_DEF = (id = 'ul') => `<radialGradient id="${id}-glow"><stop offset="0" stop-color="#FFD36B" stop-opacity=".9"/><stop offset=".45" stop-color="#FF9F1C" stop-opacity=".35"/><stop offset="1" stop-color="#FF9F1C" stop-opacity="0"/></radialGradient>`;

/** A decoration on its own, as a whole SVG (inventory buttons, the album and stickers of the picture tool). */
export function itemSvg(id, size = 120, ctx = {}) {
  const it = itemOf(id);
  if (!it) return '';
  let body, box = '-60 -60 120 120';
  if (LINE_TYPES.includes(it.type)) body = drawItem(id, { x1: -52, x2: 52, y: -26 }, 1, ctx);
  else if (HANG_TYPES.includes(it.type)) { body = drawItem(id, { x: 0, y: -36 }, 1, ctx); if (it.type === 'bulb' && !it.big) box = '-40 -40 80 80'; }
  else if (['curtains', 'dancers', 'tvglow', 'wincat', 'winhearts', 'winstar'].includes(it.type)) body = `<rect x="-26" y="-34" width="52" height="68" rx="4" fill="#1B2048" stroke="${INK}" stroke-width="2.5"/>` + drawItem(id, { x: 0, y: -34, w: 52, h: 68 }, 1, ctx);
  else if (['neon', 'net', 'curtainlights', 'sign', 'poster', 'sticker', 'graffiti', 'rangoli'].includes(it.type)) body = drawItem(id, { x: 0, y: 0 }, 1, ctx);
  else { body = drawItem(id, { x: 0, y: 22 }, 1, ctx); box = { diya: '-28 -10 56 56', jar: '-30 -18 60 60', slipper: '-30 -8 60 60', feather: '-28 -16 56 56', paint: '-30 -24 60 60' }[it.type] || '-40 -44 80 80'; }
  // a glow that fades sooner, so it never meets the edge of a small picture
  const thumbGlow = '<radialGradient id="ul-glow"><stop offset="0" stop-color="#FFD36B" stop-opacity=".85"/><stop offset=".3" stop-color="#FF9F1C" stop-opacity=".25"/><stop offset=".62" stop-color="#FF9F1C" stop-opacity="0"/></radialGradient>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${size}" height="${size}"><defs>${thumbGlow}</defs>${body}</svg>`;
}
