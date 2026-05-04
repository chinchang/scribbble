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
- [ ] Add 301 redirect from `scribbble.app` → `www.scribbble.app` at host/Vercel level (canonical tags alone aren't consolidating both versions in Google's index)
- [ ] In Search Console, verify both hosts, set preferred property, and request reindex on `/`, `/best/best-screen-annotation-apps-mac`, `/for/*`, `/vs/*`

P1 — CTR fixes on pages already getting impressions
- [x] Rewrite title + meta description for `/best/best-screen-annotation-apps-mac` (5K imp, only 2.1% CTR — biggest single lever)
- [x] Rewrite titles + descriptions for `/for/teachers`, `/for/streamers`, `/for/designers`, `/for/youtubers` (all <1% CTR despite 200–400 imp each)
- [x] Rewrite titles + descriptions for `/vs/epic-pen` and `/vs/zoomit` (high impressions, <1% CTR)
- [x] Tweak homepage meta description to gently capture brand misspellings (scrible, scribble, scrble — 30+ unique typos in queries)

P2 — New content for proven-demand gaps
- [x] Add `/best/best-epic-pen-alternatives-mac` listicle (5+ on-theme queries, multiple at page-1 positions)
- [x] Add `/best/best-presentify-alternatives-mac` listicle (3 on-theme queries)
- [x] Add `/vs/zoomit-vs-epic-pen` third-party comparison page (50+ impressions across "zoomit vs epic pen" variants — no page owns this)
- [x] Add a FAQ section (or `/faq` page) with conversational Q&A targeting AI-Overview-style queries: "Why do people choose Zoomit over Epic Pen?", "What are the best alternatives to Epic Pen?", "What features do Epic Pen alternatives offer?" — wrap in `FAQPage` JSON-LD

P3 — Lift the core "screen annotation" cluster (currently pos 5–9)
- [x] Strengthen homepage on-page targeting for `screen annotation tool mac`, `mac screen annotation`, `annotation app for mac` (H2s, subhead, internal links from `/best/*` and `/for/*` with these anchors)
- [x] Improve `/tools/screenshot-annotate` for `mac image annotation tool` / `mac screenshot annotation tool` (currently pos 34 — needs stronger H1, FAQ, and feature list)

P4 — Internal linking + structured data
- [ ] Add a "Related pages" footer block cross-linking `/for/*`, `/vs/*`, and `/best/*` pages
- [ ] Add breadcrumbs with `BreadcrumbList` JSON-LD on `/for/*`, `/vs/*`, `/best/*`
