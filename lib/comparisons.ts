export type Comparison = {
  slug: string;
  competitor: string;
  title: string;
  description: string;
  h1: string;
  subheadline: string;
  competitorSummary: string;
  competitorStrengths: string[];
  scribbbleStrengths: string[];
  whenToChooseScribbble: string[];
  whenToChooseCompetitor: string[];
  table: { feature: string; scribbble: string; competitor: string }[];
  pricing: { scribbble: string; competitor: string };
  faq: { q: string; a: string }[];
};

export const comparisons: Comparison[] = [
  {
    slug: "zoomit",
    competitor: "ZoomIt",
    title: "ZoomIt for Mac vs Scribbble — Which Should You Pick in 2026?",
    description:
      "Microsoft ZoomIt now runs on macOS, but the UI is still a Windows port. Here's an honest side-by-side with Scribbble — features, pricing and when to pick each.",
    h1: "Scribbble vs ZoomIt",
    subheadline:
      "ZoomIt is a beloved Sysinternals utility from the Windows world (with a recent macOS release). Scribbble is a Mac-first app focused purely on drawing on the screen, with a modern UI.",
    competitorSummary:
      "ZoomIt is a free annotation, zoom and break-timer utility from Microsoft Sysinternals. It originated on Windows and Microsoft has since released a macOS build. Its strength is its zero-friction hotkeys and the integrated zoom feature.",
    competitorStrengths: [
      "Free from Microsoft",
      "Built-in screen zoom and break timer",
      "Familiar to long-time Sysinternals users",
    ],
    scribbbleStrengths: [
      "Built Mac-first with a modern, drag-friendly toolbar",
      "Apple Silicon native",
      "Includes Spotlight (focus dim), Highlighter and Measure tools out of the box",
      "Designed around screen-share, streaming and recording workflows",
      "Lightweight focus on drawing, no extra utilities to learn",
    ],
    whenToChooseScribbble: [
      "You want a modern, Mac-native UI rather than a ported sysadmin utility",
      "Drawing on screen is your primary need — not zoom or timers",
      "You prefer a one-time licensed app with active design polish",
    ],
    whenToChooseCompetitor: [
      "You specifically want ZoomIt's zoom and break-timer features",
      "You're already standardized on Sysinternals tools",
    ],
    table: [
      { feature: "macOS support", scribbble: "Yes (Mac-first)", competitor: "Yes (recent port)" },
      { feature: "Apple Silicon native", scribbble: "Yes", competitor: "Yes" },
      { feature: "Pen tool", scribbble: "Yes", competitor: "Yes" },
      { feature: "Highlighter", scribbble: "Yes", competitor: "Limited" },
      { feature: "Arrow / Rectangle / Text", scribbble: "Yes", competitor: "Yes" },
      { feature: "Spotlight (focus dim)", scribbble: "Yes", competitor: "No" },
      { feature: "Measure tool", scribbble: "Yes", competitor: "No" },
      { feature: "Built-in screen zoom", scribbble: "No", competitor: "Yes" },
      { feature: "Break timer", scribbble: "No", competitor: "Yes" },
      { feature: "Modern Mac-style UI", scribbble: "Yes", competitor: "Sysinternals utility style" },
    ],
    pricing: {
      scribbble: "Free download. Optional one-time license.",
      competitor: "Free.",
    },
    faq: [
      {
        q: "Is there a ZoomIt for Mac?",
        a: "Yes — Microsoft has released a macOS build of ZoomIt. Scribbble is an alternative built Mac-first, focused purely on drawing on the screen with a modern UI rather than the classic Sysinternals utility look.",
      },
      {
        q: "Does Scribbble include a zoom feature like ZoomIt?",
        a: "No. Scribbble is focused exclusively on annotation. If screen zoom is critical to your workflow, ZoomIt or macOS's built-in Zoom accessibility feature may be a better fit.",
      },
    ],
  },
  {
    slug: "presentify",
    competitor: "Presentify",
    title: "Scribbble vs Presentify — Mac Annotation Apps Compared (2026)",
    description:
      "Looking for a Presentify alternative on Mac? Scribbble offers free download, a Measure tool and a companion screenshot annotator. Honest side-by-side comparison.",
    h1: "Scribbble vs Presentify",
    subheadline:
      "Both are Mac-native screen annotation apps with one-time pricing, floating toolbars, highlighter and spotlight. Here's how they actually differ.",
    competitorSummary:
      "Presentify is a popular macOS screen annotation app. It offers on-screen drawing tools including a highlighter and spotlight, a floating/movable toolbar, and a cursor-highlight feature. It's distributed both via the Mac App Store and directly, and uses a one-time purchase model.",
    competitorStrengths: [
      "Cursor highlight feature",
      "Mature, established Mac app",
      "Available on the Mac App Store and direct download",
    ],
    scribbbleStrengths: [
      "Free to download and try before buying",
      "Includes a Measure tool out of the box",
      "Companion free Screenshot Annotate web tool for static markup",
      "Active design polish and frequent updates",
    ],
    whenToChooseScribbble: [
      "You want to try the full app for free before buying a license",
      "A measure tool is part of your workflow",
      "You also want a companion free screenshot annotation tool",
    ],
    whenToChooseCompetitor: [
      "Cursor highlighting is a must-have for your workflow",
      "You prefer a long-established app on the Mac App Store",
    ],
    table: [
      { feature: "Pricing model", scribbble: "One-time license", competitor: "One-time" },
      { feature: "Pen / Arrow / Rectangle / Text", scribbble: "Yes", competitor: "Yes" },
      { feature: "Highlighter", scribbble: "Yes", competitor: "Yes" },
      { feature: "Spotlight (focus dim)", scribbble: "Yes", competitor: "Yes" },
      { feature: "Floating / movable toolbar", scribbble: "Yes", competitor: "Yes" },
      { feature: "Measure tool", scribbble: "Yes", competitor: "No" },
      { feature: "Cursor highlight", scribbble: "No", competitor: "Yes" },
      { feature: "Free download to try", scribbble: "Yes", competitor: "Limited trial" },
      { feature: "Distribution", scribbble: "Direct download", competitor: "Mac App Store & direct" },
      { feature: "Companion screenshot annotator", scribbble: "Yes (free web tool)", competitor: "No" },
    ],
    pricing: {
      scribbble: "Free download. One-time license unlocks everything.",
      competitor: "One-time purchase (Mac App Store or direct).",
    },
    faq: [
      {
        q: "Is Scribbble a Presentify alternative?",
        a: "Yes — both are Mac screen annotation apps with one-time pricing, highlighter, spotlight and a floating toolbar. The main differences: Scribbble can be downloaded and tried for free before licensing, includes a Measure tool, and ships with a companion free Screenshot Annotate web tool. Presentify's standout feature is its cursor highlight.",
      },
      {
        q: "Do both apps use one-time pricing?",
        a: "Yes — neither Scribbble nor Presentify uses a subscription. Both are one-time purchases.",
      },
      {
        q: "Does Presentify have a highlighter and spotlight?",
        a: "Yes. Presentify includes a highlighter (separate from its cursor-highlight feature) and a spotlight tool, alongside a floating/movable toolbar. Scribbble offers the same set, plus a Measure tool.",
      },
    ],
  },
  {
    slug: "cleanshot-x",
    competitor: "CleanShot X",
    title: "Scribbble vs CleanShot X — Live Drawing vs Screenshot Markup",
    description:
      "CleanShot X is best for capture → annotate → share. Scribbble draws on the live screen during Zoom, OBS and recordings. Here's when to use which (or both).",
    h1: "Scribbble vs CleanShot X",
    subheadline:
      "CleanShot X is a screenshot powerhouse. Scribbble focuses on drawing on the live screen. They're complementary, but here's how to choose.",
    competitorSummary:
      "CleanShot X is an all-in-one screenshot and screen recording app for macOS. It includes annotation tools — but only after you've captured a screenshot.",
    competitorStrengths: [
      "Best-in-class screenshot capture",
      "Cloud upload and shareable links",
      "Scrolling capture",
      "Screen recording with annotations",
    ],
    scribbbleStrengths: [
      "Annotates the LIVE screen — not just captured images",
      "Works during Zoom calls, OBS streams and screen recordings",
      "Includes Spotlight, Highlighter and Measure tools for live presentations",
      "Lighter weight, single-purpose tool",
      "More affordable for users who only need live annotation",
      "Includes a free Screenshot Annotate web tool for static markup with blur, depth-of-field and numbered markers",
    ],
    whenToChooseScribbble: [
      "You annotate during live presentations, calls or streams",
      "You want drawings to appear on the actual live screen, not just on a saved screenshot",
      "You don't need cloud sharing, screen recording or scrolling capture",
    ],
    whenToChooseCompetitor: [
      "Your main workflow is capture → annotate → share",
      "You need cloud links, scrolling capture or video screen recording",
    ],
    table: [
      { feature: "Live on-screen annotation", scribbble: "Yes", competitor: "Limited" },
      { feature: "Spotlight (focus dim)", scribbble: "Yes", competitor: "No" },
      { feature: "Measure tool", scribbble: "Yes", competitor: "No" },
      { feature: "Highlighter", scribbble: "Yes", competitor: "Yes" },
      { feature: "Screenshot annotation", scribbble: "Yes (free companion web tool)", competitor: "Yes" },
      { feature: "Screen recording", scribbble: "No", competitor: "Yes" },
      { feature: "Cloud upload & shareable links", scribbble: "No", competitor: "Yes" },
      { feature: "Scrolling capture", scribbble: "No", competitor: "Yes" },
      { feature: "Pricing", scribbble: "One-time", competitor: "One-time or subscription" },
    ],
    pricing: {
      scribbble: "Free download with optional one-time license.",
      competitor: "Paid (one-time or subscription via Setapp).",
    },
    faq: [
      {
        q: "Can I use Scribbble and CleanShot X together?",
        a: "Yes — many users do. CleanShot for capture and async sharing, Scribbble for drawing on the live screen during calls and presentations.",
      },
    ],
  },
  {
    slug: "epic-pen",
    competitor: "Epic Pen",
    title: "Epic Pen for Mac? Scribbble Is the Best Mac Alternative (2026)",
    description:
      "Epic Pen is Windows-only. Scribbble is the closest Mac-native alternative — pen, highlighter, spotlight and measure tools. Free download. Side-by-side comparison.",
    h1: "Scribbble vs Epic Pen: a Mac-native option",
    subheadline:
      "Epic Pen is a well-known screen marker — but it's Windows-first. Scribbble is built specifically for macOS.",
    competitorSummary:
      "Epic Pen is a screen annotation tool primarily designed for Windows users. It lets you draw and highlight over any application during presentations and lessons.",
    competitorStrengths: [
      "Established Windows user base",
      "Free tier available",
      "Familiar UI for Windows presenters",
    ],
    scribbbleStrengths: [
      "Native macOS — Apple Silicon optimized",
      "Designed around modern Mac shortcuts and a draggable floating toolbar",
      "Includes Spotlight, Highlighter and Measure tools",
      "Lightweight and fast",
      "Companion free Screenshot Annotate web tool for static markup",
    ],
    whenToChooseScribbble: [
      "You're on macOS",
      "You want a modern Mac-native experience",
      "You prefer a one-time license over a freemium tier system",
    ],
    whenToChooseCompetitor: [
      "You're on Windows and already comfortable with Epic Pen",
    ],
    table: [
      { feature: "macOS native", scribbble: "Yes", competitor: "No / limited" },
      { feature: "Pen / Highlighter", scribbble: "Yes", competitor: "Yes" },
      { feature: "Shapes & Text", scribbble: "Yes", competitor: "Yes (Pro)" },
      { feature: "Spotlight (focus dim)", scribbble: "Yes", competitor: "No" },
      { feature: "Measure tool", scribbble: "Yes", competitor: "No" },
      { feature: "Apple Silicon", scribbble: "Yes", competitor: "—" },
      { feature: "Modern draggable toolbar", scribbble: "Yes", competitor: "Classic UI" },
    ],
    pricing: {
      scribbble: "Free download with one-time license.",
      competitor: "Free + paid Pro tier.",
    },
    faq: [
      {
        q: "Is there an Epic Pen for Mac?",
        a: "Epic Pen is Windows-focused. For a true Mac-native alternative with the same screen drawing workflow, Scribbble is the closest match.",
      },
    ],
  },
  {
    slug: "annotate",
    competitor: "Annotate",
    title: "Scribbble vs Annotate for Mac — Live Screen Drawing Compared",
    description:
      "Annotate is built for screenshot markup. Scribbble draws on the live Mac screen during Zoom, OBS and recordings. Honest comparison + when to pick each.",
    h1: "Scribbble vs Annotate",
    subheadline:
      "Annotate is a capable Mac markup tool focused on screenshots and recordings. Scribbble is focused on drawing on the live screen.",
    competitorSummary:
      "Annotate is a Mac app for capturing screenshots, marking them up and sharing them. It's strong on the capture-and-edit workflow.",
    competitorStrengths: [
      "Polished screenshot markup workflow",
      "Sharing and team features",
      "Established Mac App Store app",
    ],
    scribbbleStrengths: [
      "Annotates the live screen during calls and presentations",
      "Includes Spotlight, Highlighter and Measure tools",
      "Companion free Screenshot Annotate web tool (no signup)",
      "One-time license",
      "Modern Apple Silicon-native build",
    ],
    whenToChooseScribbble: [
      "You annotate during live screen shares (Zoom, Meet, OBS)",
      "You also want a free, no-signup screenshot annotation tool",
      "You prefer one-time pricing and a focused single-purpose app",
    ],
    whenToChooseCompetitor: [
      "Your team needs collaborative markup features and shared workspaces",
    ],
    table: [
      { feature: "Live screen annotation", scribbble: "Yes", competitor: "No" },
      { feature: "Spotlight (focus dim)", scribbble: "Yes", competitor: "No" },
      { feature: "Highlighter", scribbble: "Yes", competitor: "Yes" },
      { feature: "Measure tool", scribbble: "Yes", competitor: "No" },
      { feature: "Screenshot annotation", scribbble: "Yes (free web tool)", competitor: "Yes" },
      { feature: "Team collaboration", scribbble: "No", competitor: "Yes" },
      { feature: "Free screenshot tool online", scribbble: "Yes", competitor: "No" },
    ],
    pricing: {
      scribbble: "Free download. One-time license.",
      competitor: "Varies — check vendor.",
    },
    faq: [
      {
        q: "Which is better for live presentations?",
        a: "Scribbble. It draws on top of the actual screen in real time, so anything Zoom, OBS or QuickTime captures will include your annotations.",
      },
    ],
  },
];

export const comparisonSlugs = comparisons.map((c) => c.slug);
export const getComparison = (slug: string) =>
  comparisons.find((c) => c.slug === slug);
