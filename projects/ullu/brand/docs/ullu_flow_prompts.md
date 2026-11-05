# Ullu — промты Flow для картинок сайта

Черновик 05.11.2026. Делать после выбора канона. Настройки: Nano Banana Pro, количество `x1`, формат из шага. Ко всем промтам прикладывать выбранный канон `ullu_main.jpg` (из `projects/gurufun/characters/06_ullu/`). Один промт — одна картинка.

Правила из кастинга: удачные картинки сначала скачивать, новые варианты делать новой генерацией, а не правкой (правка ложится стопкой поверх оригинала). Глаза открыты, без мешков под глазами, без красных глаз, одежда чистая.

Если канон — золотой вариант: в каждом промте заменить кусок от `He wears a mustard-yellow` до `wrapped around his legs,` на описание золотого наряда из `ullu.md`.

Куда класть готовые файлы (имена важны, сайт берёт их из конфига):

| Шаг | Файл | Где на сайте |
|---|---|---|
| 3.1 | `brand/stickers/ullu_fly.png` | сова в небе над домом, наклейка в «Зажги картинку» |
| 3.2 | `brand/stickers/ullu_landed.png` | сова на крыше на седьмую ночь, подарок-окно, наклейка |
| 3.3 | `brand/logo/ullu_logo.png` | шапка, подвал, значок вкладки |
| 3.4 | `brand/banners/ullu_hero.png` | первый экран (арочное окно, кадр 4:5) |
| 3.5–3.8 | `brand/gallery/ullu_g01.png` … `ullu_g04.png` | галерея и основа в «Зажги картинку» |

Картинки 3.1 и 3.2 делаются на зелёном фоне: фон уберу кодом и пропишу файлы в конфиг (`house.owl.fly`, `house.owl.landed`). Остальное — просто положить в папки под этими именами, заглушки заменятся сами.

---

## 3.1. Сова в полёте — формат 1:1, зелёный фон

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Pose: he is flying toward the viewer at a slight three-quarter angle, his whole body visible and centred with empty space around it. Both wings are spread wide like real owl wings, the long golden-brown flight feathers fanned out, and the cartoon hands at the wing tips are open. In one hand he holds a small closed cloth sack tied with a red string. His tail feathers fan out below the dhoti and his bare orange feet with three toes and a back toe are tucked under his body. Both eyes are open, big, bright and sly, looking down to the side as if he is choosing a house below. His beak is in the same wide smug grin. No sunglasses.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak.

Background: one flat pure green colour #00FF00 filling the whole image, plain and empty, with no shadow on the ground, no floor and no other objects. Nothing in the picture is green except the background. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.2. Сова на крыше, седьмая ночь — формат 1:1, зелёный фон

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Pose: he sits squatting low and wide, facing the viewer, as if he has just landed on a roof, his bare orange feet with three toes and a back toe flat on the bottom edge of an invisible floor. He wears round dark sunglasses with thin gold frames over both eyes, because the light below him is far too bright. With one big cartoon hand he hugs a fat burlap sack beside him that is overflowing with shiny gold coins and a few sparkling blue-white diamonds. His other hand gives a relaxed thumbs up. His beak is in a wide, very pleased grin. His whole body and the sack are visible and centred with empty space around them.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak.

Background: one flat pure green colour #00FF00 filling the whole image, plain and empty, with no shadow on the ground, no floor and no other objects. Nothing in the picture is green except the background. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.3. Логотип-аватар — формат 1:1

```
Using the character from the attached reference image, generate one single 1:1 image: a round profile picture of the same character, keeping his face, turban and colours exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Framing: a close-up of his head and the top of his shoulders, the face straight to the viewer and centred, the turban with the feather fully inside the frame. Both eyes are open, bright and sly, and his beak is in the wide smug grin. The two gold chains show at the bottom edge.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. Background: one flat saffron orange colour #FF9F1C with a soft lighter glow behind his head, plain and empty. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.4. Первый экран — формат 4:5 (если формата нет — 1:1)

Если канон нравится как есть, можно не генерировать: положить канон в `banners/ullu_hero.png`. Этот промт — вариант специально под арочное окно: сова в центре, сверху место под арку.

```
Using the character from the attached reference image, generate one single portrait image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Pose: he squats on a big pile of shiny gold coins, facing the viewer, one eye winking and the other open, his beak in a wide smug grin. In one hand he holds a small clay diya lamp with a bright flame, held up near his face so the warm orange light falls on his cheek and the gold chains. His other hand rests on his belly. His whole body is in the lower two thirds of the image, with empty space above the turban.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. Background: a plain night gradient, deep magenta and warm orange glowing behind him and fading to dark navy at the edges, empty, with a few tiny soft stars at the top. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.5. Галерея 1: седьмая ночь на крыше — формат 1:1

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Scene: night. He sits on the flat roof of a small old Indian house painted turquoise, the roof edge covered in strings of coloured fairy lights, paper star lanterns and orange marigold garlands, every window glowing warm yellow below him. He wears round dark sunglasses with thin gold frames because the house is far too bright, and hugs a fat burlap sack overflowing with gold coins. His beak is in a very pleased grin. Behind him a dark navy sky with a thin crescent moon and small stars.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.6. Галерея 2: выбирает дом — формат 1:1

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Scene: night, seen from above and behind him. He flies high over a narrow Indian street of colourful two- and three-storey houses, his wings spread wide, a small cloth sack in one hand. Every house below is lit in its own way: one with a single clay lamp, one with a few fairy lights, one blazing with lights from the roof to the doorstep. He turns his head back toward the viewer with both eyes open and a sly grin, one finger pointing down at the brightest house. Dark navy sky with small stars.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.7. Галерея 3: одна лампа в окне — формат 1:1

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Scene: night, close up. He hangs upside down from the top of an arched window of a pink Indian house, holding on with his feet, and peeks into the frame from above. On the window sill stands one small clay diya lamp with a bright flame. He looks at the lamp with both eyes wide open and delighted, his beak in an excited grin, both hands pressed to his cheeks. The rest of the wall is dark. Dark navy night around.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## 3.8. Галерея 4: запутался в гирлянде — формат 1:1

```
Using the character from the attached reference image, generate one single 1:1 image of the same character, keeping his face, turban, clothes, colours and proportions exactly as in the reference.

Ullu, a fat round barn owl with the heart-shaped white face of a barn owl and a small hooked orange beak, a cream chest and golden-brown back and wings, each wing ending in a big cartoon hand with three thick feather fingers and a thumb. A big saffron turban sits crookedly on his head with a red jewelled brooch and a tall white feather leaning to one side. A black kajal dot sits on his left cheek and his beak is stretched into a wide smug grin. He wears a mustard-yellow sleeveless waistcoat with brass buttons straining open over a blue-and-white striped vest and his round belly, a white dhoti wrapped around his legs, two thick gold chains and a gold ring on one finger, and his feet are bare and orange.

Scene: night. He stands in the middle of the image tangled from head to feet in a long string of glowing coloured fairy lights, the wire wrapped around his belly, his wings and his turban, a few bulbs blinking near his beak. He is not upset at all: both eyes open, beak in a wide smug grin, one hand giving a thumbs up as if this was the plan. The glow of the bulbs lights his feathers in pink, cyan and yellow. Dark navy background, plain and empty.

Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, smooth, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, crisp white highlights on the gold, the brooch and the beak. There are no letters, no numbers, no signs and no logos anywhere in the image.
```

## Что смотреть в каждой картинке

- Сова та же, что на каноне: толстая, сердцевидная белая морда сипухи, шафрановый тюрбан набок с красной брошью и белым пером, точка каджала на левой щеке, руки-перья с тремя пальцами и большим.
- Глаза открыты (кроме 3.4 с подмигиванием), без мешков, без красного.
- На 3.1 и 3.2 фон чисто зелёный, на сове нет зелёных пятен, ноги и мешок целиком в кадре.
- Нет букв, цифр и надписей.

## Совы 3 и 4: развороты и эмоции (05.11.2026)

Референс: только главная картинка этой совы (`gurufun/characters/06_ullu/casting/ullu_truck_main.jpg` или `ullu_lungi_main.jpg`). Каждый раз новая генерация, одобренные картинки не правим. Разворот — 16:9, эмоции — 1:1.

### Сова 3 «Трак-арт» — разворот (16:9)

```
Character turnaround sheet of Ullu, the same owl as in the attached image: keep his face, body proportions, outfit, colours and drawing style exactly as they are. Four full-body views of the same character standing in one row, evenly spaced, all at the same height and the same scale: front view, three-quarter view turned to the left, side profile facing left, back view. Neutral standing pose, wings relaxed at his sides, feet flat on the ground, a soft oval shadow under each figure, nothing in his hands.

Ullu is a short, very fat, round barn owl, almost as wide as he is tall, with a big egg-shaped body, a white heart-shaped face, a small hooked orange beak curled into a lazy smug smile, heavy-lidded sleepy eyes with dark purple circles under them, golden-brown feathered wings that end in feathered hands with three fingers and a thumb, and short orange legs with sharp toes. A huge saffron-orange turban with thick hand-drawn folds sits low and crooked on his head and droops over his left eye, which peeks out half-hidden under its edge; on the side of the turban there is a jewelled brooch of red and green stones and a tall white feather. He wears a baggy lime-green hoodie with white drawstrings and a front pocket, a garland of orange marigolds and a thick gold chain over the hoodie, a red thread bracelet on one wrist, and baggy green shorts with a red tartan check.

Keep him fat and round in every view: do not slim him down, do not make him taller, and do not hide his wings inside the sleeves; the feathered wing-hands come out of the hoodie sleeves in every view. The side profile shows his round belly and short tail. The back view shows the wrapped folds at the back of the turban, the hood hanging on his back and short tail feathers under the hoodie.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, colour laid in with markers and gouache, visible brush strokes and paper texture, warm saturated colours. Background: plain flat sunflower-yellow, with no frame, no painted border, no flowers, no coins, no text, no labels.
```

### Сова 3 «Трак-арт» — эмоции (1:1)

```
Expression sheet of Ullu, the same owl as in the attached image: keep his face, turban, outfit, colours and drawing style exactly as they are. A grid of six equal square panels, three in the top row and three in the bottom row, separated by thin white gutters. Every panel is a chest-up portrait of Ullu facing the viewer, the same size and framing in every panel, on a plain flat sunflower-yellow background.

Top row, left to right:
1. Smug: heavy-lidded eyes, one brow raised, a slow sly grin.
2. Laughing: eyes squeezed shut with joy, beak wide open, both wing-hands thrown up.
3. Cool: black sunglasses, a calm satisfied smile, a warm golden glow around his head, as if lit by a very bright house.
Bottom row, left to right:
4. Shocked: eyes wide and perfectly round, beak dropped open, the feathers on top of his head standing straight up, the turban knocked askew.
5. Crying: eyebrows pulled up in the middle, big blue tears running down both cheeks, a wobbling beak.
6. Winking: one eye shut in a wink, the other half-closed, a cheeky crooked grin.

In every panel he keeps the huge crooked saffron-orange turban with the red-and-green jewelled brooch and the white feather, the white face with dark purple circles under the eyes, the lime-green hoodie with white drawstrings, the orange marigold garland and the thick gold chain. The turban droops over his left eye as in the reference, but the expression of both eyes stays readable in every panel.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes and paper texture. No chai cup, no coins, no painted border, no flowers, no text, no numbers, no labels.
```

### Сова 4 «Лунги» — разворот (16:9)

```
Character turnaround sheet of Ullu, the same owl as in the attached image: keep his face, body proportions, outfit, colours and drawing style exactly as they are. Four full-body views of the same character standing in one row, evenly spaced, all at the same height and the same scale: front view, three-quarter view turned to the left, side profile facing left, back view. Neutral standing pose, wings relaxed at his sides, feet flat on the ground, a soft oval shadow under each figure, nothing in his hands.

Ullu is a short, very fat barn owl with a pear-shaped body and a round belly, a cream heart-shaped face, golden-brown wings covered with rows of scalloped feathers that end in big feathered hands with three fingers and a thumb, a small hooked orange beak in a wide smug grin, heavy-lidded half-closed eyes with light purple shadows under them, a black kajal dot on his right cheek, and short orange legs with sharp toes. A saffron-orange turban sits on his head with a round red jewelled brooch at the front and a white feather standing up from it. He wears a plain white sleeveless undershirt vest (a baniyan) stretched tight over his belly, three thin gold chains around his neck, and a green lungi with a red and white check, wrapped around his waist, knotted at the front and falling to his knees.

Keep him fat and round in every view: do not slim him down and do not make him taller. The side profile shows his round belly, the lungi knot and his short tail. The back view shows the wrapped folds at the back of the turban, the back of the white vest, the lungi wrapped around and short tail feathers above it.

Style: the same flat two-dimensional crypto meme mascot cartoon as the reference: thick smooth black outlines of even weight, flat colours with one step of cel shading, small crisp highlights. Background: plain flat turquoise, with no coins, no diamond, no text, no labels.
```

### Сова 4 «Лунги» — эмоции (1:1)

```
Expression sheet of Ullu, the same owl as in the attached image: keep his face, turban, outfit, colours and drawing style exactly as they are. A grid of six equal square panels, three in the top row and three in the bottom row, separated by thin white gutters. Every panel is a chest-up portrait of Ullu facing the viewer, the same size and framing in every panel, on a plain flat turquoise background.

Top row, left to right:
1. Smug: heavy-lidded eyes, one brow raised, a slow sly grin.
2. Laughing: eyes squeezed shut with joy, beak wide open, both wing-hands thrown up.
3. Cool: black sunglasses, a calm satisfied smile, a warm golden glow around his head, as if lit by a very bright house.
Bottom row, left to right:
4. Shocked: eyes wide and perfectly round, beak dropped open, the feathers on top of his head standing straight up, the turban knocked askew.
5. Crying: eyebrows pulled up in the middle, big blue tears running down both cheeks, a wobbling beak.
6. Winking: one eye shut in a wink, the other half-closed, a cheeky crooked grin.

In every panel he keeps the saffron-orange turban with the round red brooch and the white feather, the cream face with the black kajal dot on his right cheek and light purple shadows under the eyes, the white sleeveless undershirt vest and the three thin gold chains.

Style: the same flat two-dimensional crypto meme mascot cartoon as the reference: thick smooth black outlines of even weight, flat colours with one step of cel shading, small crisp highlights. No diamond, no coins, no text, no numbers, no labels.
```

## Сайт на «Трак-арте»: все картинки (05.11.2026)

Референс для всех промтов: `gurufun/characters/06_ullu/casting/ullu_truck_ref.jpg` (сова без фона и рамки). Прикладывать только его, один. Nano Banana Pro, каждый раз новая генерация, по 4 варианта, выбираем лучший. Готовые картинки класть в `gurufun/characters/06_ullu/flow_truck/` под именами из таблицы, на сайт их ставлю я (вырезаю фон, подгоняю размер).

| № | Что | Формат | Файл | Где на сайте |
|---|---|---|---|---|
| T1 | Сова в полёте | 1:1 | `t1_fly.jpg` | в небе над домом с 1-й по 6-ю ночь, наклейка, полёт за курсором |
| T2 | Сова на крыше, седьмая ночь | 1:1 | `t2_roof.jpg` | на крыше на 7-ю ночь, окно подарков, наклейка |
| T3 | Сонная сова | 1:1 | `t3_sleep.jpg` | засыпает в углу, если посетитель долго ничего не делает |
| T4 | Логотип-значок | 1:1 | `t4_logo.jpg` | шапка, подвал, значок вкладки, аватар X и Telegram |
| T5 | Надпись ULLU | 16:9 | `t5_wordmark.jpg` | шапка сайта, баннеры |
| T6 | Первый экран | 4:5 (если нет — 3:4) | `t6_hero.jpg` | большая картинка в арке наверху |
| T7–T10 | 4 сцены галереи | 1:1 | `t7_roof.jpg` … `t10_seven.jpg` | галерея и фоны в «Зажги картинку» |
| T11 | Широкий баннер | 16:9 | `t11_banner.jpg` | шапка X (обрежу до 3:1) и обложка ссылок (1200×630) |
| T12 | Полоса росписи | 16:9 | `t12_border.jpg` | разделители между блоками сайта и подвал |

T1, T2, T3, T4 и T5 делаются на ровном синем фоне: синего в сове нет, поэтому фон уберётся чисто (зелёный не подходит: худи лаймовое).

### T1. Сова в полёте (1:1)

```
Ullu, the same owl as in the attached image, flying. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a short, very fat, round barn owl with a big egg-shaped body, a white heart-shaped face, a small hooked orange beak curled into a lazy smug smile, heavy-lidded sleepy eyes with dark purple circles under them, golden-brown feathered wings and short orange legs with sharp toes. A huge saffron-orange turban with thick hand-drawn folds sits low and crooked over his left eye, with a jewelled brooch of red and green stones and a tall white feather. He wears a baggy lime-green hoodie with white drawstrings and a front pocket, a garland of orange marigolds, a thick gold chain, a red thread bracelet on one wrist, and baggy green shorts with a red tartan check.

Pose: he flies towards the viewer at a slight angle, both wings spread wide open like a big feathered cape, the long wing feathers fanned out, the hoodie and the marigold garland fluttering back in the wind, legs tucked up with the orange feet dangling. He looks down with lazy, smug curiosity, as if searching for the brightest house below. His whole body is in the frame with empty space around him; the wings do not touch the edges.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, colour laid in with markers and gouache, visible brush strokes and paper texture, warm saturated colours.

Background: plain flat solid cobalt-blue, one even colour from edge to edge, no gradient, no texture, no clouds, no shadow. No frame, no flowers, no text, no letters.
```

### T2. Сова на крыше, седьмая ночь (1:1)

```
Ullu, the same owl as in the attached image, on night seven, sitting on a roof he picked. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a short, very fat, round barn owl with a big egg-shaped body, a white heart-shaped face, a small hooked orange beak, golden-brown feathered wings that end in feathered hands with three fingers and a thumb, and short orange legs with sharp toes. A huge saffron-orange turban with thick hand-drawn folds sits crooked on his head, with a jewelled brooch of red and green stones and a tall white feather. He wears a baggy lime-green hoodie with white drawstrings, a garland of orange marigolds, a thick gold chain, a red thread bracelet and baggy green shorts with a red tartan check.

Pose: he sits facing the viewer with his legs stretched forward, very pleased with himself. He wears black sunglasses and grins a wide, smug, satisfied grin. In one hand he holds a small clay kulhad cup of steaming chai. Beside him stands a heavy burlap sack tied with red string, open at the top and spilling gold coins onto the ground in front of him. The bottom of the picture is a flat line where he sits, as if on the edge of a roof, but the roof itself is not drawn. The whole owl, the sack and the coins are in the frame with empty space above the turban.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes and paper texture, warm saturated colours.

Background: plain flat solid cobalt-blue, one even colour, no gradient, no texture, no shadow. No frame, no flowers, no text, no letters.
```

### T3. Сонная сова (1:1)

```
Ullu, the same owl as in the attached image, fast asleep. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a short, very fat, round barn owl with a white heart-shaped face, a small hooked orange beak, golden-brown feathered wings and short orange legs. A huge saffron-orange turban with a jewelled brooch of red and green stones and a tall white feather has slid down over both of his eyes. He wears a baggy lime-green hoodie with white drawstrings, a garland of orange marigolds, a thick gold chain and baggy green shorts with a red tartan check.

Pose: he sits slumped with his round belly forward and his head tilted to one side, fast asleep, beak slightly open, one wing-hand resting on his belly and the other still loosely holding an empty clay kulhad cup. Peaceful, a little silly. The whole owl is in the frame with empty space around him.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes and paper texture.

Background: plain flat solid cobalt-blue, one even colour, no gradient, no texture, no shadow. No frame, no flowers, no text, no letters, no "Z" signs.
```

### T4. Логотип-значок (1:1)

```
A round badge logo with Ullu, the same owl as in the attached image. Keep his face, turban and drawing style exactly as in the reference.

In the centre: the head and shoulders of Ullu, a fat barn owl with a white heart-shaped face, a small hooked orange beak in a lazy smug smile, heavy-lidded sleepy eyes with dark purple circles, a huge saffron-orange turban sitting crooked over his left eye with a jewelled brooch of red and green stones and a tall white feather, a lime-green hoodie and an orange marigold garland. He looks straight at the viewer.

The badge: a thick circular frame painted in Indian truck-art style, with rings of red and royal blue, rows of small white dots and tiny painted flowers, and a flat lemon-yellow circle inside behind the owl. The head fills most of the circle; the feather may overlap the frame a little. Everything is centred, with the full circle inside the picture and a small margin around it.

Style: hand-drawn Indian truck art: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes, warm saturated colours. It must read clearly when shown very small, as a round avatar.

Background outside the circle: plain flat solid cobalt-blue, one even colour. No text, no letters.
```

### T5. Надпись ULLU (16:9)

```
The word "ULLU" painted as a sign in Indian truck-art lettering, exactly these four letters, spelled U-L-L-U, in one line in the centre of the picture.

The letters are chunky, slightly curvy hand-painted capitals, like the painted names on the back of an Indian lorry. Each letter is filled with lime green, has a thick black outline, a bold red drop shadow to the lower right and small white highlight strokes. Small painted marigolds and white dots decorate the gaps between the letters, and a thin row of tiny bells hangs under the word.

Style: hand-painted Indian truck art, markers and gouache, visible brush strokes, slightly uneven lines.

Background: plain flat solid cobalt-blue, one even colour. Nothing else in the picture: no owl, no other words, no frame.
```

### T6. Первый экран (4:5, если формата нет — 3:4)

```
Ullu, the same owl as in the attached image, sitting on the parapet of a flat Indian rooftop at night. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a short, very fat, round barn owl with a white heart-shaped face, a small hooked orange beak in a lazy smug smile, heavy-lidded sleepy eyes with dark purple circles, golden-brown feathered wings and short orange legs. A huge saffron-orange turban sits low and crooked over his left eye, with a jewelled brooch of red and green stones and a tall white feather. He wears a baggy lime-green hoodie with white drawstrings, an orange marigold garland, a thick gold chain, a red thread bracelet and baggy green shorts with a red tartan check. He holds a clay kulhad cup of steaming chai and looks at the viewer as if he has found the brightest house in the city.

Scene: a clay diya lamp burns on the parapet next to him and lights his face and hoodie with warm golden light. Behind and below him, a narrow Indian street at night: old houses with balconies, strings of fairy lights, marigold garlands and lit windows, softly out of focus. The sky is deep violet with a few stars and a thin crescent moon.

Composition: the owl sits in the centre and fills the lower two thirds; the top third is sky with space around his turban, because the top of the picture will be cut into a rounded arch.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes and paper texture, warm saturated colours; lime green, marigold orange and lemon yellow glowing against the violet night. No text, no frame.
```

### T7. Галерея 1: «Он выбрал эту крышу» (1:1)

```
Ullu, the same owl as in the attached image, sitting proudly on the only lit rooftop of a dark Indian street at night. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a short, very fat barn owl with a white heart-shaped face, a small hooked orange beak, heavy-lidded sleepy eyes, a huge crooked saffron-orange turban with a jewelled brooch and a white feather, a lime-green hoodie, an orange marigold garland, a gold chain and green tartan shorts.

Scene: all the rooftops around are dark; only his roof glows with clay diyas along the edge and a string of warm fairy lights. He sits in the middle of it with his arms folded, looking pleased. Deep violet night sky, a few stars. The owl is in the centre of the picture.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes, warm saturated colours. No text, no frame.
```

### T8. Галерея 2: «Вся улица ждёт» (1:1)

```
Ullu, the same owl as in the attached image, flying high over an Indian street at night, wings spread wide, looking down at the houses. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a fat barn owl with a white heart-shaped face, a huge crooked saffron-orange turban with a jewelled brooch and a white feather, a lime-green hoodie, an orange marigold garland and green tartan shorts.

Scene: below him a long street of old Indian houses, every one lit up and trying hard: clay diyas on every sill, fairy lights, paper lanterns, marigold garlands over the doors, a tea cart with a glowing lamp. The houses look up at him like they are waiting. Deep violet night sky. The owl is in the upper middle of the picture, the street fills the lower half.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes, warm saturated colours. No people, no text, no frame.
```

### T9. Галерея 3: «Первая ночь. Одной лампы хватит» (1:1)

```
Night one: a small old Indian house at night with one single clay diya burning on a windowsill, and Ullu, the same owl as in the attached image, perched on the electric wire in front of the house, leaning towards the little flame with sleepy curiosity. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a fat barn owl with a white heart-shaped face, heavy-lidded sleepy eyes with dark purple circles, a huge crooked saffron-orange turban with a jewelled brooch and a white feather, a lime-green hoodie, an orange marigold garland and green tartan shorts.

Scene: the rest of the house and the street are dark blue and violet; the only warm light is the diya and its glow on the wall and on the owl's face. Calm and quiet. The diya and the owl are in the centre of the picture.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes. No text, no frame.
```

### T10. Галерея 4: «Седьмая ночь. Без очков не смотреть» (1:1)

```
Night seven: an old Indian house covered in lights from the roof to the doorstep, and Ullu, the same owl as in the attached image, sitting on its roof in black sunglasses next to an open burlap sack spilling gold coins. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a fat barn owl with a white heart-shaped face, a huge crooked saffron-orange turban with a jewelled brooch and a white feather, a lime-green hoodie, an orange marigold garland, a gold chain and green tartan shorts. He grins a wide smug grin.

Scene: the house blazes with fairy lights, clay diyas on every step, paper lanterns, marigold garlands, a neon heart and a glowing star in the windows; small fireworks burst in the deep violet sky behind the owl. The house is so bright it lights up the whole street. The house and the owl are in the centre of the picture.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes, warm saturated colours. No text, no frame.
```

### T11. Широкий баннер (16:9)

```
A wide night panorama of an old Indian street seen from the rooftops, with Ullu, the same owl as in the attached image, flying in from the right side with his wings spread wide. Keep his face, body, outfit, colours and drawing style exactly as in the reference.

Ullu is a fat barn owl with a white heart-shaped face, a huge crooked saffron-orange turban with a jewelled brooch and a white feather, a lime-green hoodie, an orange marigold garland, a gold chain and green tartan shorts. He holds a small clay kulhad of chai in one hand while he flies.

Scene: rows of flat rooftops and old houses lit with clay diyas, fairy lights and paper lanterns stretch across the whole width; the sky is deep violet with stars and a thin crescent moon. The left half of the sky is calm and empty, with space for words.

Composition: everything important, the owl and the lit rooftops, stays inside the middle horizontal band of the picture; the top quarter is only sky and the bottom quarter is only dark rooftops, because the picture will be cut into a long thin strip.

Style: the same hand-drawn Indian truck-art illustration as the reference: bold, slightly uneven black ink outlines, markers and gouache, visible brush strokes, warm saturated colours. No text, no frame.
```

### T12. Полоса росписи (16:9)

```
A long horizontal decorative border band in Indian truck-art style, running across the whole width of the picture through its middle: a repeating row of painted orange marigolds, small pink roses and green leaves on a red ribbon, with a row of tiny golden bells and short chains hanging below it.

The pattern repeats evenly from the left edge to the right edge so that it can be tiled side by side without a visible seam. The band takes the middle third of the picture.

Style: hand-painted Indian truck art, markers and gouache, bold black outlines, visible brush strokes, saturated colours.

Background above and below the band: plain flat solid deep violet, one even colour. No owl, no text, no letters.
```
