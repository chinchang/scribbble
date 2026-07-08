import type { MetadataRoute } from "next";
import { personaSlugs } from "@/lib/personas";
import { comparisonSlugs } from "@/lib/comparisons";
import { listicleSlugs } from "@/lib/listicles";
import { getAllPostSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Localized marketing pages: one entry per locale variant, each carrying
  // the full hreflang alternates map (incl. x-default -> English URL).
  const marketingPaths = [
    "",
    "/vs/zoomit-vs-epic-pen",
    ...personaSlugs.map((slug) => `/for/${slug}`),
    ...comparisonSlugs.map((slug) => `/vs/${slug}`),
    ...listicleSlugs.map((slug) => `/best/${slug}`),
  ];

  const marketingRoutes = marketingPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localeUrl(locale, path || "/")}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority:
        path === "" ? (locale === routing.defaultLocale ? 1 : 0.8) : 0.7,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(path || "/")).map(([l, p]) => [
            l,
            `${SITE_URL}${p}`,
          ]),
        ),
      },
    })),
  );

  // English-only routes (blog, tools) — unchanged, no alternates.
  const englishRoutes = ["/tools/screenshot-annotate", "/blog"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes = getAllPostSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...marketingRoutes, ...englishRoutes, ...blogRoutes];
}
