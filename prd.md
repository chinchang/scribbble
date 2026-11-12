This is the website for an app called Scribbble - a mac app to annotate/draw anywhere on the screen.

## Points to note

- All the features should be accessible easily with keyboard
- Never try to run the dev server to test. I do it manually

## Tasks

### Screenshot annotation - free tool

- [x] add another page on /tools/screenshot-annotate
- [x] on the screenshot-annotate page, show an image uploader. The uploader works by selecting file or pasting from clipboard
- [x] once an image is uploaded, show it on complete viewport, maintaining its aspect ratio
- [x] add a toolbar with tools to annotate the screenshot. Start with just 1 tool - freehand pen tool to draw over the screenshot
- [x] add "Rectangle tool" to draw rectangles (with just borders) over the screenshot
- [x] add "Arrow tool" to draw arrows over the screenshot
- [x] add keyboard shortcut system to activate tools
- [x] Make the toolbar floating over the image. It should become visibily inactive whenever a tool is in progress
- [x] Once a tool used, copy the current annotated screenshot to the clipboard
- [x] Redesign the toolbar as per design-toolbar.png
- [x] Make the toolbar draggable across the screen
- [x] Add a toast when "copy" keyboard shortcut is pressed
- [x] Add "Text" tool to add text anywhere over the drawing
- [x] Add a "background" tool that lets you add various backgrounds around the screenshot. Let's start with just a fixed palette of solid backgrounds.
- [x] Add "Blur/Pixelate" tool to redact sensitive areas by dragging a rectangle region
- [x] Add "Numbered Step Markers" tool to place numbered circles (1, 2, 3...) on click
- [x] Improve background tool: auto-show options on tool switch, add gradient and image background options
- [x] Add "Depth of Field" tool with adjustable blur intensity and focus x-offset
- [x] Don't upscale small pasted images — render at natural size, clamp to viewport
- [x] Add "Background Blur" and "Background Noise" sliders to the background tool popup

### Homepage features section (2026-09-11)

- [x] Add a "The toolkit" features section to the homepage (between the demo video and the SEO section) with
      nine cards — Draw freehand, Arrows/rectangles/ellipses, Whiteboard, Auto-fade mode, Spotlight,
      Highlighter, Take snapshots, Magnify & zoom, Measure tool — each with a custom hand-drawn-style
      SVG glyph (`components/feature-icons.tsx`) that sketches itself in on hover. Copy lives in
      `messages/en.json` under `home.features*`; translated into all 7 locales. Also added
      "Auto-fade mode" to the homepage JSON-LD `featureList`

### Self-playing desktop demo on the homepage (2026-09-16)

- [x] Add a viewport-height section between the hero and the video (`components/desktop-demo.tsx`) that
      mimics a macOS desktop: Big Sur wallpaper (`public/demo-wallpaper.jpg`, a 2048px JPEG cut from `public/macos.jpg`), menu bar with system tray,
      dock, a mock document window, and Scribbble's vertical toolbar on the right (color swatch, stroke
      dot, pen, rectangle, highlighter, measure, spotlight, magnify, text, whiteboard, auto-fade,
      snapshot, clear, hide, close). A dummy cursor loops forever: it clicks each tool in toolbar order
      and demos it on the desktop (hand-drawn pen strokes, rectangle drag, highlighter, pixel measure,
      spotlight follow, magnifier lens, typed text, whiteboard sketch, auto-fading strokes, snapshot
      flash + thumbnail, hide/show, clear, close + reopen). rAF-driven, pauses when scrolled out of view,
      static under `prefers-reduced-motion`. No caption card, the desktop is the whole section. Copy lives in
      `messages/en.json` under `home.desktopDemo`; translated into all 7 locales

### SEO

- [x] Improve homepage SEO metadata (title, description, OpenGraph, JSON-LD SoftwareApplication schema)
- [x] Add programmatic SEO persona pages at `/for/[slug]` (teachers, streamers, youtubers, designers, sales-teams)
- [x] Add programmatic SEO comparison pages at `/vs/[slug]` (zoomit, presentify, cleanshot-x, epic-pen, annotate)
- [x] Add `sitemap.xml` and `robots.txt` covering all routes
- [x] Add programmatic SEO "best of" listicle pages at `/best/[slug]` (best-screen-annotation-apps-mac, best-zoomit-alternatives-mac, best-screen-annotation-tools-for-teachers)
- [x] Convert `/tools/screenshot-annotate` to a server component with metadata, JSON-LD (WebApplication + FAQ), and server-rendered SEO content
- [x] Improve homepage hero H1 with target keywords ("Draw Over Anything on Your Mac Screen")

### SEO improvements (from GSC analysis 2026-05-04)

P0 — Canonical/duplicate fix
- [x] Add 301 redirect from `scribbble.app` → `www.scribbble.app` at host/Vercel level (verified live 2026-08-05: non-www 301s to www)
- [x] In Search Console, verify both hosts, set preferred property, and request reindex on `/`, `/best/best-screen-annotation-apps-mac`, `/for/*`, `/vs/*` (domain property covers both hosts; reindex requested 2026-08-05 for `/`, `/best/best-screen-annotation-apps-mac`, `/vs/zoomit`, `/vs/epic-pen`)

P1 — CTR fixes on pages already getting impressions
- [x] Rewrite title + meta description for `/best/best-screen-annotation-apps-mac` (5K imp, only 2.1% CTR — biggest single lever)
- [x] Rewrite titles + descriptions for `/for/teachers`, `/for/streamers`, `/for/designers`, `/for/youtubers` (all <1% CTR despite 200–400 imp each)
- [x] Rewrite titles + descriptions for `/vs/epic-pen` and `/vs/zoomit` (high impressions, <1% CTR)
- [x] Tweak homepage meta description to gently capture brand misspellings (scrible, scribble, scrble — 30+ unique typos in queries)

P2 — New content for proven-demand gaps
- [x] Add `/best/best-epic-pen-alternatives-mac` listicle (5+ on-theme queries, multiple at page-1 positions)
- [x] Add `/best/best-presentify-alternatives-mac` listicle (3 on-theme queries)
- [x] Add `/vs/ink2go` comparison page (Ink2Go's Mac build is stale since 2020 — angle is "actively maintained Mac-native alternative"; translated into all 7 locales)
- [x] Add `/vs/zoomit-vs-epic-pen` third-party comparison page (50+ impressions across "zoomit vs epic pen" variants — no page owns this)
- [x] Add a FAQ section (or `/faq` page) with conversational Q&A targeting AI-Overview-style queries: "Why do people choose Zoomit over Epic Pen?", "What are the best alternatives to Epic Pen?", "What features do Epic Pen alternatives offer?" — wrap in `FAQPage` JSON-LD

P3 — Lift the core "screen annotation" cluster (currently pos 5–9)
- [x] Strengthen homepage on-page targeting for `screen annotation tool mac`, `mac screen annotation`, `annotation app for mac` (H2s, subhead, internal links from `/best/*` and `/for/*` with these anchors)
- [x] Improve `/tools/screenshot-annotate` for `mac image annotation tool` / `mac screenshot annotation tool` (currently pos 34 — needs stronger H1, FAQ, and feature list)

P4 — Internal linking + structured data
- [x] Add a "Related pages" footer block cross-linking `/for/*`, `/vs/*`, and `/best/*` pages (site footer + per-page cross-link sections; verified live 2026-08-05)
- [x] Add breadcrumbs with `BreadcrumbList` JSON-LD on `/for/*`, `/vs/*`, `/best/*` (verified live 2026-08-05 on all marketing templates)

### SEO improvements (position 4–20 pass, GSC 2026-08-13)

Method: GSC → filter position 4–20, sort by impressions, match each query cluster to the page
already ranking, then answer the exact query on that page. Baseline for the 4–20 band:
564 queries / 20,125 impressions / 415 clicks (2.1% CTR).

- [x] Rebuild `/vs/epic-pen` around search intent — it had 13,654 impr at 1.5% CTR / pos 6.7, and its
      queries are availability + download intent (`epic pen for mac` 1,806 impr, `epic pen mac` 602,
      `epic pen download for mac` 145, `epic pen toolbar` 101), not comparison intent. Added an
      `answerSections` block rendered above the comparison with H2s matching the literal queries
      ("Is Epic Pen available for Mac?", "How to get Epic Pen-style annotation on macOS", "Where's the
      Epic Pen toolbar equivalent on a Mac?", "Is there a free Epic Pen alternative for Mac?"), new
      title/H1/subheadline leading with the answer, and 6 FAQ entries (from 1) feeding `FAQPage` JSON-LD
- [x] Add `answerSections` to `/vs/presentify` for the modifier tail (`presentify mac` 563 impr,
      `presentify for mac` 121, `presentify app` 87, `presentify free` 32) — the page's other 3,206
      impressions are the bare navigational query, where CTR upside is capped
- [x] Fix screenshot-annotation cannibalization: `/tools/screenshot-annotate`'s entire SEO body was
      `sr-only`, so `/best/best-screen-annotation-apps-mac` was ranking for `image annotation tool mac`
      (88 impr, pos 15.2), `annotate screenshot mac` (56, 9.4), `screenshot annotation tool mac` (48, 8.6)
      and friends. Made the content visible below the editor, added "How to annotate a screenshot on Mac"
      and "Using it as a Mac image annotation tool" sections, retitled to lead with the target keyword,
      single keyword-bearing H1
- [x] Point internal links at the tool with keyword anchors — new cross-link block on all `/best/*` pages
      ("Open the free Mac screenshot annotation tool") and footer anchor changed from "Screenshot Annotate"
      to "Mac Screenshot Annotation Tool"
- [ ] Re-submit `/vs/epic-pen`, `/vs/presentify`, `/tools/screenshot-annotate` and
      `/best/best-screen-annotation-apps-mac` in GSC after deploy, then re-check the 4–20 band in ~4 weeks
- [ ] Investigate `/for/*` brand-query noise — 2,780 of `/for/teachers`' 4,204 impressions are the query
      "scribbble" at pos 6.2 / 0.2% CTR, and real persona intent is only ~40 impressions. The P1 title
      rewrites could not have moved anything. Consider consolidating or deindexing thin `/for/*` pages
- [x] Pre-existing: one `INVALID_MESSAGE` next-intl error during static generation. Root cause
      (found 2026-09-12): French `home.seoTitle` had an ASCII apostrophe right before a rich-text tag
      (`d'<gradient>`), which ICU MessageFormat reads as the start of a quoted literal, so `/fr`
      rendered the raw key "home.seoTitle" as its H2. Fixed with a typographic apostrophe;
      `scripts/translate.ts` now rewrites `'` before `<`/`{` to `’` in every translation

### Long-form content / blog

- [x] Set up MDX blog at `/blog` and `/blog/[slug]` (file-based posts in `content/blog/*.mdx`, frontmatter, JSON-LD, sitemap, footer link)
- [x] Write pillar post: "The Complete Guide to Screen Annotation" at `/blog/screen-annotation-guide` — ~3500 words covering definition, cognitive science, four modes, toolkit, best practices, audience use cases, tools comparison, hardware, common mistakes, FAQ. Internally links to all `/for/*`, `/vs/*`, `/best/*` pages.

### Localization (i18n)

- [x] Localize marketing pages (homepage, `/for/*`, `/vs/*`, `/best/*`, header/footer) into 7 languages — es, zh, ja, de, hi, nl, fr — via next-intl; English stays at root URLs, other locales at `/es/...` etc. Blog and `/tools/screenshot-annotate` stay English-only
- [x] Restructure routes into `app/[locale]/` (marketing) and `app/(en)/` (blog, tools) with per-locale `<html lang>`, all 136 marketing pages statically generated
- [x] SEO: self-referencing canonicals, hreflang alternates (7 locales + x-default) on every marketing page, per-locale sitemap entries with alternates, `inLanguage` in JSON-LD, no Accept-Language redirects
- [x] `scripts/translate.ts` (`pnpm translate`) — GPT-powered, lockfile-diffed (only new/changed strings hit the API), validates placeholders/tags, writes checked-in `messages/{locale}.json` + `lib/i18n/data/{locale}/*.json` overlays
- [x] Footer language switcher on localized pages
- [x] Run `pnpm translate` to generate the actual translations and commit the output (all 7 locales, 808 strings each, gpt-5-mini)

### App changes reflected on the site (2026-08-19)

- [x] Bump the stated minimum system requirement from macOS 11 to macOS 14 (`messages/en.json`
      `downloadSubtitle` / `chipMacos` / `personaPage.ctaSubtitle`, homepage JSON-LD
      `operatingSystem`, and the example in `scripts/translate.ts`'s prompt)
- [x] Add the newly shipped Magnify (screen zoom) tool everywhere the toolset is described —
      homepage cards + JSON-LD `featureList`, all 5 `/for/*` `featuredTools` lists, every `/vs/*`
      comparison table (new "Magnify (screen zoom)" row) and strengths list, all 5 `/best/*`
      listicles, `/vs/zoomit-vs-epic-pen`, the blog toolkit section and the `/tools/*` CTA
- [x] Reverse the "Scribbble has no screen zoom" positioning it invalidated: `/vs/zoomit` now
      answers "Does Scribbble include a zoom feature like ZoomIt?" with yes (ZoomIt keeps the break
      timer / whiteboard as its remaining edge), and the "No screen zoom" cons on
      `/best/best-screen-annotation-apps-mac` and `/best/best-zoomit-alternatives-mac` are gone
- [x] Re-ran `pnpm translate` (126 changed strings × 7 locales); hand-fixed one Hindi string that
      came back in English (`personaPage.ctaSubtitle`)
- [ ] Re-submit `/vs/zoomit` and `/best/best-zoomit-alternatives-mac` in GSC after deploy — the
      zoom-related copy on both reversed, and they target zoom-intent queries

### Whiteboard tool + multi-monitor support (2026-09-02)

- [x] Add the Whiteboard tool across the site — homepage card + JSON-LD `featureList`, every
      `/for/*` `featuredTools` list, a "Whiteboard mode" row and a strengths entry on all 6 `/vs/*`
      tables, all 5 `/best/*` listicles, `/vs/zoomit-vs-epic-pen`, the blog's virtual-whiteboard
      section and the `/tools/*` CTA
- [x] Add multi-monitor support — homepage "works in any app" card + JSON-LD, a strengths bullet on
      every `/vs/*` page, a `featuredTools` bullet per persona, and 4 new persona FAQs
      ("Does Scribbble work with multiple monitors?" and per-audience variants). Deliberately not a
      comparison-table row: competitors' multi-monitor behaviour isn't verified, so the copy only
      claims it for Scribbble
- [x] Reverse the now-false "no whiteboard" positioning: `/vs/ink2go`'s "Whiteboard mode → No" row
      and its "whiteboard is central to how you teach" reason to pick Ink2Go, ZoomIt's whiteboard as
      a reason to choose it on `/vs/zoomit`, and the "No break timer or whiteboard mode" /
      "No collaborative whiteboard mode" cons on three `/best/*` listicles (the teachers listicle now
      says the whiteboard is single-user, which is still true)
- [x] New `/vs/zoomit` FAQs for "Does Scribbble have a whiteboard mode like ZoomIt's blank screen?"
      and "Does Scribbble work with multiple monitors?"
- [x] Re-ran `pnpm translate` (~150 changed strings × 7 locales)
- [ ] Re-submit `/vs/zoomit`, `/vs/ink2go` and `/best/best-screen-annotation-tools-for-teachers` in
      GSC after deploy — whiteboard positioning reversed on all three

### Analytics (2026-09-11)

- [x] Track clicks on every "Download" CTA as a GA4 `download_click` event (param `location`)
      via `components/download-link.tsx`; `BuyLink` and `DownloadLink` now share
      `components/tracked-link.tsx`. Locations: `header`, `home_nav`, `home_hero`,
      `home_mid_cta`, `home_bottom_cta`, `pricing_card`, `for_hero`, `for_bottom_cta`, `vs_hero`, `vs_bottom_cta`,
      `vs_third_party_verdict`, `best_list_item`, `best_bottom_cta`, `blog_post_cta`
- [x] Remove every em dash from the website copy (2026-09-12): rewrote ~220 English strings across
      `messages/en.json`, `lib/{personas,comparisons,listicles}.ts`, `lib/site-config.ts`, the
      screenshot-annotate page, blog pages and the pillar post; `scripts/translate.ts` now bans em
      dashes in its prompt, validates for them (retry, then locale-aware substitution) and all 969
      translated strings that contained one were re-translated. Verified 0 em dashes in the built HTML

### Homepage conversion pass (2026-09-19, after reviewing lookaway.com)

- [x] Add a testimonials section (`components/testimonials.tsx`) between the toolkit and the SEO
      block, styled like annotations on a screen: numbered step marker per card, highlighter stroke
      over the `<hl>…</hl>` phrase of each quote, hand-drawn rectangle outline and a pen circle
      around the author's name that redraw on hover. Data lives in `messages/en.json` under
      `home.testimonials` (array of `quote`/`name`/`role`; the whole block is never translated,
      it is kept verbatim in every locale via `SKIP_ID_PREFIXES` in `scripts/translate.ts`) and the
      layout adapts to 1, 2 or 3+ quotes. First quote: Olivier Maghe, content creator
- [x] One primary CTA in the hero: the "Buy License" outline button is now a text link
      ("Love it already? Buy a license") under the download button, still tracked as `home_hero`
- [x] Repeat the download CTA mid-page (`components/mid-cta.tsx`) right after the testimonials, with
      the same buy text link and trust chips; tracked as `home_mid_cta`
- [x] Add a localized `/pricing` page (`app/[locale]/pricing/page.tsx`): one card, $12 one-time with
      lifetime updates, buy button + "download it free" text link (both tracked as `pricing_card`),
      the homepage testimonials section reused underneath, a 5-question pricing FAQ, and
      SoftwareApplication Offer + FAQPage + BreadcrumbList JSON-LD. Linked from the header nav
      (replaces the homepage nav's direct "Buy License" link), the footer and the sitemap
- [x] Unify the header: the homepage had its own inline header (with the Features anchor) while every
      other page used `components/site-header.tsx` (CTA only). All pages now render `SiteHeader`,
      which carries the homepage styling plus Features and Pricing links; a `location` prop keeps the
      homepage's download clicks labelled `home_nav`

### Demo video (2026-09-26)

- [x] Build a 20-second motion demo of the app in `demo-video/` (Remotion, 1920×1080 @ 30 fps):
      headline intro, macOS desktop with the real toolbar, cursor clicking through 10 tools with a
      camera push-in each, Clear wipe, Close-button reveal into a logo/price/URL outro. All tunables
      in `demo-video/src/config.ts`, all text in `demo-video/src/copy.ts`. Preview with `pnpm studio`
- [ ] Render the MP4 (`pnpm render` in `demo-video/`) once the web preview is approved
- [x] Replace it with a 15-second launch showreel (`demo-video/`, Remotion, 1920×1080 @ 60 fps,
      composition `Launch`): kinetic "Your screen is your canvas." cold open with a hand-drawn circle,
      orange paint-over wipe, "One hotkey." keycaps that press with a shockwave and zoom through the
      lens, a tilted 3D Mac screen where the cursor runs pen / arrow / rectangle / highlighter /
      spotlight / magnifier / text / clear beside a rolling colour-coded word ticker, a whip pan into
      a 3D wall of app windows getting annotated ("Works over … everything."), and an iris into the
      logo outro (ray burst, bouncing b's, CTA + URL). All tunables in `src/config.ts`, text in
      `src/copy.ts`. The hotkey keycaps (⌥ ⇧ D) are a placeholder for the app's real shortcut.
- [x] Add synchronised background music: `demo-video/scripts/music.ts` (`pnpm music`) synthesises
      `public/music.wav` from the same `src/config.ts` timeline, so every cue lands on its frame. 160 BPM
      (tempo derived from the 45-frame tool beat, so each tool click falls on a beat), G–D–A–Bm loop with
      sidechained pads, bass, arp, drums, plus sound design: comet/paint/whip whooshes, risers into
      each transition, impacts on the key press, screen arrival, "everything." and the logo drop,
      keycap thuds, cursor clicks, typing ticks, marker scribble under every stroke, bells on the logo
      and a pluck per hopping b. `pnpm render` regenerates the music before rendering
- [x] Instagram Reels version (2026-09-28): composition `LaunchInstagram`, 1080×1920 @ 60 fps, same
      timeline and `music.wav`, so it stays in sync. Layout-only overrides live in `VERTICAL` in
      `src/config.ts` (stacked "canvas." line, keycaps and outro recentred, 4×8 app wall, ticker above
      the screen), applied via `useCfg()` from `src/lib/format.ts`. The vertical tool run adds a
      follow-cam that zooms 1.45× into the Mac screen and tracks a smoothed cursor, pulling out for
      "clear". Key content sits between ~220 px and ~1350 px to clear Instagram's UI. `pnpm render`
      outputs both `out/scribbble-launch.mp4` and `out/scribbble-launch-instagram.mp4`

- [x] 30-second product tour (2026-10-11): composition `Showcase` (1920×1080 @ 60 fps), rendered to
      `demo-video/out/scribbble-showcase.mp4` via `pnpm render:showcase`. Slower and easier to follow
      than the launch reel: logo intro → "One hotkey." with the toolbar sliding in → 8 tools, one 2.5 s
      bar each, named in a left-hand caption ("Tool 03 / 08", the toolbar icon, a one-line description):
      pen, arrow, highlighter, spotlight, magnify, text, whiteboard, auto-fade → logo/CTA outro
      ("Pay once, use forever · macOS 14+"). The Clear beat was dropped after review. The toolbar matches the real app (swatch, stroke dot, pen, arrow, highlighter, measure,
      spotlight, magnify, text | whiteboard, auto-fade, snapshot, clear, hide | close) with blue active
      state and hover tooltips. 96 BPM soundtrack from `scripts/music-showcase.ts`
      (`public/music-showcase.wav`); the synth engine now lives in `scripts/synth.ts`, shared with
      `music.ts` (the launch reel's music is byte-identical after the refactor). Tunables in `SHOWCASE*`
      in `src/config.ts`, text in `SHOWCASE_COPY` in `src/copy.ts`, scenes in `src/showcase/`

### Product Hunt launch (2026-10-11)

- [x] Prepare and schedule the PH launch for Sun Oct 11, 12:01am PT
      (https://www.producthunt.com/products/scribbble): tagline, description, Mac / Productivity /
      Menu Bar Apps tags, icon thumbnail, 7 gallery images (OG image + 6 frames from
      `demo-video/out/scribbble-launch.mp4`), maker first comment, X @cssMonk, solo maker,
      "Paid with free trial", promo code `SCRIBBBLEONPH` (20% off, expires Oct 18)
- [x] Create the `SCRIBBBLEONPH` 20%-off discount in Lemon Squeezy before launch
- [ ] Add the launch video (YouTube/Loom link) to the PH post

### Download page, changelog, mobile nav, price fix (2026-11-13)

- [x] Add a localized `/download` page (`app/[locale]/download/page.tsx`). Every "Download" CTA on the
      site now links to it (`downloadCtaUrl(locale)` in `lib/i18n/seo.ts`) instead of opening the DMG
      in a new tab. Arriving from a CTA (`?start=1`) starts the download automatically
      (`components/download-starter.tsx`); a direct visit shows a button; non-Mac visitors are told
      it is a Mac app. Below: three install steps, the default shortcut, and the $12 license offer.
      New GA4 locations: `download_page`, `download_page_retry`, `mobile_menu`, `changelog_cta`
      (`buy_click` also fires with `download_page`). Copy in `messages/en.json` under `download`
- [x] Fix the price contradiction: homepage `SoftwareApplication` JSON-LD said `price: "0"` while the
      site says $12. Price now comes from `PRICE_USD` in `lib/site-config.ts`, shared by the homepage,
      `/pricing` and `/download`
- [x] Mobile nav: the header's Features / Pricing links were hidden below `md` with no menu. Added a
      menu button (`components/mobile-nav.tsx`) with Features, Pricing, Changelog and the download
      CTA. On small screens the header CTA button and the language dropdown are hidden (the CTA is in
      the menu, languages are in the footer) so the header no longer overflows
- [x] Add an English-only `/changelog` page (`app/(en)/changelog/page.tsx`) built from the app's
      GitHub releases (`lib/changelog.ts`), refreshed hourly, with a checked-in fallback snapshot in
      `content/changelog.json` (`pnpm changelog` refreshes it). Linked from the header, the footer,
      the download page and the sitemap
