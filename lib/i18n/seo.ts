import { routing } from "@/i18n/routing";

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
