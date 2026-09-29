# AUDIT.md — аудит проекта mini-figma

Дата аудита: 2026-09-30
Ветка правок: `refactor/canvas-inputs-and-data` (создана от `main`)
Объём: React 19 + TypeScript + Vite 8 + Tailwind 4, линтер oxlint, деплой в GitHub Pages.

## Как проверялось

- Прочитан весь код: `src/**`, `index.html`, `public/**`, `.github/workflows/deploy.yml`, все конфиги.
- `npm run lint` (oxlint) — 0 ошибок, 0 предупреждений (базовая линия зафиксирована).
- `npm run build` (`tsc -b && vite build`) — проходит.
- Прогон `tsc --strict` по обоим tsconfig — проходит, значит strict можно включить безопасно.
- Поиск секретов: `git log -p --all` + скан по файлам проекта (паттерны `api_key`, `secret`, `token`,
  `password`, `ghp_`, `sk-`, `BEGIN PRIVATE KEY`) — **секретов в коде и в истории нет**. Единственное
  совпадение — `id-token: write` в workflow, это штатная permission GitHub Pages, не секрет.
- Ручная проверка поведения в браузере (headless Edge, сборка `dist`): консоль чистая, ошибок нет.

## Сводка

| № | Проблема | Файл:строка | Серьёзность | Что делать |
|---|---|---|---|---|
| 1 | `Delete`/`Backspace` удаляют выбранную фигуру, когда пользователь печатает в поле в панели свойств. `preventDefault` глобален — очистить поле клавишей Backspace невозможно, работа удаляет фигуру. Потеря данных. | `src/hooks/useHotkeys.ts:19-22` | **P0** | Игнорировать события, когда фокус в поле ввода/редактируемом элементе |
| 2 | `Ctrl/Cmd + буква` перехватывается как переключение инструмента + `preventDefault`: ломаются `Ctrl+R` (перезагрузка), `Ctrl+V` (вставка), `Ctrl+O` (открыть). | `src/hooks/useHotkeys.ts:13-18` | **P0** | Не реагировать при `ctrlKey`/`metaKey`/`altKey` |
| 3 | При активном инструменте рисования клик по существующей фигуре не создаёт новую, а выделяет и двигает её (`stopPropagation` гасит `handleMouseDown` контейнера). Нельзя нарисовать фигуру поверх/перекрывающую другую. | `src/components/Shape.tsx:16-20`, `src/components/Canvas.tsx:115-130` | **P0** | При `tool !== 'select'` не глушить событие фигуры и не начинать перетаскивание |
| 4 | При зажатом Space перетаскивание фигуры двигает её вместо панорамирования: `Shape.onMouseDown` не смотрит на `spaceHeld`, одновременно работают и панорама, и перенос. | `src/components/Shape.tsx:16-20`, `src/components/Canvas.tsx:132-143` | **P0** | Не начинать перенос фигуры при `spaceHeld`, курсор `cursor-grab` вместо `cursor-move` |
| 5 | Все фигуры живут только в памяти: перезагрузка страницы/закрытие вкладки — работа потеряна. | `src/hooks/useShapes.ts:6` | **P1** | Сохранять и восстанавливать фигуры в `localStorage` с валидацией данных |
| 6 | Числовые поля без валидации: `Number('')` → `0` (нельзя очистить поле), `min={0}` на `strokeWidth` легко обойти — отрицательные `width`/`height`/`strokeWidth` ломают геометрию фигуры. `Math.round` в `value` мешает вводу дробей. | `src/components/PropertiesPanel.tsx:20-27`, `:100-108` | **P1** | Отбрасывать `NaN`, клампить отрицательные значения, убрать принудительный `round` при вводе |
| 7 | `id` фигуры генерируется дважды: в `Canvas` и в `useShapes.addShape`, где id из `Canvas` перезатирается. Тип пропаса объявлен как `(draft: ShapeDraft) => void`, а передаётся объект с `id`. Мёртвый код + риск рассинхрона. | `src/components/Canvas.tsx:120-125`, `src/hooks/useShapes.ts:14-19` | **P1** | Генерировать id в одном месте, тип `onAddShape` — `ShapeDraft` |
| 8 | При отпускании кнопки мыши вне окна браузера `mouseup` не приходит: остаётся «залипший» drag/рисуемый черновик, который нельзя завершить. | `src/components/Canvas.tsx:93-113` | **P1** | Сбрасывать drag-состояние по `window.blur` |
| 9 | В `tsconfig.app.json` и `tsconfig.node.json` нет `strict: true` — часть типовых ошибок не отлавливается. | `tsconfig.app.json:19-23`, `tsconfig.node.json:18-20` | **P1** | Включить `strict: true` (проверено: код проходит) |
| 10 | Нет скрипта `typecheck` — обязательную проверку типов из AGENTS.md нечем запустить отдельно. | `package.json:6-11` | **P1** | Добавить `typecheck` и скрипт `check` (lint + typecheck) |
| 11 | `.env` не в `.gitignore`, нет `.env.example` — риск случайно закоммитить секрет (требование AGENTS.md). | `.gitignore:10-12` | **P1** | Добавить `.env`, `.env.*` кроме `.env.example`, создать `.env.example` с заглушками |
| 12 | `README.md` — шаблон Vite (текст про React Compiler, oxlint), не описывает проект, команды, деплой. | `README.md:1-32` | **P1** | Переписать под mini-figma: стек, запуск, горячие клавиши, скрипты, деплой |
| 13 | `public/icons.svg` (5 КБ, иконки соцсетей из шаблона Vite) не используется нигде — мусорный файл в сборке. | `public/icons.svg` | **P2** | Удалить |
| 14 | Мёртвый код: `canvasToScreen`, `panRef`, `ToolDefinition.shapeType`, неиспользуемый в публичном API `center`. | `src/utils/geometry.ts:17`, `src/components/Canvas.tsx:44,51`, `src/constants/tools.ts:11,17-19`, `src/hooks/useViewport.ts:120` | **P2** | Удалить |
| 15 | Двойной вызов `onSelect` при клике по фигуре (`Shape` вызывает `onSelect`, затем `handleMoveStart` вызывает его же). | `src/components/Shape.tsx:18-19`, `src/components/Canvas.tsx:135` | **P2** | Оставить один вызов |
| 16 | Доступность: клик по слою сделан на `<li onClick>` (не работает с клавиатуры, нет роли), у кнопок нет `aria-label`, у инструментов нет `aria-pressed`, у полей нет `id`/`aria-label`. | `src/components/LayersPanel.tsx:23-29,33-43`, `src/components/Toolbar.tsx:16-29`, `src/components/PropertiesPanel.tsx:18-27,40-49,98-108` | **P2** | Сделать слой кнопкой, добавить `aria-label`/`aria-pressed`, связать `label` и `input` |
| 17 | Нумерация слоёв скачет при удалении среднего слоя (`#{shapes.length - index}`) и совпадает по смыслу с z-порядком. | `src/components/LayersPanel.tsx:31` | **P2** | Считать позицию один раз (по реальному индексу в массиве) |
| 18 | `document.getElementById('root')!` — non-null assertion, при изменении разметки будет падать в рантайме. | `src/main.tsx:6` | **P2** | Проверка на `null` с понятной ошибкой |
| 19 | `index.html`: нет `description`, нет `noscript`, `lang="en"` при русскоязычных комментариях в репозитории; `favicon.svg` — логотип Vite/Oxc, не соответствует проекту. | `index.html:2-8`, `public/favicon.svg` | **P2** | Добавить meta-теги, заменить фавикон на простую иконку приложения |
| 20 | CI собирает без `lint`/проверки типов отдельным шагом; actions не закреплены. | `.github/workflows/deploy.yml:32-36` | **P2** | Добавить шаг `npm run check` перед сборкой |

## Что НЕ является проблемой (проверено, оставлено как есть)

- Секретов в коде и в истории git нет.
- `Shape.tsx` использует `rounded-full` для эллипса — корректно; `box-sizing: border-box` приходит из Tailwind preflight, поэтому `width` включает обводку.
- `dist/` в `.gitignore`, в репозитории не отслеживается — правильно.
- Порядок отрисовки: массив фигур → черновик, черновик поверх — правильно.
- `screenToCanvas`/`zoomAt`/`clampZoom` согласованы между собой, зум к курсору математически корректен.

## План правок (P0 → P1 → P2)

1. **P0** `useHotkeys`: не перехватывать ввод в полях и сочетания с Ctrl/Cmd/Alt.
2. **P0** `Canvas`/`Shape`: рисование поверх фигур, Space больше не двигает фигуры, один вызов `onSelect`.
3. **P1** `useShapes`: сохранение в `localStorage` + валидация при чтении; id генерируется в одном месте.
4. **P1** `PropertiesPanel`: валидация числовых полей, без принудительного округления.
5. **P1** `Canvas`: сброс drag-состояния по `blur`.
6. **P1** `tsconfig`: `strict: true`; `package.json`: `typecheck` + `check`.
7. **P1** `.gitignore` + `.env.example`.
8. **P1** `README.md` под проект.
9. **P2** Удаление мусора и мёртвого кода, a11y, `main.tsx`, `index.html`, фавикон, шаг `check` в CI.
