#!/usr/bin/env python3
"""Проверка экспорта бренд-кита из Figma.

    python3 tools/check_exports.py projects/<имя> [--prefix <префикс>] [--rename] [--favicon]

Ждёт в projects/<имя>/brand/exports шесть файлов (размеры как на всех прошлых проектах):
  <prefix>_avatar.png              1000x1000
  <prefix>_avatar_circle.png       1000x1000, углы прозрачные
  <prefix>_avatar_circle_256.png   256x256 (фавикон и лёгкий логотип для сайта; --favicon делает его из круга)
  <prefix>_x_header.png            1500x500
  <prefix>_dex_header.png          1500x500
  <prefix>_og.png                  1200x630

Что проверяет:
  - нет ли файлов с именами кадров Figma (Frame 1.png, X_Header.png…); с --rename переименовывает кадры
    X_Header, Dex_Header, OG_Image, Avatar, Avatar_Circle в правильные имена
  - размер каждого файла в пикселях и вес (баннер для pump.fun не больше 4,5 МБ, картинка не больше 15 МБ)
  - белые или однотонные полосы по краям (картинка в кадре уже кадра)
  - прозрачные углы у круглого аватара (белые углы = заливка кадра не убрана)
  - одинаковые ли шапки X и DEX (это нормально, если так решили; скрипт просто сообщает)
  - чужие файлы в папке: совпадение по содержимому с экспортом другого проекта
Глубокую проверку (поля, углы, фавикон) делает только при наличии Pillow; без него проверяет размеры по заголовку файла.
Код выхода 1, если есть ошибки.
"""
import hashlib
import os
import re
import struct
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None

EXPECTED = {
    'avatar': (1000, 1000),
    'avatar_circle': (1000, 1000),
    'avatar_circle_256': (256, 256),
    'x_header': (1500, 500),
    'dex_header': (1500, 500),
    'og': (1200, 630),
}
FIGMA_NAMES = {
    'x_header': 'x_header', 'xheader': 'x_header', 'twitter_header': 'x_header',
    'dex_header': 'dex_header', 'dexheader': 'dex_header', 'dexscreener_header': 'dex_header',
    'og_image': 'og', 'og': 'og', 'link_preview': 'og',
    'avatar': 'avatar', 'avatar_circle': 'avatar_circle', 'avatarcircle': 'avatar_circle', 'circle': 'avatar_circle',
}
LIMITS = {'x_header': 4.5, 'dex_header': 4.5, 'avatar': 15, 'avatar_circle': 15, 'og': 15}


def header_size(p):
    """Размер PNG или JPEG без Pillow."""
    with open(p, 'rb') as f:
        head = f.read(26)
        if head[:8] == b'\x89PNG\r\n\x1a\n':
            return struct.unpack('>II', head[16:24])
        if head[:2] == b'\xff\xd8':
            f.seek(2)
            while True:
                b = f.read(1)
                while b and b != b'\xff':
                    b = f.read(1)
                while b == b'\xff':
                    b = f.read(1)
                if not b:
                    return None
                marker = b[0]
                if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                    f.read(3)
                    h, w = struct.unpack('>HH', f.read(4))
                    return w, h
                seg = struct.unpack('>H', f.read(2))[0]
                f.seek(seg - 2, 1)
    return None


def edge_bands(im):
    """Сколько пикселей у каждого края — сплошная однотонная полоса (белая или любая)."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    px = rgb.load()

    def flat_line(coords):
        vals = [px[x, y] for x, y in coords]
        r0, g0, b0 = vals[0]
        return all(abs(r - r0) + abs(g - g0) + abs(b - b0) < 18 for r, g, b in vals), vals[0]

    out = {}
    for side in ('top', 'bottom', 'left', 'right'):
        n = 0
        colour = None
        limit = (h if side in ('top', 'bottom') else w) // 4
        for i in range(limit):
            if side == 'top':
                coords = [(x, i) for x in range(0, w, 3)]
            elif side == 'bottom':
                coords = [(x, h - 1 - i) for x in range(0, w, 3)]
            elif side == 'left':
                coords = [(i, y) for y in range(0, h, 3)]
            else:
                coords = [(w - 1 - i, y) for y in range(0, h, 3)]
            ok, c = flat_line(coords)
            if not ok or (colour is not None and sum(abs(a - b) for a, b in zip(c, colour)) > 18):
                break
            n += 1
            colour = colour or c
        out[side] = (n, colour)
    return out


def corners_transparent(im):
    if im.mode not in ('RGBA', 'LA', 'P'):
        return False
    a = im.convert('RGBA').split()[-1]
    w, h = a.size
    pts = [(5, 5), (w - 6, 5), (5, h - 6), (w - 6, h - 6)]
    return all(a.getpixel(p) < 10 for p in pts)


def md5(p):
    return hashlib.md5(p.read_bytes()).hexdigest()


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    if not args:
        print(__doc__)
        return 2
    proj = Path(args[0])
    exp = proj / 'brand' / 'exports'
    if not exp.is_dir():
        print(f'Нет папки {exp}')
        return 2
    prefix = argv[argv.index('--prefix') + 1] if '--prefix' in argv else None
    if not prefix:
        found = [f.name for f in exp.glob('*_avatar.png')]
        prefix = found[0][:-len('_avatar.png')] if found else proj.name
    errors, notes = [], []

    # 1. имена кадров Figma
    for f in sorted(exp.iterdir()):
        if not f.is_file():
            continue
        stem = re.sub(r'[\s\-]+', '_', f.stem).lower()
        if f.name.startswith(prefix + '_'):
            continue
        key = FIGMA_NAMES.get(stem)
        if key and f.suffix.lower() == '.png':
            target = exp / f'{prefix}_{key}.png'
            if '--rename' in argv and not target.exists():
                f.rename(target)
                notes.append(f'переименован: {f.name} -> {target.name}')
            else:
                errors.append(f'имя кадра Figma: {f.name} -> должно быть {target.name}' + (' (такой файл уже есть)' if target.exists() else ' (запустите с --rename)'))
        elif re.match(r'^frame[\s_]*\d*$', f.stem, re.I) or f.stem.lower().startswith('untitled'):
            errors.append(f'безымянный экспорт Figma: {f.name} — непонятно, какой это кадр')
        else:
            notes.append(f'лишний файл в exports: {f.name}')

    # 2. чужие файлы: совпадение с экспортами других проектов
    projects_root = proj.parent
    if projects_root.is_dir():
        mine = {md5(f): f.name for f in exp.iterdir() if f.is_file()}
        for other in projects_root.iterdir():
            oe = other / 'brand' / 'exports'
            if other == proj or not oe.is_dir():
                continue
            for f in oe.iterdir():
                if f.is_file() and f.suffix.lower() in ('.png', '.jpg') and md5(f) in mine:
                    errors.append(f'{mine[md5(f)]} — это файл проекта {other.name} ({f.name}), попал сюда по ошибке')

    # 3. сами файлы
    sizes = {}
    for key, (w, h) in EXPECTED.items():
        p = exp / f'{prefix}_{key}.png'
        if not p.exists():
            if key == 'avatar_circle_256' and '--favicon' in argv and Image and (exp / f'{prefix}_avatar_circle.png').exists():
                with Image.open(exp / f'{prefix}_avatar_circle.png') as im:
                    im.convert('RGBA').resize((256, 256), Image.LANCZOS).save(p, optimize=True)
                notes.append(f'сделан {p.name} из круглого аватара')
            else:
                errors.append(f'нет файла {p.name}' + (' (сделать: --favicon)' if key == 'avatar_circle_256' else ''))
                continue
        mb = p.stat().st_size / 1048576
        if key in LIMITS and mb > LIMITS[key]:
            errors.append(f'{p.name}: {mb:.1f} МБ, больше предела {LIMITS[key]} МБ')
        if Image:
            with Image.open(p) as im:
                size = im.size
                if size != (w, h):
                    errors.append(f'{p.name}: {size[0]}x{size[1]}, нужно {w}x{h}')
                bands = edge_bands(im)
                if key in ('x_header', 'dex_header', 'og'):
                    for side, (n, colour) in bands.items():
                        white = colour and all(c > 235 for c in colour)
                        transparent = im.mode in ('RGBA', 'LA') and im.convert('RGBA').getpixel((0, 0))[3] < 10
                        if n >= 2 and (white or transparent):
                            errors.append(f'{p.name}: {"белая" if white else "прозрачная"} полоса {n} px по краю ({side}) — картинка в кадре уже кадра')
                        elif n >= 12:
                            notes.append(f'{p.name}: ровная полоса {n} px по краю ({side}) — посмотреть, задумано ли так')
                elif key in ('avatar_circle', 'avatar_circle_256'):
                    if not corners_transparent(im):
                        errors.append(f'{p.name}: углы не прозрачные — у кадра в Figma не убрана заливка (Fill)')
                sizes[key] = size
        else:
            size = header_size(p)
            if size and tuple(size) != (w, h):
                errors.append(f'{p.name}: {size[0]}x{size[1]}, нужно {w}x{h}')
            sizes[key] = size
        print(f'  {p.name}: {sizes.get(key)}  {mb:.2f} МБ')

    x, d = exp / f'{prefix}_x_header.png', exp / f'{prefix}_dex_header.png'
    if x.exists() and d.exists() and md5(x) == md5(d):
        notes.append('шапки X и DEX — один и тот же файл (допустимо, если так решили)')
    if not Image:
        notes.append('Pillow нет: поля, прозрачные углы и фавикон не проверены — запустить в облаке')

    for n in notes:
        print('  · ' + n)
    for e in errors:
        print('  ОШИБКА: ' + e)
    print('\nЗамечаний нет' if not errors else f'\nОшибок: {len(errors)}')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
