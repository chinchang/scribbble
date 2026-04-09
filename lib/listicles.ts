export type ListicleItem = {
  rank: number;
  name: string;
  tagline: string;
  summary: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  pricing: string;
  isScribbble?: boolean;
  vsSlug?: string; // links to /vs/[slug] if exists
  externalUrl?: string;
};

export type Listicle = {
  slug: string;
  title: string; // SEO title
  description: string; // meta description
  h1: string;
  intro: string;
  criteria: string[]; // how we picked
  items: ListicleItem[];
  conclusion: string;
  faq: { q: string; a: string }[];
};

export const listicles: Listicle[] = [
  {
    slug: "best-screen-annotation-apps-mac",
    title: "5 Best Screen Annotation Apps for Mac (2026)",
    description:
      "An honest, hands-on roundup of the best screen annotation and drawing apps for macOS — for teachers, presenters, streamers and designers.",
    h1: "The Best Screen Annotation Apps for Mac",
    intro:
      "Screen annotation apps let you draw, highlight and mark up directly on top of your Mac screen — over slides, browsers, Figma, Zoom shares, anything. They're indispensable for teachers, presenters, software demoers, streamers and designers running live crits. Below is an honest, hands-on roundup of the apps worth considering on macOS in 2026.",
    criteria: [
      "Native macOS support (Apple Silicon a plus)",
      "Real on-screen drawing — not just screenshot markup",
      "Active development and support",
      "Reasonable pricing model",
      "Tool variety beyond just a pen",
    ],
    items: [
      {
        rank: 1,
        name: "Scribbble",
        tagline: "The modern Mac-first screen annotation app",
        summary:
          "Scribbble is built Mac-first with a draggable, modern floating toolbar. Beyond the standard pen, arrow, rectangle and text tools, it ships with Spotlight (focus dim), Highlighter and Measure — a combination most competitors don't match. It's free to download and try, with a one-time license to unlock everything.",
        bestFor:
          "Teachers, designers and creators who want a modern, Mac-native annotation tool without a subscription",
        pros: [
          "Mac-first design with a modern, draggable toolbar",
          "Includes Spotlight, Highlighter and Measure out of the box",
          "Apple Silicon native",
          "Free to download and try",
          "One-time license, no subscription",
          "Companion free Screenshot Annotate web tool",
        ],
        cons: [
          "No built-in screen recording",
          "No screen zoom (use macOS accessibility zoom)",
        ],
        pricing: "Free + one-time license",
        isScribbble: true,
      },
      {
        rank: 2,
        name: "Presentify",
        tagline: "Mac App Store classic with cursor highlighting",
        summary:
          "Presentify is a long-standing macOS annotation app available on the Mac App Store. Its standout feature is cursor highlighting, which makes the mouse pointer impossible to lose during presentations. It uses a one-time purchase model.",
        bestFor:
          "Presenters who need a prominent cursor highlight alongside drawing",
        pros: [
          "Established Mac App Store presence",
          "Cursor highlight feature",
          "One-time purchase",
        ],
        cons: [
          "No Spotlight, Measure or built-in companion screenshot tool",
          "Limited free trial",
        ],
        pricing: "One-time (Mac App Store)",
        vsSlug: "presentify",
      },
      {
        rank: 3,
        name: "CleanShot X",
        tagline: "Screenshot powerhouse with annotation built in",
        summary:
          "CleanShot X is a complete screenshot and screen recording suite for Mac. Its annotation tools are excellent — but they primarily run after capture, not on the live screen. If your workflow is capture → annotate → share, it's superb. For live drawing during a Zoom call, you'll want a dedicated tool.",
        bestFor:
          "Power users whose main workflow is capture → annotate → share",
        pros: [
          "Best-in-class screenshot capture",
          "Cloud upload and shareable links",
          "Scrolling capture and screen recording",
          "Strong screenshot annotation tools",
        ],
        cons: [
          "Live on-screen annotation is limited",
          "More expensive — does much more than annotation",
        ],
        pricing: "One-time or via Setapp subscription",
        vsSlug: "cleanshot-x",
      },
      {
        rank: 4,
        name: "ZoomIt",
        tagline: "Microsoft Sysinternals' classic, now on Mac",
        summary:
          "ZoomIt is the legendary screen annotation and zoom utility from Microsoft Sysinternals. Originally Windows-only, Microsoft has since released a macOS build. It's free and includes a built-in screen zoom and break timer that no other tool matches — but the UI is unmistakably a sysadmin utility port.",
        bestFor:
          "Sysadmin-style users who specifically need ZoomIt's screen zoom and break timer",
        pros: [
          "Free from Microsoft",
          "Built-in zoom and break timer",
          "Now available on macOS",
        ],
        cons: [
          "UI is a Windows utility port, not Mac-style",
          "No Spotlight, Measure or modern toolbar",
        ],
        pricing: "Free",
        vsSlug: "zoomit",
      },
      {
        rank: 5,
        name: "Annotate",
        tagline: "Team-oriented Mac markup app",
        summary:
          "Annotate is a Mac app focused on capturing screenshots and marking them up for team sharing. It's stronger on the async, team-collaboration workflow than on live on-screen drawing during a presentation or call.",
        bestFor:
          "Teams that need shared workspaces and collaborative markup",
        pros: [
          "Polished screenshot markup workflow",
          "Sharing and team features",
        ],
        cons: [
          "Not designed for live screen annotation",
          "Pricing depends on plan",
        ],
        pricing: "Varies — check vendor",
        vsSlug: "annotate",
      },
    ],
    conclusion:
      "If you want a modern, Mac-native screen annotation app with a rich toolset (Spotlight, Highlighter, Measure) and one-time pricing, Scribbble is the easiest recommendation. Presentify is the alternative if cursor highlighting is critical. CleanShot X is the right choice if your workflow centers on screenshots rather than live drawing. ZoomIt is the free Microsoft option if you need its signature zoom feature.",
    faq: [
      {
        q: "What's the best free screen annotation app for Mac?",
        a: "ZoomIt is fully free and now runs on macOS. Scribbble is also free to download and try, with an optional one-time license to unlock everything.",
      },
      {
        q: "Can I draw on my screen during a Zoom call?",
        a: "Yes — any of the apps on this list except CleanShot X is designed for live on-screen annotation that appears in a Zoom share. Scribbble and Presentify are the most polished options.",
      },
      {
        q: "Do I need to buy a license to try these apps?",
        a: "Scribbble and ZoomIt let you use the app without buying. Presentify offers a limited trial. CleanShot X has a trial as well.",
      },
    ],
  },

  {
    slug: "best-zoomit-alternatives-mac",
    title: "5 Best ZoomIt Alternatives for Mac (2026)",
    description:
      "Looking for a ZoomIt alternative on macOS? These 5 Mac-native screen annotation apps offer a more modern UI, richer toolsets and a better Mac experience.",
    h1: "The Best ZoomIt Alternatives for Mac",
    intro:
      "Microsoft's ZoomIt is a classic screen annotation utility from the Sysinternals suite. It's now available on macOS — but the UI is a faithful Windows utility port, and it lacks modern conveniences like a draggable toolbar, Spotlight focus mode, or measure tools. If you're on a Mac and want a more native, modern alternative, here are the best options.",
    criteria: [
      "Mac-native experience (not a Windows utility port)",
      "Active development",
      "Tool variety beyond pen and zoom",
      "Reasonable pricing",
    ],
    items: [
      {
        rank: 1,
        name: "Scribbble",
        tagline: "The Mac-first ZoomIt alternative",
        summary:
          "Scribbble is built Mac-first with a modern, draggable floating toolbar and a richer toolset than ZoomIt — including Spotlight (focus dim), Highlighter and Measure. It's free to download and ships with a companion free Screenshot Annotate web tool. The trade-off: no screen zoom feature (use macOS's built-in accessibility zoom for that).",
        bestFor:
          "Anyone leaving ZoomIt who wants a modern Mac-native experience",
        pros: [
          "Mac-first UI with modern toolbar",
          "Spotlight, Highlighter and Measure tools",
          "Free download, one-time license",
          "Apple Silicon native",
        ],
        cons: ["No screen zoom feature"],
        pricing: "Free + one-time license",
        isScribbble: true,
      },
      {
        rank: 2,
        name: "Presentify",
        tagline: "Mac App Store annotation classic",
        summary:
          "Presentify covers the basics ZoomIt users miss: pen, shapes, text, and a strong cursor highlight feature. It's a one-time purchase via the Mac App Store.",
        bestFor:
          "Presenters who care most about cursor visibility on shared screens",
        pros: [
          "Cursor highlight",
          "One-time purchase",
          "Mac App Store distribution",
        ],
        cons: [
          "No measure tool, no spotlight focus mode",
        ],
        pricing: "One-time (Mac App Store)",
        vsSlug: "presentify",
      },
      {
        rank: 3,
        name: "CleanShot X",
        tagline: "If your real need is screenshots + annotation",
        summary:
          "Many people who reach for ZoomIt actually want to capture and share annotated screenshots, not draw on the live screen. CleanShot X is the best Mac app for that workflow.",
        bestFor:
          "Workflows that are capture-first rather than live presentations",
        pros: [
          "Excellent screenshot capture",
          "Cloud sharing built in",
          "Recording with annotations",
        ],
        cons: ["Live on-screen drawing is limited"],
        pricing: "One-time or via Setapp",
        vsSlug: "cleanshot-x",
      },
      {
        rank: 4,
        name: "Annotate",
        tagline: "Team-collaboration markup",
        summary:
          "If you need shared workspaces and team markup, Annotate is built around that workflow rather than live drawing.",
        bestFor: "Teams sharing screenshots back and forth",
        pros: ["Team and sharing features"],
        cons: ["Not designed for live screen drawing"],
        pricing: "Varies",
        vsSlug: "annotate",
      },
      {
        rank: 5,
        name: "macOS built-in tools",
        tagline: "Free, already installed",
        summary:
          "If your needs are minimal, macOS itself includes accessibility Zoom (Cmd+Option+8) and screenshot markup via Preview. They're not a real annotation app, but they're free and require no install.",
        bestFor: "Ultra-light needs where you'd rather not install anything",
        pros: ["Already installed", "Free"],
        cons: [
          "No live on-screen drawing",
          "No proper toolset",
        ],
        pricing: "Free",
      },
    ],
    conclusion:
      "Scribbble is the closest spiritual successor to ZoomIt for Mac users — a focused, lightweight annotation tool with a modern Mac-native UI, plus a richer toolset (Spotlight, Highlighter, Measure). If ZoomIt's signature zoom feature is what you'll miss, pair Scribbble with macOS's built-in accessibility zoom and you'll have everything covered.",
    faq: [
      {
        q: "Is there a true ZoomIt for Mac?",
        a: "Yes — Microsoft has released a macOS build of ZoomIt. It works, but the UI is a Windows utility port. For a more native Mac experience, Scribbble is the closest modern alternative.",
      },
      {
        q: "How do I get ZoomIt's zoom feature on Mac?",
        a: "macOS has built-in screen zoom in System Settings → Accessibility → Zoom. Enable Cmd+Option+8 to toggle, or scroll-zoom with Ctrl+scroll. Pair this with Scribbble for annotation and you have a full ZoomIt replacement.",
      },
    ],
  },

  {
    slug: "best-screen-annotation-tools-for-teachers",
    title: "Best Screen Annotation Tools for Teachers on Mac (2026)",
    description:
      "The best screen annotation apps for teachers using Mac — for live Zoom lessons, recorded lectures and 1-on-1 tutoring.",
    h1: "The Best Screen Annotation Tools for Teachers on Mac",
    intro:
      "Teachers using Mac for online lessons, recorded lectures or tutoring need a way to mark up the screen in real time — circling vocabulary, sketching diagrams, highlighting reading passages. A real annotation tool keeps students focused without breaking out of your existing slides or browser. Here are the best options on macOS.",
    criteria: [
      "Works during Zoom, Google Meet and other screen shares",
      "Annotations appear in screen recordings (QuickTime, Loom)",
      "Easy to use mid-lesson without losing flow",
      "Affordable for educators",
    ],
    items: [
      {
        rank: 1,
        name: "Scribbble",
        tagline: "Modern Mac annotation app, made for live lessons",
        summary:
          "Scribbble draws on top of any Mac app — slides, PDFs, browsers, Zoom shares. The Highlighter is great for marking up readings; Spotlight dims everything except what you're explaining; the pen, arrow, rectangle and text tools cover live diagramming. One-time license, free to try.",
        bestFor:
          "Teachers who want a modern, Mac-native tool with Highlighter and Spotlight built in",
        pros: [
          "Highlighter and Spotlight (focus dim) built in",
          "Works in Zoom, Google Meet, recordings",
          "Free to download and try",
          "One-time license",
        ],
        cons: ["No collaborative whiteboard mode"],
        pricing: "Free + one-time license",
        isScribbble: true,
      },
      {
        rank: 2,
        name: "Presentify",
        tagline: "Strong cursor highlighting for online classes",
        summary:
          "If your students often lose track of your cursor on a shared screen, Presentify's cursor highlight feature is the strongest in the category. Standard pen and shape tools alongside it.",
        bestFor:
          "Teachers whose biggest issue is students losing the mouse pointer",
        pros: ["Best-in-class cursor highlight", "Mac App Store"],
        cons: ["No spotlight focus mode or measure tool"],
        pricing: "One-time",
        vsSlug: "presentify",
      },
      {
        rank: 3,
        name: "ZoomIt for Mac",
        tagline: "Free, with built-in screen zoom",
        summary:
          "Microsoft's ZoomIt is now available on macOS. Its built-in screen zoom is genuinely useful for showing fine detail in slides or code to a large remote class — and it's free.",
        bestFor: "Teachers who specifically want screen zoom for showing detail",
        pros: ["Free", "Built-in zoom and break timer"],
        cons: [
          "UI is a Windows utility port",
          "No spotlight or measure",
        ],
        pricing: "Free",
        vsSlug: "zoomit",
      },
      {
        rank: 4,
        name: "CleanShot X",
        tagline: "For teachers focused on lesson recordings",
        summary:
          "If you spend more time recording lessons than presenting them live, CleanShot X is excellent — it captures, annotates and records all in one app.",
        bestFor: "Teachers building recorded lesson libraries",
        pros: ["Screen recording with annotations", "Cloud sharing"],
        cons: ["Limited live on-screen drawing"],
        pricing: "One-time or Setapp",
        vsSlug: "cleanshot-x",
      },
    ],
    conclusion:
      "For most teachers running live or recorded Mac-based lessons, Scribbble is the best balance of price, features and ease of use — the Highlighter and Spotlight tools in particular are a great fit for keeping students focused. If your specific challenge is cursor visibility, Presentify is worth a look. If you mainly record lessons rather than present live, CleanShot X may suit you better.",
    faq: [
      {
        q: "Will my annotations show up when I record with QuickTime or Loom?",
        a: "Yes. All the apps in this list (with the exception of CleanShot X's screenshot mode) draw at the OS level, so any screen recorder captures the annotations as part of the screen.",
      },
      {
        q: "Can I use these apps in Zoom and Google Meet lessons?",
        a: "Yes. Because the annotations are drawn on the actual screen, anything you share via Zoom, Meet, Webex or Teams will include them.",
      },
      {
        q: "Are there discounts for educators?",
        a: "Reach out to each developer directly — many independent Mac app developers, including Scribbble, are willing to help teachers and schools with bulk licensing.",
      },
    ],
  },
];

export const listicleSlugs = listicles.map((l) => l.slug);
export const getListicle = (slug: string) =>
  listicles.find((l) => l.slug === slug);
