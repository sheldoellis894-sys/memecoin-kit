# Chef Rekt — промты для Flow

Flow в браузере на компьютере. Настройки перед каждым шагом: значок с ползунками → формат из шага, количество `x1`, модель Nano Banana Pro → **Save**. Число картинок задаёт сам промт.
Ко всем промтам, кроме кастинга, прикладывать канон `references/chefrekt_main.jpg` через плюс в поле ввода.
На что смотреть в каждой картинке: приметы героя на месте (кремовые кости, большой череп, коричневый китель с кремовыми пуговицами, белый колпак, красный платок, розмарин в кармане), нет букв, цифр и чужих логотипов.

Блок героя (стоит в каждом промте целиком):

> Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Блок стиля:

> Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. All paper, signs and surfaces are blank.

## 2.1. Кастинг — формат 1:1

Ассет не сохраняется. Выбрать один вариант из четырёх.

```
Generate 4 separate 1:1 images. Each image shows the same original character with a different mood.

The character is Chef Rekt, a skeleton who works as a chef and a restaurant critic. He is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets and a short row of square teeth; his body is thin and small under the big skull. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket. In one bony hand he holds a very long blank paper receipt that curls down to the floor. He is shown full body, standing, centered, with empty space around him.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color, plain and empty. All paper and all surfaces are blank.

Image 1: cold and unimpressed, skull tilted slightly, eye sockets shaped like half-closed lids, reading the receipt.
Image 2: smug and satisfied, a crooked grin, looking at the viewer over the top of the receipt.
Image 3: disgusted, skull pulled back, holding the receipt away with two finger bones.
Image 4: dead calm and polite, perfectly straight posture, a tiny courteous smile, the receipt held like a menu.
```

## 2.2. Канон

Выбран вариант 1 из четырёх (06.10.2026): полузакрытые глазницы, голые кости ног, длинный чек. Эти приметы добавлены в блок героя во всех промтах ниже.

Ассет `RektMain`, файл `references/chefrekt_main.jpg`.

## 2.3. Развёртка — формат 16:9

Ассет `RektTurnaround`, файл `references/chefrekt_turnaround.jpg`.

```
Using the character from the attached reference image, generate 1 image: one single 16:9 character turnaround sheet with four full-body views of the same character standing in a row at the same height: front view, three-quarter view, side profile, back view.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket. He stands straight with empty hands, arms slightly away from the body.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color, plain and empty. All surfaces are blank.
```

## 2.4. Эмоции — формат 1:1

Ассет `RektEmotions`, файл `references/chefrekt_emotions.jpg`.

```
Using the character from the attached reference image, generate 1 image: one single 1:1 expression sheet with six head-and-shoulders portraits of the same character arranged in a grid of three columns and two rows.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

The six moods, one per portrait: unimpressed with half-closed eye sockets; smug with a crooked grin; disgusted with the skull pulled back; shocked with wide round eye sockets and an open jaw; politely approving with a small nod; bored and looking sideways.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color behind every portrait. All surfaces are blank.
```

## 2.5. Логотип — формат 1:1

Четыре идеи с предметом, выбрать одну. Ассет `RektLogo`, файл `logo/chefrekt_logo.jpg`.
Выбирать по самому мелкому размеру: череп и колпак должны читаться в круге 48 пикселей.

```
Using the character from the attached reference image, generate 4 separate 1:1 images, one image for each idea below. In every image the character is shown from the chest up, large, in the center of the frame, with a wide even margin of plain background on all four sides.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Idea 1: he holds a long blank paper receipt in front of his chest and looks at the viewer over its top edge, eye sockets half closed.
Idea 2: he holds up a dinner fork with one small cream star stuck on its tip and looks at the star without interest.
Idea 3: he lifts a silver dome lid from a white plate with one hand; on the plate lies a small brown leather wallet. He looks at the viewer.
Idea 4: he tastes from a small spoon held at his teeth, one eye socket narrowed, the other wide.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color, plain and even from edge to edge. All paper and all surfaces are blank.
```

## 2.6. Баннеры — формат 16:9

Два баннера: основной (сайт и картинка ссылок) и широкий (шапки X и DexScreener).
В обоих три кошелька на ножках. Перед Figma пересчитать.

Основной. Ассет `RektBanner`, файл `banners/chefrekt_banner.jpg`.

```
Using the character from the attached reference image, generate 1 image in 16:9.

Scene: a chase seen from the side. On the right side of the frame Chef Rekt strides to the left with long steps. In one bony hand he holds a black frying pan with a small flame under it, in the other a very long blank paper receipt that streams behind him like a ribbon. In front of him exactly three small brown leather wallets with thin stick legs run away to the left in panic, each one a little smaller and further away than the previous one. The whole group stays in the lower two thirds of the frame. The top third and the left third of the frame are empty plain background.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color, plain and even, with a slightly darker red strip as the floor. All paper and all surfaces are blank.
```

Широкий. Новая генерация, не правка основного. Ассет `RektBannerWide`, файл `banners/chefrekt_banner_wide.jpg`.

```
Using the character from the attached reference image, generate 1 image in 16:9 composed as a wide panoramic strip.

Scene: the same chase as one long horizontal band that runs through the middle of the frame. All figures are small and sit inside the middle band, between one third and two thirds of the frame height. Chef Rekt is in the right third and strides to the left with a black frying pan in one hand and a very long blank paper receipt streaming behind him. Exactly three small brown leather wallets with thin stick legs run away from him in the middle third of the frame. The left third of the frame is empty plain background. The area above the band and the area below the band are empty plain background.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. Background: one flat deep meat red color, plain and even from edge to edge. All paper and all surfaces are blank.
```

## 2.7. Галерея — формат 1:1

Восемь сцен двумя промтами по четыре. Ассеты `RektG01`…`RektG08`, файлы `gallery/chefrekt_g01.jpg`…`g08.jpg`.
На сайте картинка стоит на тарелке и обрезается по кругу, поэтому главное держать в центре кадра.

Первая четвёрка:

```
Using the character from the attached reference image, generate 4 separate 1:1 images, one image for each scene below. In every image the main action is in the center of the frame.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Scene 1: Chef Rekt stands at a kitchen counter and reads a very long blank paper receipt that hangs down to the floor. Full body, calm, unimpressed. Background: flat deep meat red.
Scene 2: close view of a white plate on a dark chocolate brown table. A bony cream hand lifts a silver dome lid. Under the lid, on the plate, lies one small brown leather wallet with a sprig of rosemary on top. Background: flat dark chocolate brown.
Scene 3: Chef Rekt fries one small brown leather wallet in a black frying pan over a tall flame, holding the pan handle with one hand, his face calm. Background: flat deep meat red.
Scene 4: Chef Rekt sits alone at a small round table with a white tablecloth and one lit candle and writes in a small blank notebook with a pencil. Background: flat dark chocolate brown.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. All paper, signs and surfaces are blank.
```

Вторая четвёрка:

```
Using the character from the attached reference image, generate 4 separate 1:1 images, one image for each scene below. In every image the main action is in the center of the frame.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Scene 5: Chef Rekt presses a round cream sticker with one single star shape on it onto a glass restaurant door. The sticker carries only the star. Background: flat deep meat red.
Scene 6: a kitchen is on fire behind Chef Rekt, tall flames rise from the stove and the pots. He stands in front, perfectly calm, and tastes soup from a small spoon. Background: flat dark chocolate brown with the flames in cream and meat red.
Scene 7: a very long blank paper receipt runs from Chef Rekt's hands across the floor in loops and out through an open door. He holds its end and reads. Background: flat deep meat red.
Scene 8: Chef Rekt holds up a dinner fork with one small cream star stuck on its tip, like a single bite of food, and looks at the viewer. Background: flat dark chocolate brown.

Style: modern editorial magazine illustration, the kind printed in a food magazine next to a restaurant review. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red, white and a little rosemary green, soft grainy texture inside the shapes, bold and graphic. All paper, signs and surfaces are blank.
```

## 2.8. Позы для оценок — формат 1:1

Шесть поз, по одной на оценку от 0 до 5 звёзд. Ассеты `RektS00`…`RektS05`, файлы `stickers/chefrekt_s00_raw.jpg`…`s05_raw.jpg`.
Фон синий: в герое нет синего, а зелёный фон съел бы розмарин. Фон убирает ассистент, готовые файлы — `stickers/chefrekt_s00.png`…`s05.png`.

```
Using the character from the attached reference image, generate 6 separate 1:1 images, one image for each pose below. In every image the character is shown full body from head to feet, the same size, standing in the center of the frame and facing the viewer, with empty space on all four sides.

Chef Rekt is a complete human skeleton with warm cream bones. His skull is big and round, about one third of his whole height, with two large dark eye sockets under heavy half-closed lids and a short row of square teeth; his body is thin and small under the big skull, and below the jacket his bare cream leg bones and bone feet are visible. He wears a dark chocolate brown double-breasted chef jacket with two rows of cream buttons, a tall white chef hat, and a deep meat red neckerchief tied at the neck. A small green rosemary sprig sticks out of his chest pocket.

Pose 1: he covers both eye sockets with one bony hand and turns his skull away.
Pose 2: he holds a black frying pan with a flame in it at arm's length, as far from himself as he can.
Pose 3: he sniffs a small spoon and leans back, the other hand raised in refusal.
Pose 4: he shrugs with both shoulders, a dinner fork in one hand, palms up.
Pose 5: he nods slightly and wipes a small white plate with a piece of bread.
Pose 6: he has taken off his tall white chef hat, holds it against his chest and bows.

Style: modern editorial magazine illustration. Flat simple shapes without outlines, a limited palette of warm cream, dark chocolate brown, deep meat red and white, soft grainy texture inside the shapes, bold and graphic. Background: one flat pure blue color (#0000FF), perfectly even from edge to edge, the same in all six images. The character sits on the blue like a clean paper cut-out.
```
