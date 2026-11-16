#!/usr/bin/env python3
"""Вырезание героя и предметов с ровного фона Flow (зелёный, розовый, синий).

    python3 tools/cutout.py <картинки или папка> --out <папка> [--bg green|magenta|blue|auto]
        [--split] [--keep-near 45] [--fill-holes] [--size 640] [--fit 600]
        [--same-scale] [--align bottom|center] [--check]

Режимы:
  без --split   одна фигура на картинку: остаётся самая большая область; куски ближе --keep-near px к ней
                тоже остаются (по умолчанию 45 только на синем фоне — кости пальцев; на зелёном 0 — там «призраки»)
  --split       лист из нескольких фигур (эмоции, позы, предметы): каждая область — отдельный файл,
                порядок слева направо, сверху вниз; мелкий мусор отбрасывается
Размер:
  --size 640 --fit 600   холст 640x640, фигура вписана в 600 px (как наклейки Inkmaxx)
  --same-scale           все фигуры одного запуска в одном масштабе (позы героя не «прыгают»)
  --align bottom         фигуры стоят на одной линии снизу (для поз и спрайтов игры)
--check  сохраняет рядом лист проверки: каждая фигура на тёмном и на светлом фоне с увеличением края

Что учтено из прошлых проектов:
  - зелёный: ключ g - max(r, 0.62*b), так уходят бледные голубые «призраки» и копии контура (Inkmaxx)
  - розовый: прозрачность по отношению каналов, розовый отсвет на белом мехе нейтрализуется (Fat Cat)
  - синий: насыщенность синего (b - min(r,g)) / b, ниже 0,34 пиксель остаётся, выше 0,70 прозрачен;
    бледные кости не съедаются (Chef Rekt); дыры не заливаются без --fill-holes
  - кайма цвета фона на краю снимается (despill)
Нужны Pillow, numpy, scipy (есть в облаке; на компьютере Дениса их нет — запускать в облаке).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

BGS = ('green', 'magenta', 'blue')


def detect_bg(rgb):
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
    r, g, b = np.median(border, axis=0)
    if g > r + 40 and g > b + 40:
        return 'green'
    if r > g + 40 and b > g + 40:
        return 'magenta'
    if b > r + 40 and b > g + 20:
        return 'blue'
    raise SystemExit(f'Не понял цвет фона (медиана края {int(r)},{int(g)},{int(b)}): укажите --bg')


def alpha_and_despill(rgb, bg):
    f = rgb.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    if bg == 'green':
        key = g - np.maximum(r, 0.62 * b)
        a = 1 - np.clip((key - 18) / (70 - 18), 0, 1)
        # зелёный отсвет: зелёный канал не выше большего из двух других (в герое на зелёном фоне зелени нет)
        out = np.stack([r, np.minimum(g, np.maximum(r, b)), b], -1)
    elif bg == 'magenta':
        key = np.minimum(r, b) - g
        ratio = np.minimum(r, b) / (g + 1)
        a = 1 - np.clip((key - 30) / (110 - 30), 0, 1) * np.clip((ratio - 1.4) / (2.6 - 1.4), 0, 1)
        # розовый отсвет: красный и синий выше зелёного; на светлом (белый мех) убираем почти целиком
        excess = np.clip(np.minimum(r, b) - g, 0, None)
        light = np.clip(((r + g + b) / 3 - 90) / 80, 0, 1)
        k = 0.45 + 0.5 * light
        out = np.stack([r - excess * k, g, b - excess * k], -1)
    else:
        sat = (b - np.minimum(r, g)) / (b + 1)
        a = 1 - np.clip((sat - 0.34) / (0.70 - 0.34), 0, 1)
        a = np.where(b >= np.maximum(r, g), a, 1.0)
        spill = np.clip(b - np.maximum(r, g), 0, None)
        out = np.stack([r, g, b - spill * (a < 0.98) * 0.7], -1)
    return np.clip(a, 0, 1), np.clip(out, 0, 255)


def components(a, min_area):
    mask = a > 0.5
    lab, n = ndimage.label(mask)
    if n == 0:
        return lab, []
    areas = ndimage.sum(mask, lab, range(1, n + 1))
    return lab, [(i + 1, int(s)) for i, s in enumerate(areas) if s >= min_area]


def single(a, keep_near, fill_holes):
    lab, comps = components(a, 1)
    if not comps:
        return a
    main = max(comps, key=lambda c: c[1])[0]
    keep = lab == main
    if keep_near:
        near = ndimage.binary_dilation(keep, iterations=keep_near)
        for idx, area in comps:
            if idx != main and area >= 30 and (near & (lab == idx)).any():
                keep |= lab == idx
    if fill_holes:
        keep = ndimage.binary_fill_holes(keep)
    soft = ndimage.binary_dilation(keep, iterations=2)
    return np.where(soft, a, 0) if not fill_holes else np.where(keep, np.maximum(a, keep * 1.0), np.where(soft, a, 0))


def split(a, min_frac=0.004):
    h, w = a.shape
    lab, comps = components(a, int(h * w * min_frac))
    boxes = []
    for idx, _ in comps:
        ys, xs = np.where(lab == idx)
        boxes.append((ys.min(), xs.min(), ys.max(), xs.max(), idx))
    # строки: группируем по вертикали
    boxes.sort(key=lambda b: (b[0] + b[2]) / 2)
    rows, cur = [], []
    for bx in boxes:
        cy = (bx[0] + bx[2]) / 2
        if cur and abs(cy - np.mean([(c[0] + c[2]) / 2 for c in cur])) > h * 0.15:
            rows.append(cur)
            cur = []
        cur.append(bx)
    if cur:
        rows.append(cur)
    order = [bx for row in rows for bx in sorted(row, key=lambda b: b[1])]
    # мелкие куски рядом с фигурой (пальцы, капли) присоединяем к ближайшей
    masks = []
    small_lab, small = components(a, 30)
    for bx in order:
        m = lab == bx[4]
        near = ndimage.binary_dilation(m, iterations=25)
        for idx, area in small:
            part = small_lab == idx
            if area < h * w * min_frac and (near & part).any():
                m |= part
        masks.append(m)
    return masks


def crop_rgba(rgb, a, mask=None):
    alpha = a if mask is None else np.where(ndimage.binary_dilation(mask, iterations=2), a, 0)
    ys, xs = np.where(alpha > 0.02)
    if len(ys) == 0:
        return None
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = np.dstack([rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1] * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def place(figs, size, fit, same_scale, align):
    if not size:
        return figs
    if same_scale:
        biggest = max(max(f.size) for f in figs)
        scales = [fit / biggest] * len(figs)
    else:
        scales = [fit / max(f.size) for f in figs]
    out = []
    for f, s in zip(figs, scales):
        im = f.resize((max(1, round(f.width * s)), max(1, round(f.height * s))), Image.LANCZOS)
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        x = (size - im.width) // 2
        y = (size - (size - fit) // 2 - im.height) if align == 'bottom' else (size - im.height) // 2
        canvas.alpha_composite(im, (x, y))
        out.append(canvas)
    return out


def check_sheet(files, path):
    cell = 300
    sheet = Image.new('RGB', (cell * 3, cell * len(files)), (255, 255, 255))
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGBA')
        t = im.copy()
        t.thumbnail((cell - 20, cell - 20))
        for j, bg in enumerate([(24, 24, 28), (245, 242, 235)]):
            tile = Image.new('RGBA', (cell, cell), bg + (255,))
            tile.alpha_composite(t, ((cell - t.width) // 2, (cell - t.height) // 2))
            sheet.paste(tile.convert('RGB'), (j * cell, i * cell))
        a = np.array(im)[..., 3]
        ys, xs = np.where((a > 10) & (a < 245))
        if len(ys):
            cy, cx = int(np.median(ys)), int(np.median(xs))
            box = (max(0, cx - 40), max(0, cy - 40), cx + 40, cy + 40)
            z = im.crop(box).resize((cell, cell), Image.NEAREST)
            tile = Image.new('RGBA', (cell, cell), (24, 24, 28, 255))
            tile.alpha_composite(z)
            sheet.paste(tile.convert('RGB'), (2 * cell, i * cell))
    sheet.save(path)


def main(argv):
    if not argv or '--out' not in argv:
        print(__doc__)
        return 2

    def opt(name, default=None, cast=str):
        return cast(argv[argv.index(name) + 1]) if name in argv else default

    out = Path(opt('--out'))
    out.mkdir(parents=True, exist_ok=True)
    bg_opt = opt('--bg', 'auto')
    keep_near_opt = opt('--keep-near', None, int)
    size = opt('--size', None, int)
    fit = opt('--fit', int(size * 0.94) if size else None, int)
    align = opt('--align', 'center')
    flags_with_value = {'--out', '--bg', '--keep-near', '--size', '--fit', '--align'}
    inputs = []
    skip = False
    for i, x in enumerate(argv):
        if skip:
            skip = False
            continue
        if x in flags_with_value:
            skip = True
            continue
        if x.startswith('--'):
            continue
        p = Path(x)
        inputs += sorted(q for q in p.iterdir() if q.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')) if p.is_dir() else [p]
    figs, names = [], []
    for src in inputs:
        rgb = np.array(Image.open(src).convert('RGB'))
        bg = detect_bg(rgb) if bg_opt == 'auto' else bg_opt
        a, clean = alpha_and_despill(rgb, bg)
        stem = src.stem.replace('_raw', '')
        if '--split' in argv:
            for k, m in enumerate(split(a), 1):
                fig = crop_rgba(clean, a, m)
                if fig:
                    figs.append(fig)
                    names.append(f'{stem}_{k:02d}.png')
            print(f'{src.name}: фон {bg}, фигур {sum(1 for n in names if n.startswith(stem + "_"))}')
        else:
            keep_near = keep_near_opt if keep_near_opt is not None else (45 if bg == 'blue' else 0)
            a2 = single(a, keep_near, '--fill-holes' in argv)
            fig = crop_rgba(clean, a2)
            if fig:
                figs.append(fig)
                names.append(f'{stem}.png')
            print(f'{src.name}: фон {bg}, {fig.size if fig else "пусто"}')
    figs = place(figs, size, fit, '--same-scale' in argv, align)
    saved = []
    for f, n in zip(figs, names):
        p = out / n
        f.save(p, optimize=True)
        saved.append(p)
    print(f'Сохранено: {len(saved)} в {out}')
    if '--check' in argv and saved:
        check_sheet(saved, out / '_check.png')
        print(f'Лист проверки: {out / "_check.png"}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
