import type { Metadata } from "next";

export const SITE_URL = "https://www.scribbble.app";

export const DOWNLOAD_URL =
  "https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg";

export const BUY_URL =
  "https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575";

export const GA_MEASUREMENT_ID = "G-8D1EQCT847";

export const DEFAULT_TITLE =
  "Scribbble — Screen Annotation App for Mac · Draw on Screen";
export const DEFAULT_OG_TITLE = "Scribbble — Screen Annotation App for Mac";
export const DEFAULT_DESCRIPTION =
  "Scribbble is a beautiful Mac app to scribble, draw, highlight and annotate directly on your screen. Perfect for teachers, streamers, YouTubers, designers and sales demos. Free download, one-time license.";

// Base metadata shared by both root layouts. Text fields can be overridden
// per locale; everything else (URLs, images, robots) is locale-independent.
export function buildBaseMetadata({
  title = DEFAULT_TITLE,
  ogTitle = DEFAULT_OG_TITLE,
  description = DEFAULT_DESCRIPTION,
  ogImageAlt = "Scribbble — Screen annotation app for Mac",
  titleTemplate = "%s | Scribbble",
}: {
  title?: string;
  ogTitle?: string;
  description?: string;
  ogImageAlt?: string;
  titleTemplate?: string;
} = {}): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: titleTemplate },
    description,
    applicationName: "Scribbble",
    keywords: SITE_KEYWORDS,
    authors: [{ name: "Kushagra Gour", url: "https://kushagra.dev" }],
    creator: "Kushagra Gour",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: "Scribbble",
      url: SITE_URL,
      title: ogTitle,
      description,
      images: [
        {
          url: "/social-2.png",
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ["/social-2.png"],
      creator: "@cssMonk",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const SITE_KEYWORDS = [
  "screen annotation",
  "draw on screen",
  "mac annotation app",
  "screen drawing tool",
  "screen annotation tool mac",
  "mac screen annotation",
  "annotation app for mac",
  "scribble app",
  "scribble app mac",
  "presentation annotation",
  "zoomit for mac",
  "epic pen for mac",
  "presentify alternative",
  "screen marker",
  "live screen draw",
];
