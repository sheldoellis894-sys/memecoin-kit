#!/usr/bin/env python3
"""Проверка текстов по правилам Дениса перед отправкой.

    python3 tools/check_texts.py <файл или папка> [...] [--mode site|tz|team|any]

Режимы:
  site  тексты сайта (русский и английский): без точки в конце абзаца, без сленга
  tz    ТЗ для команды: как site, плюс короткое тире "-" вместо длинного, заголовок раздела один раз
  team  тексты от имени Дениса (описания идей, сообщения команде): без точки в конце не требуется,
        проверяются слова, смешение языков, обороты ИИ
  any   только общие проверки (по умолчанию)

Код выхода 1, если что-то найдено. Блоки кода ``` и строки с адресами не проверяются.
"""
import re
import sys
from pathlib import Path

BANNED = [
    (r'\bкрив(ая|ой|ую|ые|ых|ым|ыми)\b', 'слово «кривая»: Денис его не принимает, писать по смыслу («цена растёт с каждой покупкой»)'),
    (r'\bшортер\w*', '«шортер» — такого слова нет, писать «шортист»'),
    (r'\banons?\b|\bанон(ы|ов|ам|ами|чик\w*)?\b', '«anon / анон» — сленг, на сайте и в текстах не использовать'),
    (r'\bfrens?\b|\bфрен\w*', '«fren» — сленг'),
    (r'\bwagmi\b|\bngmi\b|\bgm\b', 'сленг криптотвиттера'),
]
# Обороты, по которым текст узнают как написанный ИИ
SLOP = [
    r'важно отметить', r'стоит отметить', r'следует отметить', r'давайте', r'в заключение', r'погрузимся',
    r'не просто [^,.]{1,40}, а ', r'в мире (крипт|блокчейн|мем)', r'уникальн\w+ возможност', r'революци\w+',
    r'\bdelve', r'\bunleash', r'game[- ]changer', r'\bseamless', r'\brevolutioni[sz]e', r'\belevate\b',
    r'in the world of', r'\bstands as\b', r'\btapestry\b', r'\bembark\b', r'it\'?s not just', r'whether you\'?re',
    r'\bnext[- ]level\b', r'\bcutting[- ]edge\b', r'\bto the moon\b',
]
CYR = re.compile(r'[А-Яа-яЁё]')
LAT_WORD = re.compile(r'(?<![\w$@/.#`-])([a-z]{3,})(?![\w/@`-]|\.\w)')
SKIP_LINE = re.compile(r'https?://|www\.|^\s*\|?\s*[-:| ]+\|?\s*$')


def strip_inline(s):
    s = re.sub(r'`[^`]*`', 'X', s)
    s = re.sub(r'«[^«»А-Яа-яЁё]*»', 'X', s)
    s = re.sub(r'"[^"А-Яа-яЁё]*"', 'X', s)
    s = re.sub(r'https?://\S+', 'X', s)
    s = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', s)
    return s


def check(path, mode):
    out = []
    text = path.read_text(encoding='utf-8', errors='replace')
    lines = text.split('\n')
    in_code = False
    headings = {}
    for i, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if line.lstrip().startswith('```'):
            in_code = not in_code
            continue
        if in_code or not line.strip():
            continue
        body = strip_inline(line)
        low = body.lower()

        for pat, why in BANNED:
            if re.search(pat, low):
                out.append((i, 'слово', why, line))
        for pat in SLOP:
            if re.search(pat, low):
                out.append((i, 'оборот ИИ', f'шаблонный оборот ({pat.strip(chr(92) + "b")})', line))

        if mode in ('site', 'tz', 'team') and CYR.search(body):
            stray = [w for w in LAT_WORD.findall(body) if w not in ('pump', 'fun', 'and', 'the')]
            if stray:
                out.append((i, 'языки', 'английские слова в русском тексте: ' + ', '.join(sorted(set(stray))[:6]), line))

        is_heading = line.lstrip().startswith('#')
        if is_heading:
            key = re.sub(r'^#+\s*', '', line).strip().lower()
            if key in headings:
                out.append((i, 'заголовок', f'заголовок повторяется (уже был в строке {headings[key]})', line))
            else:
                headings[key] = i

        if mode in ('site', 'tz') and not is_heading and not SKIP_LINE.search(line):
            nxt = lines[i].strip() if i < len(lines) else ''
            para_end = not nxt or nxt.startswith(('#', '-', '*', '|', '```')) or re.match(r'^\d+[.)] ', nxt)
            if re.search(r'(?<!\.)\.\s*$', line) and (para_end or line.lstrip().startswith(('-', '*')) or re.match(r'^\s*\d+[.)] ', line)):
                out.append((i, 'точка', 'точка в конце абзаца или пункта', line))

        if mode == 'tz' and '—' in body:
            out.append((i, 'тире', 'длинное тире «—»: в ТЗ писать короткое «-»', line))

        if re.search(r'\S {2,}\S', body):
            out.append((i, 'пробелы', 'двойной пробел', line))
        if re.search(r'\s[,.;:!?](\s|$)', body):
            out.append((i, 'пробелы', 'пробел перед знаком препинания', line))
        if re.search(r'\b(\w{3,})\s+\1\b', low):
            out.append((i, 'повтор', 'слово повторено два раза подряд', line))
    return out


def main(argv):
    mode = 'any'
    paths = []
    it = iter(argv)
    for a in it:
        if a == '--mode':
            mode = next(it, 'any')
        elif a.startswith('--mode='):
            mode = a.split('=', 1)[1]
        else:
            paths.append(Path(a))
    if mode not in ('site', 'tz', 'team', 'any') or not paths:
        print(__doc__)
        return 2
    files = []
    for p in paths:
        if p.is_dir():
            files += sorted(x for x in p.rglob('*') if x.suffix.lower() in ('.md', '.txt'))
        elif p.exists():
            files.append(p)
        else:
            print(f'нет файла: {p}')
            return 2
    total = 0
    for f in files:
        found = check(f, mode)
        for ln, kind, why, line in found:
            print(f'{f}:{ln}: [{kind}] {why}\n    {line.strip()[:160]}')
        total += len(found)
    print(f'\nПроверено файлов: {len(files)}, замечаний: {total}')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
