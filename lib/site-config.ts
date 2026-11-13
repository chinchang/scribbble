import type { Metadata } from "next";

export const SITE_URL = "https://www.scribbble.app";

export const DOWNLOAD_URL =
  "https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg";

export const BUY_URL =
  "https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575";

// One-time license price. Single source for the pricing page, the download
// page and every SoftwareApplication JSON-LD offer, so they can't disagree.
export const PRICE_USD = 12;
export const PRICE_LABEL = `$${PRICE_USD}`;

// Minimum supported system, as used in JSON-LD.
export const MIN_MACOS = "macOS 14.0+";

// The app's default toggle shortcut, shown in the download page's steps.
export const TOGGLE_SHORTCUT = "⌥ Tab";

// Download page. CTAs across the site link to DOWNLOAD_PATH with
// `?DOWNLOAD_AUTOSTART_PARAM=1`; the page then starts the DMG download by
// itself after DOWNLOAD_AUTOSTART_DELAY_MS (long enough for the page to paint
// and the "starting" message to be read, short enough to feel instant).
export const DOWNLOAD_PATH = "/download";
export const DOWNLOAD_AUTOSTART_PARAM = "start";
export const DOWNLOAD_AUTOSTART_DELAY_MS = 600;

// Changelog. Releases are read from the app's public GitHub repo and cached
// for CHANGELOG_REVALIDATE_SECONDS before the page is regenerated.
export const CHANGELOG_PATH = "/changelog";
export const GITHUB_REPO = "chinchang/scribbble";
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`;
export const CHANGELOG_REVALIDATE_SECONDS = 3600;

export const GA_MEASUREMENT_ID = "G-8D1EQCT847";

export const DEFAULT_TITLE =
  "Scribbble: Screen Annotation App for Mac · Draw on Screen";
export const DEFAULT_OG_TITLE = "Scribbble: Screen Annotation App for Mac";
export const DEFAULT_DESCRIPTION =
  "Scribbble is a beautiful Mac app to scribble, draw, highlight and annotate directly on your screen. Perfect for teachers, streamers, YouTubers, designers and sales demos. Free download, one-time license.";

// Base metadata shared by both root layouts. Text fields can be overridden
// per locale; everything else (URLs, images, robots) is locale-independent.
export function buildBaseMetadata({
  title = DEFAULT_TITLE,
  ogTitle = DEFAULT_OG_TITLE,
  description = DEFAULT_DESCRIPTION,
  ogImageAlt = "Scribbble: Screen annotation app for Mac",
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
