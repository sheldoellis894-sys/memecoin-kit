#!/usr/bin/env python3
"""Сборка архивов для передачи проекта заказчику (как у Ullu и Mr. MA).

    python3 tools/pack_handover.py projects/<имя>/handover.json [--dry] [--images]

Запускать из корня memecoin-kit. Скрипт:
  1. собирает папки архивов по списку из handover.json (пути от корня memecoin-kit, можно ../ и шаблоны *),
  2. проверяет, что в архив не попало лишнее (.env, data/, node_modules, .git, логи, ключи, абсолютные пути,
     имена других проектов, личная почта),
  3. упаковывает каждый архив в handover/<имя>.zip; прошлую версию переносит в handover/_prev/,
  4. печатает, какие файлы добавились, пропали и изменились по сравнению с прошлой версией.
С --dry только проверяет и показывает, что получится, ничего не записывая. С --images печатает размер
каждой картинки в пикселях (нужен Pillow; на компьютере его нет, поэтому полную проверку запускать в облаке).

Формат handover.json (пример: tools/handover.example.json):
{
  "project": "mrma",
  "archives": [
    {
      "name": "mrma-brand-kit",
      "readme": "projects/horsecorp/handover/brand_kit_README.md",
      "folders": {
        "01_brand_book": ["projects/horsecorp/brand/docs/mrma_brandbook.pdf"],
        "02_logo": ["projects/horsecorp/brand/logo/*.png"],
        "07_original_art": [{"src": "projects/horsecorp/brand/banners/mrma_banner.jpg", "as": "banner.jpg"}]
      }
    },
    {
      "name": "mrma-site",
      "readme": "projects/horsecorp/handover/site_README.md",
      "folders": { "site": [{"src": "../horsecorp-repo/horsecorp-site", "tree": true}] }
    }
  ]
}
"tree": true копирует папку целиком (без .git, node_modules, .env, data/ и прочего из списка ниже).
"""
import fnmatch
import glob
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import time
import zipfile
from pathlib import Path

SKIP_DIRS = {'.git', 'node_modules', 'data', '.vercel', '.astro', '_to_delete', '_old', '__pycache__', '.claude_tmp'}
SKIP_FILES = ['.env', '.env.local', '.env.production', '*.log', '.DS_Store', 'Thumbs.db', 'desktop.ini', '*.key', '*seed*', '*.zip', '*.tgz', '*_raw.*']
ALLOW_FILES = ['.env.example']
TEXT_EXT = {'.md', '.txt', '.js', '.mjs', '.cjs', '.ts', '.astro', '.json', '.html', '.css', '.svg', '.yml', '.yaml', '.toml', '.example', '.dockerignore', '.gitignore'}
CODE_EXT = {'.js', '.mjs', '.cjs', '.ts', '.astro', '.css'}
ABS_PATH = re.compile(r'(?<![\w/])([A-Za-z]:\\\\?[A-Za-z]|/home/\w|/Users/\w|/sessions/|/mnt/user-data|/root/)')
EMAIL = re.compile(r'[\w.+-]+@(gmail|yandex|mail|outlook|hotmail|icloud|proton)\.\w+', re.I)
CYR = re.compile(r'[А-Яа-яЁё]')


def skipped(name):
    if name in ALLOW_FILES:
        return False
    return any(fnmatch.fnmatch(name, p) for p in SKIP_FILES)


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def collect(root, folders, problems):
    """Возвращает список (путь в архиве, исходный файл)."""
    out = []
    for folder, items in folders.items():
        for item in items:
            spec = {'src': item} if isinstance(item, str) else dict(item)
            src = spec['src']
            matches = sorted(glob.glob(str(root / src)))
            if not matches:
                problems.append(f'нет исходника: {src}')
                continue
            for m in matches:
                m = Path(m)
                if m.is_dir():
                    if not spec.get('tree'):
                        problems.append(f'{src} — папка: для папки целиком добавьте "tree": true')
                        continue
                    base = Path(folder) / spec.get('as', '') if spec.get('as') else Path(folder)
                    for dp, dn, fn in os.walk(m):
                        dn[:] = sorted(d for d in dn if d not in SKIP_DIRS)
                        for f in sorted(fn):
                            if skipped(f):
                                continue
                            full = Path(dp) / f
                            out.append((str(base / full.relative_to(m)).replace('\\', '/'), full))
                else:
                    if skipped(m.name) and not spec.get('force'):
                        problems.append(f'{src}: такой файл в архив не кладём ({m.name})')
                        continue
                    name = spec.get('as') if (spec.get('as') and len(matches) == 1) else m.name
                    out.append((f'{folder}/{name}', m))
    return out


def audit(files, other_projects, problems, warnings):
    seen = {}
    for arc, src in files:
        if arc in seen:
            problems.append(f'два файла с одним именем в архиве: {arc} ({seen[arc]} и {src})')
        seen[arc] = src
        parts = arc.split('/')
        if any(p in SKIP_DIRS for p in parts):
            problems.append(f'лишняя папка в архиве: {arc}')
        if src.suffix.lower() in TEXT_EXT or src.name in ('Dockerfile', '.env.example'):
            try:
                text = src.read_text(encoding='utf-8', errors='replace')
            except Exception:
                continue
            if ABS_PATH.search(text):
                problems.append(f'абсолютный путь с компьютера внутри файла: {arc}')
            if EMAIL.search(text):
                problems.append(f'личная почта внутри файла: {arc}')
            if src.suffix.lower() in CODE_EXT and CYR.search(text):
                warnings.append(f'кириллица в коде: {arc}')
            if src.suffix.lower() in CODE_EXT | {'.html', '.json'}:
                low = text.lower()
                for name in other_projects:
                    if re.search(r'\b' + re.escape(name) + r'\b', low):
                        warnings.append(f'имя другого проекта «{name}» в файле: {arc}')
                        break


def image_info(files):
    try:
        from PIL import Image
    except ImportError:
        return {}
    info = {}
    for arc, src in files:
        if src.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp'):
            try:
                with Image.open(src) as im:
                    info[arc] = f'{im.width}x{im.height}' + (' прозрачный' if im.mode in ('RGBA', 'LA', 'P') else '')
            except Exception:
                info[arc] = 'НЕ ОТКРЫВАЕТСЯ'
    return info


def diff(prev_zip, files, top):
    if not prev_zip.exists():
        return None
    old = {}
    with zipfile.ZipFile(prev_zip) as z:
        for n in z.namelist():
            if not n.endswith('/'):
                old[n] = hashlib.md5(z.read(n)).hexdigest()
    new = {f'{top}/{arc}': md5(src) for arc, src in files}
    added = sorted(set(new) - set(old))
    removed = sorted(set(old) - set(new))
    changed = sorted(k for k in set(new) & set(old) if new[k] != old[k])
    return added, removed, changed


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    dry = '--dry' in argv
    cfg_path = Path([a for a in argv if not a.startswith('--')][0])
    root = Path.cwd()
    if not (root / 'projects').is_dir():
        print('Запускать из корня memecoin-kit')
        return 2
    cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
    out_dir = root / cfg.get('out', 'handover')
    this = cfg.get('project', '')
    other = [p.name for p in (root / 'projects').iterdir() if p.is_dir() and p.name not in (this, cfg_path.parent.name)]
    other = [o for o in other if len(o) > 3 and o not in ('gurufun',)]
    failed = False
    for arch in cfg['archives']:
        name = arch['name']
        problems, warnings = [], []
        files = collect(root, arch['folders'], problems)
        if arch.get('readme'):
            rp = root / arch['readme']
            if rp.exists():
                files.insert(0, ('README.md', rp))
            else:
                problems.append(f'нет README: {arch["readme"]}')
        audit(files, other, problems, warnings)
        size = sum(src.stat().st_size for _, src in files)
        print(f'\n== {name}.zip: {len(files)} файлов, {size / 1048576:.1f} МБ')
        folders = {}
        for arc, _ in files:
            folders[arc.split('/')[0] if '/' in arc else '.'] = folders.get(arc.split('/')[0] if '/' in arc else '.', 0) + 1
        for k in sorted(folders):
            print(f'   {k}: {folders[k]}')
        info = image_info(files)
        bad_img = [k for k, v in info.items() if v == 'НЕ ОТКРЫВАЕТСЯ']
        for k in bad_img:
            problems.append(f'картинка не открывается: {k}')
        d = diff(out_dir / f'{name}.zip', files, name)
        if d:
            added, removed, changed = d
            print(f'   по сравнению с прошлой версией: добавлено {len(added)}, убрано {len(removed)}, изменено {len(changed)}')
            for title, lst in (('+', added), ('-', removed), ('~', changed)):
                for x in lst[:25]:
                    print(f'     {title} {x}')
                if len(lst) > 25:
                    print(f'     {title} … ещё {len(lst) - 25}')
        for w in warnings:
            print('   внимание: ' + w)
        for p in problems:
            print('   ОШИБКА: ' + p)
        if '--images' in argv:
            for k in sorted(info):
                print(f'   {k}: {info[k]}')
        if problems:
            failed = True
            continue
        if dry:
            continue
        if d and not any(d):
            print('   без изменений: архив не перезаписан')
            continue
        out_dir.mkdir(exist_ok=True)
        target = out_dir / f'{name}.zip'
        tmp = Path(tempfile.mkdtemp()) / f'{name}.zip'
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as z:
            for arc, src in files:
                z.write(src, f'{name}/{arc}')
        with zipfile.ZipFile(tmp) as z:
            bad = z.testzip()
            if bad:
                print(f'   ОШИБКА: архив повреждён на {bad}')
                failed = True
                continue
        if target.exists():
            prev = out_dir / '_prev'
            prev.mkdir(exist_ok=True)
            os.replace(target, prev / f'{name}-{time.strftime("%Y%m%d-%H%M")}.zip')
        shutil.copyfile(tmp, target)
        print(f'   записан {target.relative_to(root)} ({target.stat().st_size / 1048576:.1f} МБ)')
    print('\nЕсть ошибки: архивы с ошибками не записаны' if failed else '\nГотово')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
