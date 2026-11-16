#!/usr/bin/env python3
"""Одна проверка перед сдачей проекта.

    python3 tools/preflight.py projects/<папка> [--prefix <префикс>]

Запускать из корня memecoin-kit. По очереди:
  1. тексты сайта (brand/docs/*_site_texts.md) — check_texts.py --mode site
  2. ТЗ и тексты для команды, если есть (brand/docs/*_tz*.md, *_pitch*.md) — --mode tz / --mode team
  3. экспорт Figma — check_exports.py
  4. README проекта: каждая ссылка на файл ведёт на существующий файл (с учётом регистра букв)
  5. снимки для кейса в case/: есть ли обязательные, нет ли русских имён и пробелов
  6. файл состояния state.md и учёт времени: есть ли, заполнен ли итог
В конце — один список: что исправить и что ещё не сделано. Проверку сайта на 13 экранах (check-devices.mjs)
запускает ассистент в облаке отдельно: на компьютере для неё нет браузера.
"""
import re
import subprocess
import sys
from pathlib import Path

CASE_REQUIRED = ['01_site_hero', '05_x_profile', '06_tg_portal', '07_figma_brandkit']
CASE_OPTIONAL = ['02_site_', '03_site_', '04_site_mobile']


def run(cmd):
    p = subprocess.run([sys.executable] + cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return p.returncode, (p.stdout + p.stderr).strip()


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    if not args:
        print(__doc__)
        return 2
    proj = Path(args[0])
    if not proj.is_dir():
        print(f'Нет папки {proj}')
        return 2
    tools = Path(__file__).resolve().parent
    docs = proj / 'brand' / 'docs'
    todo, done = [], []

    # 1-2. тексты
    for pattern, mode in (('*_site_texts.md', 'site'), ('*_tz*.md', 'tz'), ('*_pitch*.md', 'team')):
        for f in sorted(docs.glob(pattern)):
            code, out = run([str(tools / 'check_texts.py'), str(f), '--mode', mode])
            last = out.splitlines()[-1] if out else ''
            (todo if code else done).append(f'Тексты {f.name} ({mode}): {last}')
            if code:
                todo += ['    ' + l for l in out.splitlines()[:-1] if l.startswith(str(f))][:10]
    if not list(docs.glob('*_site_texts.md')):
        todo.append(f'Нет файла текстов сайта в {docs}')

    # 3. экспорт Figma
    if (proj / 'brand' / 'exports').is_dir():
        extra = ['--prefix', argv[argv.index('--prefix') + 1]] if '--prefix' in argv else []
        code, out = run([str(tools / 'check_exports.py'), str(proj)] + extra)
        (todo if code else done).append('Экспорт Figma: ' + (out.splitlines()[-1] if out else ''))
        if code:
            todo += ['    ' + l.strip() for l in out.splitlines() if 'ОШИБКА' in l]
    else:
        todo.append('Нет папки brand/exports')

    # 4. ссылки в README
    readme = proj / 'README.md'
    if readme.exists():
        text = readme.read_text(encoding='utf-8', errors='replace')
        bad = []
        for m in re.finditer(r'\]\(([^)#\s]+)\)|src="([^"]+)"', text):
            link = m.group(1) or m.group(2)
            if re.match(r'^(https?:|mailto:|data:)', link):
                continue
            target = (proj / link).resolve()
            parent = target.parent
            if not parent.is_dir() or target.name not in {p.name for p in parent.iterdir()}:
                bad.append(link)
        if bad:
            todo.append('README: ссылки на несуществующие файлы (или не тот регистр букв): ' + ', '.join(bad[:10]))
        else:
            done.append('README: все ссылки на файлы ведут на существующие файлы')
    else:
        todo.append('Нет README.md проекта (кейс)')

    # 5. снимки для кейса
    case = proj / 'case'
    names = [p.name for p in case.iterdir()] if case.is_dir() else []
    for req in CASE_REQUIRED:
        if not any(n.startswith(req) for n in names):
            todo.append(f'Кейс: нет снимка {req}.png')
    for opt in CASE_OPTIONAL:
        if not any(n.startswith(opt) for n in names):
            todo.append(f'Кейс: нет снимка {opt}… (если владелец отказался — записать решение в учёт времени)')
    for n in names:
        if re.search(r'[А-Яа-яЁё ]', n):
            todo.append(f'Кейс: имя снимка с кириллицей или пробелом: {n} — переименовать до коммита')

    # 6. состояние и учёт времени
    if not (proj / 'state.md').exists():
        todo.append('Нет state.md (файл состояния проекта)')
    tl = list(docs.glob('*_timelog.md'))
    if not tl:
        todo.append('Нет учёта времени (*_timelog.md)')
    else:
        t = tl[0].read_text(encoding='utf-8', errors='replace')
        if re.search(r'^Итого:\s*$', t, re.M):
            todo.append(f'Учёт времени: не заполнен итог в {tl[0].name}')

    print(f'Проверка перед сдачей: {proj}\n')
    for d in done:
        print('  ок   ' + d)
    for t in todo:
        print('  надо ' + t if not t.startswith('    ') else t)
    print('\nОсталось: проверка сайта на 13 экранах (check-devices.mjs, в облаке) и iPhone владельца')
    print(f'\nИтого замечаний: {sum(1 for t in todo if not t.startswith("    "))}')
    return 1 if todo else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
