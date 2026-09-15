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
      mimics a macOS desktop: aurora wallpaper (`public/demo-wallpaper.jpg`), menu bar with system tray,
      dock, a mock document window, and Scribbble's vertical toolbar on the right (color swatch, stroke
      dot, pen, rectangle, highlighter, measure, spotlight, magnify, text, whiteboard, auto-fade,
      snapshot, clear, hide, close). A dummy cursor loops forever: it clicks each tool in toolbar order
      and demos it on the desktop (hand-drawn pen strokes, rectangle drag, highlighter, pixel measure,
      spotlight follow, magnifier lens, typed text, whiteboard sketch, auto-fading strokes, snapshot
      flash + thumbnail, hide/show, clear, close + reopen). rAF-driven, pauses when scrolled out of view
      or via a keyboard-accessible Pause button, static under `prefers-reduced-motion`. Copy lives in
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
      `home_bottom_cta`, `for_hero`, `for_bottom_cta`, `vs_hero`, `vs_bottom_cta`,
      `vs_third_party_verdict`, `best_list_item`, `best_bottom_cta`, `blog_post_cta`
- [x] Remove every em dash from the website copy (2026-09-12): rewrote ~220 English strings across
      `messages/en.json`, `lib/{personas,comparisons,listicles}.ts`, `lib/site-config.ts`, the
      screenshot-annotate page, blog pages and the pillar post; `scripts/translate.ts` now bans em
      dashes in its prompt, validates for them (retry, then locale-aware substitution) and all 969
      translated strings that contained one were re-translated. Verified 0 em dashes in the built HTML
