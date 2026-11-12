import { routing } from "@/i18n/routing";
import { DOWNLOAD_PATH, DOWNLOAD_AUTOSTART_PARAM } from "@/lib/site-config";

// Where every "Download" CTA points: the localized download page, flagged so
// it starts the DMG download on arrival. Direct visits (no flag) get a button.
export function downloadCtaUrl(locale: string = routing.defaultLocale): string {
  return `${localeUrl(locale, DOWNLOAD_PATH)}?${DOWNLOAD_AUTOSTART_PARAM}=1`;
}

// "/for/teachers" -> "/for/teachers" (en) or "/es/for/teachers"
export function localeUrl(locale: string, path: string): string {
  const normalized = path === "" ? "/" : path;
  if (locale === routing.defaultLocale) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

// hreflang map for a localized marketing path, for Metadata.alternates.languages
// and the sitemap. x-default points at the English URL.
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localeUrl(locale, path)]),
    ),
    "x-default": localeUrl(routing.defaultLocale, path),
  };
}
