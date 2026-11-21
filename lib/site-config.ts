import type { Metadata } from "next";

export const SITE_URL = "https://www.scribbble.app";

export const DOWNLOAD_URL =
  "https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg";

export const BUY_URL =
  "https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575";

// One-time license price. Single source for the pricing page, the download
// page and every SoftwareApplication JSON-LD offer, so they can't disagree.
export const PRICE_USD = 12;
export const PRICE_LABEL = formatUsd(PRICE_USD);

// Limited-time sale (Black Friday / Cyber Monday 2026). While it runs, the
// site shows a banner at the top of every page with the site header, a "% off" tag next to the
// Pricing nav link, and the sale price (with the regular price struck
// through) on the pricing card, the download page and the homepage buy lines.
// The end check also runs in the browser (components/sale-switch-client.tsx),
// so the sale UI disappears on its own at SALE.endsAt without a redeploy.
export const SALE = {
  // Master switch. false hides every piece of sale UI.
  enabled: true,
  // Discount, in percent, off PRICE_USD.
  percent: 35,
  // Last moment of the sale: end of Dec 5, 2026, US Pacific time.
  endsAt: "2026-12-05T23:59:59-08:00",
  // Time zone used to print the end date ("December 5").
  endsAtTimeZone: "America/Los_Angeles",
  // Lemon Squeezy discount code. Leave empty if the discount is applied on
  // the store side. When set, it is shown in the banner and pre-filled at
  // checkout on every buy link via `checkout[discount_code]`.
  code: "BFCMSCRIB",
};
export const SALE_PRICE_USD =
  Math.round(PRICE_USD * (100 - SALE.percent)) / 100;
export const SALE_PRICE_LABEL = formatUsd(SALE_PRICE_USD);

/** True while the sale is switched on and its end date hasn't passed. */
export function isSaleActive(now: number = Date.now()): boolean {
  return SALE.enabled && now <= new Date(SALE.endsAt).getTime();
}

/** Checkout URL with the sale's discount code pre-filled, if there is one. */
export function saleBuyUrl(url: string): string {
  if (!SALE.code) return url;
  const u = new URL(url);
  u.searchParams.set("checkout[discount_code]", SALE.code);
  return u.toString();
}

/** "$12", "$7.80": whole dollars without decimals, otherwise two decimals. */
export function formatUsd(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

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
// Wording fixes applied to release notes before they are shown, for mistakes
// in a published GitHub release. [text as published, text to show].
export const CHANGELOG_CORRECTIONS: [string, string][] = [
  // v0.13.0 names the wrong default toggle shortcut.
  ["⌥Space", "⌥Tab"],
];

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
          url: "/og.png",
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
      images: ["/og.png"],
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
