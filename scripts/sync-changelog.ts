/**
 * Refreshes content/changelog.json, the checked-in snapshot of the app's
 * GitHub releases. The /changelog page reads releases live from GitHub and
 * falls back to this file when the API is unreachable or rate-limited, so
 * the build never depends on the network.
 *
 * Usage: pnpm changelog   (optional GITHUB_TOKEN for a higher rate limit)
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGithubReleases } from "../lib/changelog";

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../content/changelog.json",
);

fetchGithubReleases().then((releases) => {
  if (!releases) {
    console.error("Could not fetch releases from GitHub; snapshot left as is.");
    process.exit(1);
  }
  writeFileSync(OUT, JSON.stringify(releases, null, 2) + "\n");
  console.log(`Wrote ${releases.length} releases to content/changelog.json`);
});
