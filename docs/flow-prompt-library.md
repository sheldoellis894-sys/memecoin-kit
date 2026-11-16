# Библиотека промтов Google Flow

Проверенные заготовки из десяти проектов (Molty – Mr. MA). Для нового героя меняются только части в угловых скобках `<…>`, остальное уже прошло проверку генерациями. Цель: каждый промт срабатывает с первого раза и не тратит лимиты Flow

Собрано 16.11.2026. Образцы целиком: `projects/horsecorp/brand/docs/horsecorp_flow_prompts.md` (войлочная игрушка, локации, предметы), `projects/ullu/brand/docs/ullu_flow_prompts.md` (2D-мультфильм, эмоции, позы), `projects/tenkeys/brand/docs/tenkeys_flow_prompts.md` (предмет без героя)

## 1. Шапка промта: компьютер или iPhone

Модель Nano Banana Pro. Формат и число картинок пишутся в самом промте: Flow слушается только текста промта

Веб-версия на компьютере, счётчик в настройках `x1`:
```
Generate 2 images.
Aspect ratio <16:9 | 1:1 | 3:4 | 9:16>.
```

Приложение на iPhone, счётчик `x2`, формат выставить и в приложении:
```
One single <16:9 | 1:1 | 3:4> image.
```
Если в кадре один герой, на iPhone дописать: `with exactly one character`. Без этого «4 separate images» на iPhone даёт одну картинку-сетку, повторённую четыре раза

Формата 3:1 во Flow нет. Полосы 1500×500 режутся из 16:9

## 2. Проверка перед отправкой каждого промта

Пройти все пункты. Если хоть один не выполнен, промт не отдавать

1. Шапка: число картинок и формат написаны в тексте, шапка соответствует устройству (компьютер или iPhone)
2. Блок героя вставлен целиком, слово в слово, со всеми приметами. Что пропущено, Flow додумает сам (штаны, лишние пальцы, пропавшая брошь)
3. Стороны названы однозначно: «his left» = левая сторона героя, на виде спереди это правая сторона картинки. Все шрамы, заплатки, родинки на одной стороне
4. Блок стиля вставлен целиком
5. У каждой картинки своя сцена и своё действие. Похожие сцены пачкой дают одну и ту же картинку
6. Число предметов и героев названо цифрой и сходится с подписью, ALT и постом (`exactly three`, `six pictures`)
7. Фон для вырезания выбран по цветам героя (раздел 4)
8. Надписи: в конце промта строка о том, что текста, букв, цифр и логотипов нет нигде. Таблички, экраны, обложки названы «plain», «blank»
9. Обрезка учтена заранее: где останется свободное место под название, что попадёт в полосу 3:1 или в круг аватарки
10. Чужие персонажи, бренды и узнаваемые предметы не упоминаются
11. Для правки готовой картинки: «Keep everything else in the picture exactly as it is», канон приложен вторым референсом, одобренная картинка не заменяется, новый вариант идёт отдельным файлом

## 3. Блоки, которые вставляются в каждый промт

### Блок героя
Одним абзацем, от головы к ногам: кто он (вид и материал), голова и лицо, глаза (цвет, размер, «same size»), особые приметы с указанием стороны, одежда по слоям, руки (сколько пальцев или «mittens»), ноги и обувь, хвост и мелочи. Писать только утверждениями, что есть

Пример (Mr. MA, войлок):
```
Mr. Ma, a small soft toy horse made of needle-felted wool, standing upright on two short legs like a person. A big rounded head of red felt with a wide cream felt muzzle, two round brown felt nostrils and a small downturned mouth; tired half-closed eyes with white eyeballs and black pupils, heavy red eyelids, soft pink bags under the eyes, and two short thick dark-maroon felt eyebrows slanted in worry. A messy mane of thick dark-maroon yarn dreadlocks covers the top and the back of his head. A square cream felt patch is sewn on the left side of his forehead with rough brown stitches; his left ear has pink felt inside and brown stitches around its edge; a stitched scar runs down his left cheek. He wears a grey felt suit jacket, a little too big for him, ... His hands are red felt mittens, his legs are red felt, he wears dark-maroon felt shoes, and a short tail of maroon yarn hangs behind him.
```

Если лицо в эмоции меняется, из блока героя убрать слова про выражение лица («tired», «downturned»), иначе Flow смешает эмоции

### Блоки стиля, которые сработали

Войлочная игрушка 3D (Mr. MA):
```
Style: a three-dimensional render of a handmade needle-felted wool toy, matte and soft with visible wool fibres, no gloss and no plastic shine, gentle even studio light and a soft shadow on the ground; a stylised toy, not a photograph and not a real animal.
```

Гладкий 2D-мультфильм (Ullu):
```
Style: a smooth, high-resolution two-dimensional cartoon illustration with clean, confident black outlines of even weight, flat saturated colours with soft cel shading in one darker tone, and crisp white highlights on <shiny parts>.
```

Мемный стикер (Scootini Goosini): толстый неровный чёрный контур, плоские яркие цвета, чуть уродливо нарочно, наглый характер на морде

Ризография (Inkmaxx): оттиск в две краски, синяя и розовая на кремовой бумаге, зерно и точки растра

Предметный 3D-рендер (Ten Keys): матовая сталь, светлый бетон, мягкий свет, ровно один сигнальный оранжевый предмет на кадр

Журнальная иллюстрация (Chef Rekt): плоские формы с зерном, ограниченная палитра

Отвергнуто владельцем: фотореализм, «фото настоящей плюшевой игрушки», детская раскраска, карандашный набросок «мышкой», слишком мультяшная чистая наклейка для мемкойна, пугающая гротескная мимика (вены, выпученные глаза)

### Блок фона для вырезания
```
Plain flat bright green background, one even colour from edge to edge, the <N> <figures> standing freely on it with clear space around each one so each can be cut out. The sheet holds only the <N> pictures: no text, no labels, no frames, no lines.
```

## 4. Какой фон выбрать для вырезания

- Зелёный `#00FF00` — если на герое и предметах нет зелёного
- Розовый `#FF00FF` — если на герое есть зелёное. Даёт розовый отсвет на белом и съедает чёрный мех: при вырезании это учитывается
- Синий — если на герое есть и зелёное, и красное (Chef Rekt)
- Для предметов дописать: `no green parts on the props`

## 5. Заготовки по видам картинок

### 5.1. Кастинг
Каждый вариант отдельным промтом, по одному на сообщение. Варианты должны отличаться и манерой рисунка, и устройством героя, без общего референса между ними. Сначала манера (один герой в разных стилях), затем характер (одна манера, разные выражения), если манера ещё не выбрана
```
<шапка>
A full-body character design of <кто это, одной фразой с главной шуткой образа>, standing facing the viewer in a three-quarter view, the whole figure visible from head to feet with space around it. <блок героя в этой версии>
<блок стиля этой версии>
<блок фона>
```
Главный референс показывает только героя: без рамок, реквизита и надписей. Необычную форму тела описывать настойчиво («a body shaped like a ball», «a tiny head on a huge body»). Гибрид описывать как одно существо: «a goose that is itself a scooter», детали второй половины — «the only scooter parts in the image»

### 5.2. Развёртка (16:9)
Взять M1 из `horsecorp_flow_prompts.md`: четыре вида в один ряд (спереди, три четверти, профиль, сзади), одинаковый размер, руки опущены, одно лицо. Для вида сзади описать, что видно (затылок, спина одежды, хвост, пятки)

### 5.3. Эмоции (16:9, шесть в два ряда)
```
<шапка>
Using the character from the attached reference image, an expression sheet with exactly six pictures of the same <character>, placed freely on one open green background in two rows of three, with wide green space between them. Each picture shows him from the waist up, facing the viewer, all six the same size, with the same <постоянные приметы> in every picture; only his face and his hands change.
1. <Эмоция>: <глаза>, <брови>, <рот>, <руки>.
...
6. ...
<блок героя без выражения лица>
<блок стиля>
<блок фона на шесть фигур>
```
Каждую эмоцию описывать через глаза, брови, рот и руки, а не одним словом. Подмигивание не заказывать: Flow рисует тёмное пятно вокруг глаза

### 5.4. Позы (16:9, три в ряд)
Как M4–M7 в `horsecorp_flow_prompts.md`: три фигуры в полный рост, у каждой своё действие и предмет. Предметы в руках описывать простыми и пустыми (plain envelope, blank sign, plain white cup)

### 5.5. Логотип и аватар (1:1)
Портрет-бюст скучен и отвергается. Нужна идея с предметом: герой кусает монету, предъявляет пончик как удостоверение, говорит по телефону-кирпичу, нашивка-эмблема компании. Давать сразу четыре идеи на выбор
```
One single 1:1 image.
Using the character from the attached reference image: <герой и предмет-идея>, centred, with <фон> space all around, the whole head and the object inside the frame.
<блок героя>
<блок стиля>
Plain flat <цвет> background, one even colour from edge to edge. No text, no letters, no logos, no frames.
```
Слово «circle» про рамку не писать: Flow обрезает картинку кругом и оставляет белые углы. Круг делается в Figma. Перед выбором проверить превью в круге 48 px: лицо должно читаться

### 5.6. Баннер: пара картинок (16:9)
Сразу заказывать две картинки:
- **Крупная сцена** — для первого экрана и картинки ссылок 1200×630
- **Широкая лента** — для шапок X и DEX 1500×500

Широкая лента:
```
<шапка, 16:9>
Using the character from the attached reference images: a wide panoramic strip. <сцена с движением и сюжетом>, the whole scene runs left to right as one band across the middle of the picture, between one third and two thirds of the height. <Герой> is in the right third, <остальные> in the middle third; the left third stays calm and plain for the name. Above and below the band the background is plain and even.
<блок героя>
<блок стиля>
No text, no letters, no logos anywhere.
```
Нужно движение и сюжет: погоня, очередь, толпа. Статичный ряд героев и «герой стоит у станка» отвергнуты. Перед Figma проверить скриптом, что фигуры помещаются в полосу 3:1

### 5.7. Сцена для галереи (1:1)
```
<шапка, 1:1>
Using the character from the attached reference image: <одна конкретная смешная ситуация из лора>, <где>, <что делает герой>, <какие предметы>. The whole figure is visible.
<блок героя>
<блок стиля>
<свет и время суток, если важно>
No text, no letters, no logos anywhere: <экраны, таблички, бумаги> are all plain.
```
Для основ мемов дописать: `keep the top fifth and the bottom fifth of the frame free of faces and important details`

### 5.8. Спрайты и наклейки
Каждая поза отдельной картинкой на ровном фоне. Для игры-бега вид строго сбоку, герой смотрит вправо. Мелкие предметы (еда, препятствия) можно листом, их режут по контурам

### 5.9. Локация без героя (16:9)
Как блок сцены у Mr. MA: пустая сцена, вид спереди на уровне глаз героя, левый нижний угол пола свободен (там встанет герой), правый верх спокойный (там облако реплики). Референс — баннер (стиль мира), не картинка героя

### 5.10. Лист предметов (1:1, четыре предмета)
Как `mrma_props_prompts.md`: сетка 2×2 на `#00FF00`, широкие промежутки, ничего не касается, вид три четверти сверху, без людей и текста, `no green parts on the props`

### 5.11. Правка готовой картинки
```
<Что изменить одной фразой>. Keep everything else in the picture exactly as it is.
```
Канон приложить вторым референсом. Сначала скачать хорошую картинку: Flow ставит правку поверх неё. Если картинка не нравится целиком, не править, а дать новый промт

## 6. Что ломалось и как исправлено

- **Неверное число фигур** (семь эмоций вместо шести, девять ключей вместо десяти): число цифрой и словом `exactly`, проверка до Figma
- **Фигуры стоят слишком близко, не вырезать**: `wide green space between them`, `clear space around each one`
- **Светлая панель за фигурой на ровном фоне**: `one even colour from edge to edge`
- **Флоу копирует дефект канона** (тёмное пятно у глаза у Ullu): прикладывать чистые картинки, а не ранний кастинг
- **Лишняя шея или её нет на эмблеме**: описывать, куда уходит тело («the jacket runs down under the outer ring»)
- **Повтор одной картинки при пачке похожих сцен**: промты по одному, у каждого своя сцена
- **Бренд на ноутбуке, буквы на коврике, надписи на плакатах**: всё называть plain и blank, проверять каждую картинку
- **Гибрид рисуется как «герой на предмете»**: описывать одно существо
- **Сращивание одинаковых предметов в ряд** (ключи в замках): принять или убрать цифру из подписи
- **Цвет Flow темнее палитры**: мерить цвет фона баннера и красить им первый экран
