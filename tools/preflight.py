#!/usr/bin/env python3
"""Одна проверка перед сдачей проекта.

    python3 tools/preflight.py projects/<папка> [--prefix <префикс>] [--site <папка сборки>] [--code <папка кода>]

Запускать из корня memecoin-kit. По очереди:
  1. тексты сайта (brand/docs/*_site_texts.md) — check_texts.py --mode site
  2. ТЗ и тексты для команды, если есть (brand/docs/*_tz*.md, *_pitch*.md) — --mode tz / --mode team
  3. экспорт Figma — check_exports.py
  4. README проекта: каждая ссылка на файл ведёт на существующий файл (с учётом регистра букв)
  5. снимки для кейса в case/: есть ли обязательные, нет ли русских имён и пробелов
  6. файл состояния state.md и учёт времени: есть ли, заполнен ли итог
  7. секреты: ключи API, приватные ключи, токены в папке проекта, в коде (--code) и в собранном сайте (--site)
  8. SEO собранного сайта (--site): title, description, canonical, og:title, og:image, robots.txt, sitemap.xml
В конце — один список: что исправить и что ещё не сделано. Проверку сайта на 13 экранах (check-devices.mjs)
запускает ассистент в облаке отдельно: на компьютере для неё нет браузера.
"""
import re
import subprocess
from html.parser import HTMLParser
import sys
from pathlib import Path

CASE_REQUIRED = ['01_site_hero', '05_x_profile', '06_tg_portal', '07_figma_brandkit']
CASE_OPTIONAL = ['02_site_', '03_site_', '04_site_mobile']


SECRET_PATTERNS = [
    ('ключ OpenAI или Anthropic', re.compile(r'sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}')),
    ('ключ AWS', re.compile(r'AKIA[0-9A-Z]{16}')),
    ('приватный ключ', re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----')),
    ('ключ Helius в адресе', re.compile(r'api-key=[0-9a-f]{8}-[0-9a-f]{4}-')),
    ('токен GitHub', re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}')),
    ('токен Slack', re.compile(r'xox[abpr]-[A-Za-z0-9-]{10,}')),
    ('токен Vercel Blob', re.compile(r'vercel_blob_rw_[A-Za-z0-9_]{16,}')),
    ('токен Upstash', re.compile(r'AX[A-Za-z0-9]{30,}=')),
    # пароль: имя поля целиком (не часть имени атрибута вроде data-ul-secret="…" в HTML)
    ('пароль в коде', re.compile(r'(?i)(?<![\w-])(?:password|passwd|secret)\s*[:=]\s*["\'](?![a-z_]+:)(?!process\.env)[^"\'\s]{8,}["\']')),
    ('сид-фраза или приватный ключ кошелька', re.compile(r'(?i)(?:mnemonic|seed[_ ]?phrase|private[_ ]?key)\s*[:=]\s*["\'][^"\']{20,}["\']')),
]
TEXT_EXT = {'.js', '.mjs', '.cjs', '.ts', '.astro', '.json', '.html', '.md', '.txt', '.css', '.env', '.yml', '.yaml', '.toml', '.example'}
SKIP_DIRS = {'node_modules', '.git', '_to_delete', '.astro', '.vercel'}


def scan_secrets(root, label):
    found = []
    for p in Path(root).rglob('*'):
        if any(part in SKIP_DIRS for part in p.parts) or not p.is_file():
            continue
        if p.suffix.lower() not in TEXT_EXT and p.name not in ('.env', 'Dockerfile'):
            continue
        if p.stat().st_size > 3_000_000:
            continue
        try:
            text = p.read_text(encoding='utf-8', errors='replace')
        except Exception:
            continue
        is_test = 'test' in p.name.lower() or 'tests' in p.parts or 'fixtures' in p.parts
        for kind, rx in SECRET_PATTERNS:
            if is_test and kind in ('пароль в коде', 'сид-фраза или приватный ключ кошелька'):
                continue   # пароли в тестах — заготовки, не настоящие
            # хэши целостности пакетов ("integrity": "sha512-…" в package-lock.json) похожи на токены: их строки пропускаются
            m = next((x for x in rx.finditer(text) if not re.search(r'sha(256|384|512)-', text[text.rfind('\n', 0, x.start()) + 1:text.find('\n', x.end()) if text.find('\n', x.end()) != -1 else len(text)])), None)
            if m:
                line = text[:m.start()].count('\n') + 1
                found.append(f'{label}: {kind} в {p}:{line} (значение не показывается)')
    if (Path(root) / '.env').exists():
        found.append(f'{label}: файл .env лежит в папке — проверить, что он в .gitignore и не попадает в архивы')
    return found


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title, self.in_title, self.meta, self.links = '', False, {}, {}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            key = (a.get('name') or a.get('property') or '').lower()
            if key:
                self.meta[key] = a.get('content') or ''
        elif tag == 'link' and a.get('rel'):
            self.links[a['rel'].lower()] = a.get('href') or ''

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def check_seo(site):
    site = Path(site)
    out, ok = [], []
    index = site / 'index.html'
    if not index.exists():
        return [f'SEO: нет {index}'], ok
    h = Head()
    h.feed(index.read_text(encoding='utf-8', errors='replace'))
    t = h.title.strip()
    if not t:
        out.append('SEO: нет заголовка страницы (title)')
    elif not 10 <= len(t) <= 70:
        out.append(f'SEO: заголовок {len(t)} знаков, лучше 10–70: «{t[:80]}»')
    else:
        ok.append(f'SEO: заголовок «{t}»')
    d = h.meta.get('description', '').strip()
    if not d:
        out.append('SEO: нет описания (meta description)')
    elif not 50 <= len(d) <= 170:
        out.append(f'SEO: описание {len(d)} знаков, лучше 50–170')
    canon = h.links.get('canonical', '')
    if not canon:
        out.append('SEO: нет canonical (link rel="canonical" с полным адресом сайта)')
    elif not canon.startswith('https://'):
        out.append(f'SEO: canonical не полный адрес: {canon}')
    for k in ('og:title', 'og:description', 'og:image'):
        if not h.meta.get(k):
            out.append(f'SEO: нет {k} (превью ссылки в X и Telegram)')
    img = h.meta.get('og:image', '')
    if img and not img.startswith('https://'):
        out.append(f'SEO: og:image не полный адрес ({img}) — X и Telegram его не покажут')
    if not (site / 'robots.txt').exists():
        out.append('SEO: нет robots.txt')
    if not (site / 'sitemap.xml').exists() and not (site / 'sitemap-index.xml').exists():
        out.append('SEO: нет sitemap.xml')
    return out, ok


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

    # 7. секреты
    leaks = scan_secrets(proj, 'проект')
    if '--code' in argv:
        leaks += scan_secrets(argv[argv.index('--code') + 1], 'код')
    if '--site' in argv:
        leaks += scan_secrets(argv[argv.index('--site') + 1], 'сборка')
    if leaks:
        todo += ['СЕКРЕТ ' + x for x in leaks]
    else:
        done.append('Секреты: в проверенных папках ключей и паролей не найдено')

    # 8. SEO
    if '--site' in argv:
        seo_todo, seo_ok = check_seo(argv[argv.index('--site') + 1])
        todo += seo_todo
        done += seo_ok

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
