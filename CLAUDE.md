## Workflow Reminders
- Mark the task as done after finishing it, in @prd.md

## Translations (i18n)

The marketing pages (homepage, `/for/*`, `/vs/*`, `/best/*`) are localized into es, zh, ja, de, hi, nl, fr via next-intl. Blog and `/tools/*` are English-only.

- English is the single source of truth: UI copy lives in `messages/en.json`, page data in `lib/personas.ts`, `lib/comparisons.ts`, `lib/listicles.ts`. Never edit translated copy into `messages/{locale}.json` or `lib/i18n/data/` by hand as part of a copy change — edit the English source instead.
- After editing/adding any English string, run `pnpm translate` (needs `OPENAI_API_KEY`, read from `.env.local`) and commit the changed `messages/*.json`, `lib/i18n/data/**` and `scripts/i18n-lock.json`. The lockfile diffing means only new/changed strings are translated.
- Human fixes to a bad translation ARE done by editing the locale file directly; they persist because the lockfile already marks that string done.
- Never translate: slugs/URLs, brand names, and bare "Yes"/"No" comparison-table cells (they render as icons via `renderCell`).
- New marketing copy in components must go through `useTranslations`/`getTranslations` message keys, not hardcoded JSX; new data fields must be plain strings so the script can translate them.
- Adding a locale: add it in `i18n/routing.ts`, `scripts/translate.ts` (`TARGET_LOCALES` + `LANGUAGE_NAMES`), `lib/i18n/locale-names.ts`, `lib/i18n/data.ts` (imports + overlay map), create empty `lib/i18n/data/{locale}/{personas,comparisons,listicles}.json` files (`{}`), then run `pnpm translate --locale <code>`.