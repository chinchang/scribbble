import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "zh", "ja", "de", "hi", "nl", "fr"],
  defaultLocale: "en",
  // English at root URLs (/for/teachers), other locales prefixed (/es/for/teachers)
  localePrefix: "as-needed",
  // SEO: explicit URLs only — no Accept-Language redirects, no locale cookie
  localeDetection: false,
  localeCookie: false,
  // hreflang is emitted via page metadata, not middleware Link headers
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
