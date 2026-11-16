#!/usr/bin/env python3
"""Заготовка нового проекта: папки и пустые рабочие файлы за одну команду.

    python3 tools/new_project.py <папка> <префикс> [--type meme|utility|agent|client]

Пример: python3 tools/new_project.py horsecorp mrma --type client

Запускать из корня memecoin-kit. Ничего существующего не перезаписывает: если файл уже есть, он пропускается.
Создаёт в projects/<папка>/:
  brand/docs, references, logo, banners, exports, gallery, stickers   (video — только по просьбе об анимации)
  launch/, case/
  brand/docs/<префикс>_brief.md        бриф в формате Дениса
  brand/docs/<префикс>_timelog.md      учёт времени по шагам (по часам, не на глаз)
  brand/docs/<префикс>_flow_prompts.md файл промтов: шапка, блоки героя/стиля/фона, таблица картинок
  brand/docs/<префикс>_site_texts.md   тексты сайта: русский для смысла, английский как на сайте
  state.md                              файл состояния: что сделано, где лежит, что решено, что осталось
  project.config.json                   заготовка конфига сайта (тема и макет выбираются на брифе)
  handover.json                         только для --type client: список архивов для tools/pack_handover.py
"""
import json
import sys
import time
from pathlib import Path

DIRS = ['brand/docs', 'brand/references', 'brand/logo', 'brand/banners', 'brand/exports', 'brand/gallery',
        'brand/stickers', 'launch', 'case']

KIND = {
    'meme': 'мемкойн',
    'utility': 'утилитарный токен',
    'agent': 'проект с ИИ-агентом',
    'client': 'проект для заказчика (передаётся с правами, отдельный репозиторий)',
}


def brief(name, kind):
    extra = ''
    if kind == 'utility':
        extra = '\nПольза токена: что доступно всем, что получают держатели\n'
    if kind == 'agent':
        extra = '\nЧто делает агент (четыре шага):\n1)\n2)\n3)\n4)\n'
    return f"""# Бриф — {name}

Тип: {KIND[kind]}
Дата начала: {time.strftime('%d.%m.%Y')}

1) Нарратив: мета «…» плюс «…». Одно-два предложения
{extra}2) Название:
3) Тикер:
4) Слоган: русский (английский)
5) Хэндлы:
   - X: основной (запасные)
   - Домен: основной (запасные)
   - Telegram: основной (запасные)
6) Тон голоса:

Визуальный код:
1) Палитра сайта: фон, главный, второй, акцент — с кодами и пояснением, откуда цвет
2) Персонаж: цвета частей
3) Шрифты
4) Стиль рисунка

Сайт: форма сайта, игра или инструмент, галерея, анимация (по умолчанию не делается), список приёмов оформления

Сверка с docs/style-passport.md: по каким пунктам из семи сайт отличается от прошлых и на какой прошлый сайт похож больше всего
"""


def timelog(name):
    rows = ['1. Бриф', '2. Flow', '3. Figma', '4. Сайт', '5. Деплой', '6. Пакет запуска', '7. X', '8. Telegram', '9. Кейс']
    table = '\n'.join(f'| {r} | | | |' for r in rows)
    return f"""# Учёт времени — {name}

Время по часам (отметки сообщений и команда date), чистое рабочее время. Шаг — промежуток от первого сообщения по шагу
до сообщения, которое его закрывает. Вычитаются только перерывы от получаса

| Шаг | Начало (МСК) | Конец (МСК) | Минут |
|---|---|---|---|
{table}

Итого:

## Неподтверждённое (спросить в конце одним списком)
-

## Решения владельца
-
"""


def flow(name, prefix):
    return f"""# {name} — Flow prompts

Заготовки и проверка перед каждым промтом: docs/flow-prompt-library.md (раздел 2, одиннадцать пунктов)
Устройство: компьютер (Generate 2 images. / Aspect ratio …) или iPhone (One single <формат> image., счётчик x2)
Референсы: brand/references/{prefix}_main.jpg

## Блок героя (в каждый промт целиком)

```
```

## Блок стиля (в каждый промт целиком)

```
```

## Фон для вырезания
Зелёный / розовый / синий — по цветам героя (библиотека, раздел 4)

## Что проверять на каждой картинке
-

## Картинки

| № | Что | Файл | Формат | Выбрано |
|---|---|---|---|---|
| 1 | Кастинг | — | 1:1 | |
| 2 | Канон | references/{prefix}_main.jpg | 1:1 | |
| 3 | Развёртка | references/{prefix}_turnaround.jpg | 16:9 | |
| 4 | Эмоции | references/{prefix}_emotions.jpg | 16:9 | |
| 5 | Логотип | logo/{prefix}_logo.jpg | 1:1 | |
| 6 | Баннер и широкая лента | banners/{prefix}_banner.jpg, banners/{prefix}_banner_wide.jpg | 16:9 | |
| 7 | Галерея | gallery/{prefix}_g01.jpg … | 1:1 | |
| 8 | Спрайты или наклейки | stickers/{prefix}_..._raw.jpg | 1:1 | |
"""


def site_texts(name):
    return f"""# Тексты сайта — {name}

Русский — для проверки смысла, английский — как на сайте. Без точки в конце абзаца, короче оригинала, без «anon»
Проверка перед отправкой: `python3 tools/check_texts.py <этот файл> --mode site`

## Первый экран
RU:
EN:
"""


def state(name, prefix, kind, folder):
    return f"""# Состояние проекта — {name}

Обновлять в конце каждого захода. Новый диалог читает этот файл первым и продолжает с нужного места

Тип: {KIND[kind]}
Папка: projects/{folder}, префикс файлов: {prefix}
Начат: {time.strftime('%d.%m.%Y')}

## Где что лежит
- Бриф: brand/docs/{prefix}_brief.md
- Промты Flow: brand/docs/{prefix}_flow_prompts.md
- Учёт времени: brand/docs/{prefix}_timelog.md
- Сайт: (адрес превью, репозиторий)
- X:
- Telegram:

## Решения
-

## Сделано
-

## Следующий шаг
- Шаг 1. Бриф

## Не сделано / открытые вопросы
-
"""


def config(name, prefix):
    return {
        'name': name, 'shortName': name, 'ticker': '', 'tagline': '', 'description': '',
        'url': '', 'chain': 'Solana', 'ca': '',
        'theme': 'mine', 'layout': 'longread',
        'links': {'x': '', 'telegram': '', 'pumpfun': '', 'dexscreener': ''},
        'assets': {'logo': f'exports/{prefix}_avatar_circle_256.png', 'favicon': f'exports/{prefix}_avatar_circle_256.png',
                   'hero': f'banners/{prefix}_banner.jpg', 'og': f'exports/{prefix}_og.png'},
        'hero': {'kicker': '', 'text': ''},
        'about': {'kicker': '', 'title': '', 'text': [''], 'image': ''},
        'howToBuy': [{'title': '', 'text': ''}],
        'tokenomics': {'supply': '1,000,000,000', 'items': [{'label': '', 'value': ''}]},
        'gallery': [],
        'roadmap': [{'title': '', 'items': ['']}],
        'disclaimer': '',
        'marquee': [''],
        'images': {'optimize': True},
        'effects': {'reveal': False, 'parallax': False, 'cursor': False, 'sparks': False},
    }


def handover(folder, prefix):
    base = f'projects/{folder}'
    return {
        'project': folder,
        'archives': [
            {'name': f'{prefix}-brand-kit', 'readme': f'{base}/handover/brand_kit_README.md', 'folders': {
                '01_brand_book': [f'{base}/brand/docs/{prefix}_brandbook.pdf'],
                '02_logo': [f'{base}/brand/logo/*.png'],
                '03_social': [f'{base}/brand/exports/*.png'],
                '05_emotions': [f'{base}/brand/references/{prefix}_emotions*.jpg'],
                '07_original_art': [f'{base}/brand/references/{prefix}_main.jpg', f'{base}/brand/banners/*.jpg'],
                '08_prompts': [f'{base}/brand/docs/{prefix}_flow_prompts.md'],
                '09_texts': [f'{base}/brand/docs/{prefix}_site_texts.md'],
            }},
            {'name': f'{prefix}-site', 'readme': f'{base}/handover/site_README.md', 'folders': {
                'site': [{'src': f'../{folder}-repo/{folder}-site', 'tree': True}],
            }},
        ],
    }


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    kind = argv[argv.index('--type') + 1] if '--type' in argv else 'meme'
    if len(args) < 2 or kind not in KIND:
        print(__doc__)
        return 2
    if '--type' in argv:
        args = [a for a in args if a != kind]
    folder, prefix = args[0], args[1]
    root = Path.cwd()
    if not (root / 'projects').is_dir() or not (root / 'templates').is_dir():
        print('Запускать из корня memecoin-kit')
        return 2
    proj = root / 'projects' / folder
    made, skipped = [], []
    for d in DIRS:
        (proj / d).mkdir(parents=True, exist_ok=True)
    name = folder
    files = {
        f'brand/docs/{prefix}_brief.md': brief(name, kind),
        f'brand/docs/{prefix}_timelog.md': timelog(name),
        f'brand/docs/{prefix}_flow_prompts.md': flow(name, prefix),
        f'brand/docs/{prefix}_site_texts.md': site_texts(name),
        'state.md': state(name, prefix, kind, folder),
        'project.config.json': json.dumps(config(name, prefix), ensure_ascii=False, indent=2) + '\n',
    }
    if kind == 'client':
        files['handover.json'] = json.dumps(handover(folder, prefix), ensure_ascii=False, indent=2) + '\n'
        (proj / 'handover').mkdir(exist_ok=True)
    for rel, text in files.items():
        p = proj / rel
        if p.exists():
            skipped.append(rel)
            continue
        p.write_text(text, encoding='utf-8')
        made.append(rel)
    print(f'Проект: projects/{folder} ({KIND[kind]})')
    print('Папки: ' + ', '.join(DIRS))
    for m in made:
        print('  создан: ' + m)
    for s in skipped:
        print('  уже был, не тронут: ' + s)
    if kind == 'client':
        print('  для заказчика: держать сайт в отдельном репозитории (../<папка>-repo), handover.json поправить под состав')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
