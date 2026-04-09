import type { MetadataRoute } from "next";
import { personaSlugs } from "@/lib/personas";
import { comparisonSlugs } from "@/lib/comparisons";
import { listicleSlugs } from "@/lib/listicles";

const SITE_URL = "https://scribbble.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/tools/screenshot-annotate"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const personaRoutes = personaSlugs.map((slug) => ({
    url: `${SITE_URL}/for/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const comparisonRoutes = comparisonSlugs.map((slug) => ({
    url: `${SITE_URL}/vs/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const listicleRoutes = listicleSlugs.map((slug) => ({
    url: `${SITE_URL}/best/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...personaRoutes,
    ...comparisonRoutes,
    ...listicleRoutes,
  ];
}
