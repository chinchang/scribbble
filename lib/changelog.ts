import snapshot from "../content/changelog.json";
import {
  GITHUB_RELEASES_API,
  CHANGELOG_REVALIDATE_SECONDS,
} from "./site-config";

/** The subset of a GitHub release that the site keeps. */
export type RawRelease = {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  body: string | null;
};

export type ReleaseSection = {
  /** "New", "Fixed", ... or null for notes without a heading. */
  title: string | null;
  items: string[];
};

export type Release = {
  /** "0.13.0" */
  version: string;
  /** Codename from old release titles ("Crop"), if any. */
  codename: string | null;
  /** ISO date */
  date: string;
  url: string;
  sections: ReleaseSection[];
};

/**
 * Published releases straight from GitHub, or null when the API can't be
 * reached (offline build, rate limit). Shared with
 * scripts/sync-changelog.ts, which writes the fallback snapshot.
 */
export async function fetchGithubReleases(): Promise<RawRelease[] | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "scribbble-site",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(GITHUB_RELEASES_API, {
      headers,
      next: { revalidate: CHANGELOG_REVALIDATE_SECONDS },
    } as RequestInit);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data
      .filter((r) => !r.draft && !r.prerelease && r.published_at)
      .map((r) => ({
        tag_name: String(r.tag_name),
        name: r.name ?? null,
        published_at: String(r.published_at),
        html_url: String(r.html_url),
        body: r.body ?? null,
      }));
  } catch {
    return null;
  }
}

// The site's copy has no em dashes; release notes are written freely, so
// normalise them. The first one in a line usually follows the feature name
// ("Auto-fade — everything…"), where a colon reads best; later ones are
// asides, where a comma does.
function stripEmDashes(line: string): string {
  let seen = false;
  return line.replace(/\s*—\s*/g, () => {
    if (seen) return ", ";
    seen = true;
    return ": ";
  });
}

const LEADING_SYMBOLS = /^[^\p{L}\p{N}]+/u;
// "✨ New" alone on a line: symbols, then one or two short words.
const BARE_HEADING = /^[^\p{L}\p{N}\-*[`(]+\s*\p{L}[\p{L} ]{0,20}$/u;

/** Turns a release's markdown body into titled groups of bullet points. */
export function parseReleaseBody(body: string | null): ReleaseSection[] {
  const sections: ReleaseSection[] = [];
  let current: ReleaseSection | null = null;
  let skipping = false; // inside a "Screenshots" block
  let lastWasItem = false;

  for (const rawLine of (body ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      lastWasItem = false;
      continue;
    }
    if (/^<img\b/i.test(line)) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading || BARE_HEADING.test(line)) {
      const title = (heading ? heading[1] : line)
        .replace(LEADING_SYMBOLS, "")
        .trim();
      lastWasItem = false;
      skipping = /^screenshots?$/i.test(title);
      // "Changelog" and "v0.1.0" headings just restate the release.
      if (skipping || /^changelog$/i.test(title) || /^v?\d+\.\d+/.test(title)) {
        current = null;
        continue;
      }
      current = { title, items: [] };
      sections.push(current);
      continue;
    }
    if (skipping) continue;

    const item = line.match(/^[-*]\s*(.*)$/);
    if (item) {
      const text = stripEmDashes(item[1].trim());
      if (!text) continue;
      if (!current) {
        current = { title: null, items: [] };
        sections.push(current);
      }
      current.items.push(text);
      lastWasItem = true;
      continue;
    }

    // A wrapped line continues the bullet above it; stray prose ("Enjoy!")
    // between sections is dropped.
    if (lastWasItem && current) {
      current.items[current.items.length - 1] += ` ${stripEmDashes(line)}`;
    }
  }

  return sections.filter((s) => s.items.length > 0);
}

function toRelease(raw: RawRelease): Release {
  return {
    version: raw.tag_name.replace(/^v/i, ""),
    // Early releases were titled "v0.3.0 - Crop".
    codename: raw.name?.match(/^v?[\d.]+\s+-\s+(.+)$/)?.[1]?.trim() ?? null,
    date: raw.published_at,
    url: raw.html_url,
    sections: parseReleaseBody(raw.body),
  };
}

/** All releases, newest first. Live from GitHub, else the checked-in snapshot. */
export async function getReleases(): Promise<Release[]> {
  const raw = (await fetchGithubReleases()) ?? (snapshot as RawRelease[]);
  return raw.map(toRelease).sort((a, b) => b.date.localeCompare(a.date));
}

/** Latest version from the snapshot only (no network), for the download page. */
export function getSnapshotLatestVersion(): string | null {
  const latest = [...(snapshot as RawRelease[])].sort((a, b) =>
    b.published_at.localeCompare(a.published_at),
  )[0];
  return latest ? latest.tag_name.replace(/^v/i, "") : null;
}
