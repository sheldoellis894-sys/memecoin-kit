# Horocope — промты для Flow

Написано для Flow в браузере на компьютере. Настройки перед каждым шагом: значок с ползунками → формат из шага, количество `x1`, модель Nano Banana Pro → **Save**. Число картинок задаёт сам промт.

Если работаете с iPhone: счётчик там стоит на `x4` и не меняется. Тогда в шагах, где нужно несколько разных картинок (кастинг, логотип, галерея, позы), давать по одной сцене на промт и начинать его словами `One single 1:1 image with exactly one character.` вместо `Generate N separate 1:1 images`.

Ко всем промтам, кроме кастинга, прикладывать канон `references/horocope_main.jpg` через плюс в поле ввода.

На что смотреть в каждой картинке:
- шар сам и есть героиня: лицо нарисовано на стекле, внутри шара никого нет, ног нет;
- приметы на месте: голубое стекло с розово-сиреневым свечением, усталые глаза под тяжёлыми веками, синий тюрбан узлом с розовой брошью-звездой, две короткие сиреневые ручки, тёмная подставка;
- нет букв, цифр, чужих логотипов и чужих персонажей; на графиках нет подписей.

Блок героя (стоит в каждом промте целиком):

> Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. The face, the turban, the two arms and the stand are the only parts of her; she has no legs and no neck.

Блок стиля:

> Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, a few small four-pointed sparkles, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. All paper, signs, screens and surfaces are blank, with no letters and no numbers.

Фон сцен по умолчанию:

> Background: a smooth saturated gradient from hot pink in the top left corner to bright blue in the bottom right corner, plain and empty.

---

## 2.1. Кастинг — формат 1:1

Ассет не сохраняется. Выбрать один вариант из четырёх. Манера одна (аэрограф), отличается характер. К слогану ближе всего вариант 2: она всё знала и ей очень жаль.

```
Generate 4 separate 1:1 images. Each image shows the same original character with a different mood.

The character is Madame Cope, a fortune teller who comforts unlucky traders. Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two simple dark navy eyes, two soft round pink blush marks on the cheeks, and a small mouth. On top of the sphere sits a round bright blue turban with one pink star-shaped brooch in the middle. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. The face, the turban, the two arms and the stand are the only parts of her; she has no legs and no neck. In one hand she holds a small pink tissue box with one white tissue sticking out of the top. She is shown whole, centered, with empty space around her.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, a few small four-pointed sparkles, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: a smooth saturated gradient from hot pink in the top left corner to bright blue in the bottom right corner, plain and empty. All surfaces are blank, with no letters and no numbers.

Image 1: gentle and sleepy, eyes drawn as two soft downward arcs, a calm closed smile, she holds the tissue box out toward the viewer.
Image 2: very sorry, eyebrows raised in the middle, big shiny apologetic eyes, a small guilty smile, she offers one tissue with the other hand.
Image 3: serene and all-knowing, eyes closed, a tiny satisfied smile, the tissue box held against her side like a handbag.
Image 4: tired after a long night, heavy half-closed eyelids, a flat patient mouth, the tissue box held up without enthusiasm.
```

## 2.2. Канон

Выбран вариант с тяжёлыми полузакрытыми веками и ровным ртом (07.10.2026, совет ассистента по снимку четырёх вариантов; ждёт подтверждения владельца). Его приметы дописаны в блок героя во всех промтах ниже: усталые глаза под тяжёлыми веками, короткие ровные брови, маленький ровный рот, тюрбан узлом из двух пухлых долей с брошью-звездой посередине.

Ассет `CopeMain`, файл `references/horocope_main.jpg`.

## 2.3. Развёртка — формат 16:9

Ассет `CopeTurnaround`, файл `references/horocope_turnaround.jpg`.

```
Using the character from the attached reference image, generate 1 image: one single 16:9 character turnaround sheet with four views of the same character standing in a row at the same height: front view, three-quarter view, side profile, back view.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. The face, the turban, the two arms and the stand are the only parts of her; she has no legs and no neck. Her hands are empty and held slightly away from the sphere. In the back view the glass is plain and the back of the turban is visible.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: one flat hot pink color, plain and empty. All surfaces are blank, with no letters and no numbers.
```

## 2.4. Эмоции — формат 1:1

Ассет `CopeEmotions`, файл `references/horocope_emotions.jpg`.

Первая версия промта просила «крупные портреты», и Flow обрезал тюрбан и подставку (07.10.2026). В этой версии героиня в каждой клетке показана целиком и с полями.

```
Using the character from the attached reference image, generate 1 image: one single 1:1 expression sheet, a grid of six square cells, three in the top row and three in the bottom row, separated by thin white lines.

Each cell shows the whole character from the top of her turban down to the bottom of her stand, drawn small enough to fit completely inside the cell. In every cell there is a clear empty pink margin above the turban, below the stand and on the left and right of her hands. Nothing touches or crosses the edge of a cell: the turban, the hands and the stand are never cut off. She is the same size in all six cells.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two eyes with heavy dark navy upper eyelids, two short dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck.

The six expressions, one per cell: comforting and gentle; very sorry; suspicious, looking sideways; quietly proud; fast asleep with closed eyes; shocked with a wide open mouth. Her heavy upper eyelids stay visible in every expression except the shocked one.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Every cell has the same flat hot pink background. No letters and no numbers anywhere.
```

## 2.5. Логотип — формат 1:1

Ассет `CopeLogo`, файл `logo/horocope_logo.jpg`. Четыре идеи с предметом. Выбирать по самому мелкому кругу: ассистент соберёт превью 400, 200, 96 и 48 px.

```
Using the character from the attached reference image, generate 4 separate 1:1 images. Each image shows the whole character for a small round profile picture, from the top of her turban down to the bottom of her stand. She is centered and takes about two thirds of the height of the frame, with clear empty pink space above the turban, below the stand and on both sides. Nothing is cut off by the edge of the frame.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: one flat hot pink color, plain and empty. No letters and no numbers.

Image 1: she holds one white tissue out toward the viewer with her tired patient look and a very small sorry smile.
Image 2: she hides one small glowing yellow star behind her back with one hand and looks at the viewer with an innocent face.
Image 3: a small red falling zigzag line is reflected inside her glass, and she looks at the viewer with her tired patient face as if nothing happened.
Image 4: she puts one mitten hand on her cheek and winks, and one small four-pointed sparkle shines on the glass.
```

## 2.6. Баннер — формат 16:9

Сцена с сюжетом и движением: планеты крадутся прочь, она на них показывает. Планет ровно три: это число стоит в текстах, сверить на картинке.

Ассет `CopeBanner`, файл `banners/horocope_banner.jpg`. Идёт на сайт (раздел о героине) и в картинку ссылок.

```
Using the character from the attached reference image, generate 1 image: one single 16:9 scene.

Madame Cope stands in the right third of the frame and points one arm firmly to the left. In the middle of the frame exactly three small cartoon planets with tiny legs tiptoe away from her toward the left, looking back over their shoulders with guilty faces: one small grey planet, one small orange planet with a ring, and one small pale yellow moon. Each planet is about one quarter of her height. A thin shooting star crosses the sky above them. The left third of the frame is empty sky. All characters stand in the lower half of the frame, and the upper part of the frame is empty sky.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck. In her other hand she holds a small pink tissue box with one white tissue sticking out.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, a few small four-pointed sparkles, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy, white, with grey, orange and pale yellow only on the three planets. Background: a smooth saturated gradient sky from hot pink on the left to bright blue on the right, with a few tiny white stars. No letters and no numbers.
```

## 2.7. Широкий баннер — формат 16:9

Новая генерация, не правка. Идёт в шапки X и DexScreener (полоса 3:1 из середины кадра), поэтому вся сцена лежит узкой лентой.

Ассет `CopeBannerWide`, файл `banners/horocope_banner_wide.jpg`.

```
Using the character from the attached reference image, generate 1 image: one single 16:9 image composed as a wide panoramic strip. The whole scene runs from left to right as one narrow band across the vertical middle of the frame. The top quarter and the bottom quarter of the frame are plain empty gradient sky.

In the band: the left third is empty sky. In the middle third exactly three small cartoon planets with tiny legs tiptoe away toward the left in a row, looking back with guilty faces: one small grey planet, one small orange planet with a ring, and one small pale yellow moon. In the right third stands Madame Cope, pointing one arm at them. She is small enough to fit inside the middle band with free sky above her turban and below her stand.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck. In her other hand she holds a small pink tissue box with one white tissue sticking out.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy, white, with grey, orange and pale yellow only on the three planets. Background: a smooth saturated gradient sky from hot pink on the left to bright blue on the right, with a few tiny white stars. No letters and no numbers.
```

## 2.8. Галерея — формат 1:1, восемь сцен двумя заходами

Ассеты `CopeG01`…`CopeG08`, файлы `gallery/horocope_g01.jpg`…`horocope_g08.jpg`. На сайте сцена обрезается по кругу: главное держать в центре кадра.

Заход 1, сцены 1–4:

```
Using the character from the attached reference image, generate 4 separate 1:1 images, one image for each scene below. In every image the main action is in the center of the frame and nothing important touches the corners.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, a few small four-pointed sparkles, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: a smooth saturated gradient from hot pink in the top left corner to bright blue in the bottom right corner, plain and empty. All paper, screens and surfaces are blank, with no letters and no numbers.

Scene 1: Madame Cope holds out a small pink tissue box with both hands toward the viewer, one white tissue sticking out of it, with her tired patient look and a very small sorry smile.
Scene 2: A plain red zigzag line that falls from the top left to the bottom right is reflected inside her glass. She looks at it calmly. There are no axes, no labels and no numbers on the line.
Scene 3: Madame Cope shrugs with one arm and points the other arm straight up at one small grey cartoon planet floating above her. The planet looks away and whistles.
Scene 4: Early morning. Madame Cope has a small pink sleep mask pushed up on her turban and yawns. Next to her on a small table stands a round alarm clock with a blank white face and two bells on top.
```

Заход 2, сцены 5–8:

```
Using the character from the attached reference image, generate 4 separate 1:1 images, one image for each scene below. In every image the main action is in the center of the frame and nothing important touches the corners.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, softly glowing edges, a few small four-pointed sparkles, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: a smooth saturated gradient from hot pink in the top left corner to bright blue in the bottom right corner, plain and empty. All paper, cards, screens and surfaces are blank, with no letters and no numbers.

Scene 5: Madame Cope sits at a small round table and pours tea from a small white teapot into a white cup that stands in front of an empty chair across the table.
Scene 6: Blank lilac cards float in a ring around Madame Cope. Each card shows only one small four-pointed white star. She looks up at them with her tired patient face.
Scene 7: Small cartoon planets with tiny legs stand in a row against a plain wall and look guilty: a grey one, an orange one with a ring, and a pale yellow moon. Madame Cope stands in front of them with one arm on her side, like a kind teacher.
Scene 8: Madame Cope wears small dark navy sunglasses and looks sideways with suspicion at a plain green zigzag line that rises from the bottom left to the top right next to her. There are no axes, no labels and no numbers on the line.
```

## 2.9. Позы для записи — формат 1:1, три картинки

У записи гороскопа три позы героини: для низкой оценки, для средней и для высокой. Фон ровный ярко-зелёный: ассистент уберёт его сам.

Ассеты `CopeS01`…`CopeS03`, файлы `stickers/horocope_s01_raw.jpg`…`horocope_s03_raw.jpg`.

```
Using the character from the attached reference image, generate 3 separate 1:1 images, one image for each pose below. In every image the character is shown whole, centered, the same size, with empty space on all four sides, and nothing else is in the frame.

Madame Cope is a living crystal ball: the glass sphere itself is her whole head and body, and nobody is inside it. The sphere is pale sky blue glass with a soft pink and lilac glow swirling inside. The glass is fully opaque: the background never shows through it. Her face is painted right on the glass: two tired eyes with heavy dark navy half-closed upper eyelids and small dark pupils under them, two short flat dark navy eyebrows, two soft round pink blush marks on the cheeks, and a small flat patient mouth. On top of the sphere sits a bright blue turban tied as a soft knot with two round puffy lobes, with one pink star-shaped brooch in the middle of the knot. Two short thin lilac arms with small round mitten hands grow out of the left and right sides of the sphere. The sphere rests on a short round dark navy stand that is her base. She has no legs and no neck.

Style: cartoon airbrush illustration, like a modern sticker painted with an airbrush: smooth soft gradients, glossy white highlights on the glass, clean simple rounded shapes with a soft thick dark navy outline. Palette: sky blue, lilac, hot pink, bright blue, dark navy and white. Background: one flat pure bright green color (#00FF00), completely even, with no shadow on it, no glow, no sparkles and no gradient. No letters and no numbers.

Pose 1: she holds out a small pink tissue box with both hands, one white tissue sticking out, with her tired patient look and a very small sorry smile.
Pose 2: she shrugs with both arms raised to the sides, palms up, with her tired patient face.
Pose 3: she wears small dark navy sunglasses, one arm on her side, and looks sideways with suspicion.
```

---

## Что куда идёт

| Файл | Где используется |
|---|---|
| `references/horocope_main.jpg` | центр колеса на первом экране |
| `logo/horocope_logo.jpg` | аватар в Figma, значок сайта |
| `banners/horocope_banner.jpg` | раздел о героине на сайте, картинка ссылок |
| `banners/horocope_banner_wide.jpg` | шапки X и DexScreener |
| `gallery/horocope_g01…g08.jpg` | галерея-пузыри, посты X |
| `stickers/horocope_s01…s03.png` | поза героини рядом с записью: низкая, средняя и высокая оценка |

Анимация не делается. Знаки зодиака на колесе нарисованы кодом, Flow для них не нужен.
