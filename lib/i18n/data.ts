import { personas, type Persona } from "@/lib/personas";
import { comparisons, type Comparison } from "@/lib/comparisons";
import { listicles, type Listicle } from "@/lib/listicles";

import esPersonas from "./data/es/personas.json";
import esComparisons from "./data/es/comparisons.json";
import esListicles from "./data/es/listicles.json";
import zhPersonas from "./data/zh/personas.json";
import zhComparisons from "./data/zh/comparisons.json";
import zhListicles from "./data/zh/listicles.json";
import jaPersonas from "./data/ja/personas.json";
import jaComparisons from "./data/ja/comparisons.json";
import jaListicles from "./data/ja/listicles.json";
import dePersonas from "./data/de/personas.json";
import deComparisons from "./data/de/comparisons.json";
import deListicles from "./data/de/listicles.json";
import hiPersonas from "./data/hi/personas.json";
import hiComparisons from "./data/hi/comparisons.json";
import hiListicles from "./data/hi/listicles.json";
import nlPersonas from "./data/nl/personas.json";
import nlComparisons from "./data/nl/comparisons.json";
import nlListicles from "./data/nl/listicles.json";

// Translated overlays keyed by slug. Only translatable fields are present;
// anything missing falls back to the English source object.
type Overlay = Record<string, unknown>;

const overlays: Record<
  string,
  { personas: Overlay; comparisons: Overlay; listicles: Overlay }
> = {
  es: { personas: esPersonas, comparisons: esComparisons, listicles: esListicles },
  zh: { personas: zhPersonas, comparisons: zhComparisons, listicles: zhListicles },
  ja: { personas: jaPersonas, comparisons: jaComparisons, listicles: jaListicles },
  de: { personas: dePersonas, comparisons: deComparisons, listicles: deListicles },
  hi: { personas: hiPersonas, comparisons: hiComparisons, listicles: hiListicles },
  nl: { personas: nlPersonas, comparisons: nlComparisons, listicles: nlListicles },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Overlay strings win; objects merge recursively; arrays merge element-wise
// (a shorter/partial overlay array keeps the English tail).
function deepMerge<T>(base: T, overlay: unknown): T {
  if (overlay === undefined || overlay === null) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((item, i) => deepMerge(item, overlay[i])) as T;
  }
  if (isPlainObject(base) && isPlainObject(overlay)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (key in overlay) out[key] = deepMerge(base[key], overlay[key]);
    }
    return out as T;
  }
  return overlay as T;
}

function localized<T extends { slug: string }>(
  items: T[],
  locale: string,
  kind: "personas" | "comparisons" | "listicles",
): T[] {
  const overlay = overlays[locale]?.[kind];
  if (!overlay) return items;
  return items.map((item) => deepMerge(item, overlay[item.slug]));
}

export function getPersonas(locale: string): Persona[] {
  return localized(personas, locale, "personas");
}

export function getPersona(slug: string, locale: string): Persona | undefined {
  return getPersonas(locale).find((p) => p.slug === slug);
}

export function getComparisons(locale: string): Comparison[] {
  return localized(comparisons, locale, "comparisons");
}

export function getComparison(
  slug: string,
  locale: string,
): Comparison | undefined {
  return getComparisons(locale).find((c) => c.slug === slug);
}

export function getListicles(locale: string): Listicle[] {
  return localized(listicles, locale, "listicles");
}

export function getListicle(slug: string, locale: string): Listicle | undefined {
  return getListicles(locale).find((l) => l.slug === slug);
}
