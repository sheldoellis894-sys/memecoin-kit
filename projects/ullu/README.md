# Ullu ($ULLU)

Персонаж 06 серии GuruFun и первый сайт-витрина серии. Сова несёт удачу туда, где ярче свет.

- Персонаж и лор: `projects/gurufun/characters/06_ullu/ullu.md`
- Бриф (черновик): `brand/docs/ullu_brief.md`
- Тексты сайта RU/EN: `brand/docs/ullu_site_texts.md`
- Промты Flow для картинок сайта: `brand/docs/ullu_flow_prompts.md`
- Журнал: `brand/docs/ullu_timelog.md`
- Конфиг сайта: `project.config.json` — тема `diya`, макет `lights`

Запуск локально (из `templates/landing`):

```
set PROJECT=ullu&& npm run dev
```

Проверка улицы (сервер): `node tests/street.test.mjs`.

Картинки сейчас — заглушки с надписью PLACEHOLDER. Они заменяются файлами с теми же именами (список в промтах Flow).

Папки `case/` и `launch/` — для кейса и пакета запуска, пока пустые.
