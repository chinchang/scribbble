/**
 * GPT-powered translation pipeline for the marketing site.
 *
 * Usage:
 *   OPENAI_API_KEY=... pnpm translate [--locale es] [--force] [--dry-run]
 *
 * Sources of English strings:
 *   - messages/en.json                     -> messages/{locale}.json
 *   - lib/{personas,comparisons,listicles}.ts -> lib/i18n/data/{locale}/*.json
 *
 * Only missing or changed strings are sent to the API. State lives in
 * scripts/i18n-lock.json: { [id]: { hash, done: [locales...] } }. Editing an
 * English source string changes its hash, which re-queues it for every locale.
 * All outputs are committed to the repo; builds never call the API.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { personas } from "../lib/personas";
import { comparisons } from "../lib/comparisons";
import { listicles } from "../lib/listicles";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK_PATH = resolve(ROOT, "scripts/i18n-lock.json");

// Pick up OPENAI_API_KEY (and optional OPENAI_MODEL) from .env.local / .env
// so the key doesn't have to be passed inline. Inline env vars still win.
for (const envFile of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(resolve(ROOT, envFile));
  } catch {
    // file doesn't exist — fine
  }
}

const TARGET_LOCALES = ["es", "zh", "ja", "de", "hi", "nl", "fr"] as const;
const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  zh: "Simplified Chinese",
  ja: "Japanese",
  de: "German",
  hi: "Hindi",
  nl: "Dutch",
  fr: "French",
};

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";
const API_URL =
  process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1/chat/completions";
const CHUNK_MAX_ITEMS = 40;
const CHUNK_MAX_CHARS = 6000;
const CONCURRENCY = 4;

const BRAND_NAMES = [
  "Scribbble",
  "ZoomIt",
  "Epic Pen",
  "Presentify",
  "CleanShot X",
  "Annotate",
  "Loom",
  "OBS",
  "Zoom",
  "Google Meet",
  "QuickTime",
  "Figma",
  "macOS",
  "Mac",
  "Apple Silicon",
  "Sysinternals",
  "Microsoft",
  "Windows",
  "Linux",
  "Spotlight",
];

// ---------------------------------------------------------------------------
// Extraction

// Keys that must never be translated (identifiers, brand fields).
const SKIP_KEYS = new Set([
  "slug",
  "vsSlug",
  "externalUrl",
  "rank",
  "isScribbble",
  "competitor", // comparison brand name
  "name", // listicle item brand name
]);

// Explicitly skipped message ids.
const SKIP_IDS = new Set(["messages.meta.titleTemplate"]);

function isTranslatable(value: string, key: string): boolean {
  if (SKIP_KEYS.has(key)) return false;
  // Bare yes/no cells render as icons; translating them breaks renderCell.
  if (/^(yes|no)$/i.test(value.trim())) return false;
  if (/^https?:\/\//.test(value)) return false;
  if (value.includes("@") && !value.includes(" ")) return false; // emails
  if (!/\p{L}/u.test(value)) return false; // no letters (e.g. "—", "#3")
  return true;
}

type FlatMap = Record<string, string>;

function flatten(node: unknown, prefix: string, out: FlatMap, key = ""): void {
  if (typeof node === "string") {
    if (isTranslatable(node, key) && !SKIP_IDS.has(prefix)) out[prefix] = node;
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => flatten(item, `${prefix}.${i}`, out, key));
    return;
  }
  if (typeof node === "object" && node !== null) {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      flatten(v, `${prefix}.${k}`, out, k);
    }
  }
}

function extractSources(): FlatMap {
  const out: FlatMap = {};
  const enMessages = JSON.parse(
    readFileSync(resolve(ROOT, "messages/en.json"), "utf8"),
  );
  flatten(enMessages, "messages", out);

  const dataSets = { personas, comparisons, listicles } as const;
  for (const [kind, items] of Object.entries(dataSets)) {
    for (const item of items) {
      flatten(item, `data.${kind}.${item.slug}`, out);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lockfile

type Lock = Record<string, { hash: string; done: string[] }>;

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function loadLock(): Lock {
  if (!existsSync(LOCK_PATH)) return {};
  return JSON.parse(readFileSync(LOCK_PATH, "utf8"));
}

// ---------------------------------------------------------------------------
// Output files

function readJson(path: string): Record<string, unknown> {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

function getAtPath(obj: unknown, parts: string[]): unknown {
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setAtPath(obj: Record<string, any>, parts: string[], value: string) {
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (cur[part] == null) {
      cur[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cur = cur[part];
  }
  cur[parts[parts.length - 1]] = value;
}

// id -> { file, pathInFile }
function idTarget(id: string, locale: string) {
  const parts = id.split(".");
  if (parts[0] === "messages") {
    return {
      file: resolve(ROOT, `messages/${locale}.json`),
      parts: parts.slice(1),
    };
  }
  // data.<kind>.<slug>.<field...>  (slugs contain no dots)
  const kind = parts[1];
  return {
    file: resolve(ROOT, `lib/i18n/data/${locale}/${kind}.json`),
    parts: parts.slice(2),
  };
}

// ---------------------------------------------------------------------------
// OpenAI

function extractTokens(s: string): string[] {
  // ICU placeholders and rich-text tags that must survive translation.
  return [
    ...(s.match(/\{[a-zA-Z0-9_]+\}/g) ?? []),
    ...(s.match(/<\/?[a-z]+>/g) ?? []),
  ].sort();
}

async function translateChunk(
  locale: string,
  chunk: FlatMap,
  attempt = 1,
): Promise<FlatMap> {
  const system = `You are a professional translator localizing the marketing website of Scribbble, a macOS screen-annotation app, from English into ${LANGUAGE_NAMES[locale]}.

Rules:
- Translate naturally and idiomatically, keeping a confident marketing tone. Prefer wording a native speaker would actually use.
- NEVER translate these product/brand names: ${BRAND_NAMES.join(", ")}.
- Preserve ICU placeholders like {audience} or {competitor} EXACTLY as-is.
- Preserve XML-like tags such as <gradient>...</gradient> or <strong>...</strong> as-is, translating only the text inside them.
- Keep prices, version numbers, keyboard shortcut names and "macOS 11+" style requirements unchanged.
- Keep the meaning faithful; do not add or drop information.

Input is a JSON object mapping ids to English strings. Reply with a JSON object: {"translations": {"<id>": "<translated string>", ...}} covering EVERY input id.`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(chunk) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      return translateChunk(locale, chunk, attempt + 1);
    }
    throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  let translations: FlatMap;
  try {
    translations = JSON.parse(content).translations;
    if (!translations || typeof translations !== "object") throw new Error();
  } catch {
    if (attempt < 2) return translateChunk(locale, chunk, attempt + 1);
    throw new Error(`Unparseable response for ${locale}: ${content?.slice(0, 300)}`);
  }

  // Validate: every id present, placeholders/tags preserved.
  const bad: string[] = [];
  for (const [id, source] of Object.entries(chunk)) {
    const translated = translations[id];
    if (typeof translated !== "string" || !translated.trim()) {
      bad.push(`${id}: missing`);
      continue;
    }
    const want = extractTokens(source).join("|");
    const got = extractTokens(translated).join("|");
    if (want !== got) bad.push(`${id}: tokens "${want}" vs "${got}"`);
  }
  if (bad.length) {
    if (attempt < 2) return translateChunk(locale, chunk, attempt + 1);
    throw new Error(
      `Validation failed for ${locale} after retry:\n  ${bad.join("\n  ")}`,
    );
  }
  return translations;
}

// ---------------------------------------------------------------------------
// Main

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const localeArg = args.includes("--locale")
    ? args[args.indexOf("--locale") + 1]
    : undefined;
  const locales = localeArg
    ? [localeArg as (typeof TARGET_LOCALES)[number]]
    : [...TARGET_LOCALES];

  for (const l of locales) {
    if (!LANGUAGE_NAMES[l]) {
      console.error(`Unknown locale "${l}". Valid: ${TARGET_LOCALES.join(", ")}`);
      process.exit(1);
    }
  }
  if (!dryRun && !process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }

  const sources = extractSources();
  const lock = loadLock();

  // Reset done-lists for changed strings; register new ones.
  for (const [id, source] of Object.entries(sources)) {
    const hash = sha256(source);
    if (!lock[id] || lock[id].hash !== hash) lock[id] = { hash, done: [] };
  }
  // Drop ids whose English source no longer exists.
  for (const id of Object.keys(lock)) {
    if (!(id in sources)) delete lock[id];
  }

  // Work list per locale.
  const pending: Record<string, FlatMap> = {};
  for (const locale of locales) {
    pending[locale] = {};
    for (const [id, source] of Object.entries(sources)) {
      if (force || !lock[id].done.includes(locale)) {
        pending[locale][id] = source;
      }
    }
  }

  const totalIds = Object.keys(sources).length;
  for (const locale of locales) {
    console.log(
      `${locale}: ${Object.keys(pending[locale]).length}/${totalIds} strings to translate`,
    );
  }
  if (dryRun) {
    const sample = Object.entries(pending[locales[0]]).slice(0, 10);
    if (sample.length) {
      console.log(`\nSample pending ids (${locales[0]}):`);
      for (const [id] of sample) console.log(`  ${id}`);
    }
    return;
  }

  // Build (locale, chunk) jobs.
  type Job = { locale: string; chunk: FlatMap };
  const jobs: Job[] = [];
  for (const locale of locales) {
    let chunk: FlatMap = {};
    let chars = 0;
    for (const [id, source] of Object.entries(pending[locale])) {
      chunk[id] = source;
      chars += source.length;
      if (Object.keys(chunk).length >= CHUNK_MAX_ITEMS || chars >= CHUNK_MAX_CHARS) {
        jobs.push({ locale, chunk });
        chunk = {};
        chars = 0;
      }
    }
    if (Object.keys(chunk).length) jobs.push({ locale, chunk });
  }
  if (!jobs.length) {
    console.log("Nothing to translate — all strings up to date.");
    return;
  }
  console.log(`\n${jobs.length} API request(s) using model ${MODEL}...`);

  // Run with a small concurrency pool; collect results per locale.
  const results: Record<string, FlatMap> = {};
  let done = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const translations = await translateChunk(job.locale, job.chunk);
      results[job.locale] = { ...(results[job.locale] ?? {}), ...translations };
      done++;
      console.log(`  [${done}/${jobs.length}] ${job.locale}: ${Object.keys(job.chunk).length} strings`);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker),
  );

  // Write outputs. Message catalogs start from the full English catalog so no
  // key is ever missing; data overlays contain only translated fields.
  const enMessages = JSON.parse(
    readFileSync(resolve(ROOT, "messages/en.json"), "utf8"),
  );
  for (const locale of locales) {
    const translated = results[locale] ?? {};
    const files = new Map<string, Record<string, any>>();

    const loadFile = (path: string, base: Record<string, any>) => {
      if (!files.has(path)) {
        const existing = readJson(path);
        files.set(
          path,
          Object.keys(existing).length
            ? existing
            : JSON.parse(JSON.stringify(base)),
        );
      }
      return files.get(path)!;
    };

    // Ensure message catalog exists and is complete: overlay existing
    // translations onto a fresh English base, then apply new ones.
    const msgPath = resolve(ROOT, `messages/${locale}.json`);
    const freshBase = JSON.parse(JSON.stringify(enMessages));
    const existingMsgs = readJson(msgPath);
    const catalog = Object.keys(existingMsgs).length
      ? mergeCatalog(freshBase, existingMsgs)
      : freshBase;
    files.set(msgPath, catalog);

    for (const [id, value] of Object.entries(translated)) {
      const { file, parts } = idTarget(id, locale);
      const obj = loadFile(file, {});
      setAtPath(obj, parts, value);
      if (!lock[id].done.includes(locale)) lock[id].done.push(locale);
    }
    // Mark ids that were already done (not in this run) — nothing to do.

    for (const [path, obj] of files) {
      writeFileSync(path, JSON.stringify(obj, null, 2) + "\n");
    }
    console.log(`${locale}: wrote ${files.size} file(s)`);
  }

  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n");
  console.log("Lockfile updated.");
}

// Recursively overlay existing catalog values onto the English base, keeping
// the base's structure (drops stale keys, keeps prior translations).
function mergeCatalog(base: any, existing: any): any {
  if (typeof base === "string") {
    return typeof existing === "string" ? existing : base;
  }
  if (Array.isArray(base)) {
    return base.map((item, i) =>
      existing && Array.isArray(existing) ? mergeCatalog(item, existing[i]) : item,
    );
  }
  if (typeof base === "object" && base !== null) {
    const out: Record<string, any> = {};
    for (const key of Object.keys(base)) {
      out[key] = mergeCatalog(base[key], existing?.[key]);
    }
    return out;
  }
  return existing ?? base;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
