#!/usr/bin/env python3
"""Лист снимков: много картинок на одном листе с подписями имён.

    python3 tools/contact_sheet.py <папка или файлы> --out sheet.jpg [--cols 4] [--cell 360] [--newer-than 2026-11-16]

Зачем: проверить пачку генераций Flow одним взглядом — совпадает ли содержимое с именем, нет ли лишних фигур,
надписей и битых файлов — и не тратить лимиты на открытие каждой картинки по отдельности.
Под каждой картинкой: имя файла, размер в пикселях и вес. Прозрачные PNG показываются на шахматке.
--newer-than берёт только файлы, изменённые после даты (новые генерации).
Нужен Pillow (в облаке есть).
"""
import sys
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

EXT = ('.png', '.jpg', '.jpeg', '.webp')


def font(size):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def checker(w, h, s=12):
    im = Image.new('RGB', (w, h), (235, 235, 235))
    d = ImageDraw.Draw(im)
    for y in range(0, h, s):
        for x in range((y // s) % 2 * s, w, s * 2):
            d.rectangle([x, y, x + s - 1, y + s - 1], fill=(205, 205, 205))
    return im


def main(argv):
    if '--out' not in argv:
        print(__doc__)
        return 2

    def opt(name, default, cast=str):
        return cast(argv[argv.index(name) + 1]) if name in argv else default

    out = Path(opt('--out', 'sheet.jpg'))
    cols = opt('--cols', 4, int)
    cell = opt('--cell', 360, int)
    newer = opt('--newer-than', None)
    newer_ts = time.mktime(time.strptime(newer, '%Y-%m-%d')) if newer else 0
    values = {argv[i + 1] for i, a in enumerate(argv) if a in ('--out', '--cols', '--cell', '--newer-than') and i + 1 < len(argv)}
    files = []
    for a in argv:
        if a.startswith('--') or a in values:
            continue
        p = Path(a)
        if p.is_dir():
            files += sorted(q for q in p.rglob('*') if q.suffix.lower() in EXT and not q.name.startswith('_'))
        elif p.suffix.lower() in EXT:
            files.append(p)
    files = [f for f in files if f.stat().st_mtime >= newer_ts and f.resolve() != out.resolve()]
    if not files:
        print('Картинок не найдено')
        return 1
    label_h = 44
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * (cell + label_h)), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    f1, f2 = font(15), font(12)
    bad = []
    for i, f in enumerate(files):
        x, y = (i % cols) * cell, (i // cols) * (cell + label_h)
        try:
            with Image.open(f) as im:
                size = im.size
                t = im.convert('RGBA')
                t.thumbnail((cell - 12, cell - 12))
                tile = checker(cell, cell) if im.mode in ('RGBA', 'LA', 'P') else Image.new('RGB', (cell, cell), (250, 250, 250))
                tile.paste(t, ((cell - t.width) // 2, (cell - t.height) // 2), t)
                sheet.paste(tile, (x, y))
            info = f'{size[0]}x{size[1]}  {f.stat().st_size / 1048576:.1f} МБ'
        except Exception:
            d.rectangle([x, y, x + cell - 1, y + cell - 1], fill=(255, 220, 220))
            info = 'НЕ ОТКРЫВАЕТСЯ'
            bad.append(f.name)
        name = f.name if len(f.name) <= 44 else f.name[:20] + '…' + f.name[-22:]
        d.text((x + 6, y + cell + 4), name, fill=(20, 20, 20), font=f1)
        d.text((x + 6, y + cell + 24), info, fill=(110, 110, 110), font=f2)
        d.rectangle([x, y, x + cell - 1, y + cell + label_h - 1], outline=(220, 220, 220))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=88)
    print(f'Лист: {out} ({len(files)} картинок)')
    for b in bad:
        print('  не открывается: ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
