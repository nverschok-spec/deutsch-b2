# Deutsch B2 — PWA для подготовки к Umschulung

Тренажёр немецкого B1→B2: стилизация предложений, голосовые диалоги,
разбор грамматики, карточки со SRS и утренний брифинг. Стек: React 18 +
Vite + Tailwind, Zustand (persist в LocalStorage), serverless-прокси к
Anthropic API на Vercel, Web Speech API для голоса.

## Быстрый старт

```bash
npm install
cp .env.example .env       # впиши свой ANTHROPIC_API_KEY
npm run dev                # фронтенд на :5173
# для локальной работы api/* нужен Vercel CLI:
npx vercel dev              # поднимет /api/* на :3000, vite проксирует на него
```

Продакшн: `vercel deploy` (или подключить репозиторий к Vercel — `api/`
задеплоится как serverless functions автоматически).

## Структура проекта

```
src/
  components/
    common/                 UI-примитивы: Card, Button, BottomNav, Spinner
    B2SentenceUpgrader/     Модуль 1 — стилизация A2/B1 → B2
    UmschulungSimulator/    Модуль 2 — голосовой диалоговый тренажёр
    SmartGrammarLab/        Модуль 3 — разбор Satzklammer/Rektion/падежей
    VocabTrainer/           Модуль 4 — карточки слов + SRS
    DailyB2Briefing/        Модуль 5 — утренний обзор
  store/
    useGermanStore.js       Корневой стор (слайсы + persist)
    slices/                 Vocab / Progress / Settings / Briefing
  api/
    claude.js                Клиентская обёртка над /api/claude
  hooks/
    useSpeechRecognition.js  Обёртка над Web Speech API (SpeechRecognition)
  utils/
    tts.js                   Озвучка ответов (SpeechSynthesis)
  data/                       (пусто) — сюда позже статические списки/словари
api/
  claude.js                  Vercel serverless — единственное место с ANTHROPIC_API_KEY
```

## Как это связано: поток данных для одного запроса к ИИ

1. Компонент модуля вызывает `askClaude(task, payload)` из `src/api/claude.js`.
2. Запрос улетает на `/api/claude` (тот же домен — в проде Vercel Function,
   в деве проксируется на `vercel dev`).
3. `api/claude.js` смотрит на `task`, берёт нужный system-prompt из `PROMPTS`,
   зовёт Anthropic (`claude-haiku-4-5`), парсит JSON-ответ и отдаёт клиенту.
4. Компонент кладёт результат в локальный `useState` и/или пишет в
   `useGermanStore` (например, `progress.addXp`, `vocab.addCard`).

Ключ Anthropic никогда не попадает на фронт — это принципиально для
serverless-прокси-архитектуры.

## Стор (Zustand) — как расширять

Каждая новая область состояния — это новый файл в `src/store/slices/`
по образцу существующих (экспортирует `createXSlice(set, get) => ({ x: {...} })`),
который потом подключается в `useGermanStore.js`. Если слайсу нужно
что-то персистить — не забыть добавить это в `partialize`.

## PWA / офлайн

`vite-plugin-pwa` генерирует service worker с precache app shell (JS/CSS/HTML).
`/api/*` намеренно исключён из runtime-кэша (`NetworkOnly`) — офлайн-ответы
от ИИ не имеют смысла, зато `briefing`-слайс кэширует последний ответ на
день в LocalStorage, так что утренний обзор виден офлайн после первой
загрузки за день. Перед первым деплоем нужно положить реальные иконки в
`public/icons/` (см. `public/icons/README.md`).

## Что дальше (не сделано в этом каркасе)

- Реальная визуализация Satzklammer в `SmartGrammarLab` (сейчас голый JSON).
- Полноценный quiz-компонент в `DailyB2Briefing` (сейчас только первый вопрос).
- Экран настроек (сейчас `settings` есть в сторе, но нет UI, кроме выбора
  сценария диалога прямо в `UmschulungSimulator`).
- Обработка `offline`-состояния в UI (сейчас просто упадёт в `status: 'error'`
  при отсутствии сети — нужен явный офлайн-баннер).
- Реальные иконки/скриншоты для `manifest.json`.
- Тесты (пока нет ни одного).
