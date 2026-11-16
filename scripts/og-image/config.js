// Every tunable for the Open Graph image lives here. Edit, then run
// `bash scripts/og-image/render.sh` to regenerate public/og.png.
window.OG_CONFIG = {
  // Canvas size (the OG standard) and the device scale it is rendered at
  // before being downsampled, for crisper edges.
  size: { width: 1200, height: 630 },

  // Palette
  colors: {
    paper: "#FFF6EA", // page background
    paperDot: "rgba(120, 84, 40, 0.13)", // dot-grid dots
    ink: "#17151F", // headline + body text
    inkSoft: "#5B5566", // secondary text
    brand: "#059669", // site emerald
    brandBright: "#10B981",
    coral: "#FF4F3F", // marker circle / arrows
    yellow: "#FFD233", // highlighter
    blue: "#2F6BFF", // secondary marker
    window: "#FFFFFF",
    toolbar: "#1C1C20",
    toolbarActive: "#1F4B8F",
    glowA: "rgba(16, 185, 129, 0.16)", // soft background glows
    glowB: "rgba(255, 120, 60, 0.20)",
    // The coloured "screen" panel on the right
    panelFrom: "#13C38B",
    panelMid: "#0AA39C",
    panelTo: "#2563EB",
    panelGlow: "rgba(255, 255, 255, 0.22)",
    panelDot: "rgba(255, 255, 255, 0.16)",
    onPanel: "#FFFFFF", // handwriting + arrow drawn on the panel
  },

  // Background dot grid
  dots: { gap: 26, radius: 1.4 },

  // Text
  copy: {
    brand: "Scribbble",
    brandTag: "for macOS",
    // Each entry is one headline line. Words wrapped in [hl], [circle] or
    // [squiggle] get that annotation drawn on them.
    headline: ["[squiggle]Draw[/squiggle] over", "[hl]anything[/hl] on", "your [circle]Mac.[/circle]"],
    sub: "One hotkey. Draw on any app. Clear in a flash.",
    chips: ["Free to try", "Pay once, use forever", "macOS 14+"],
    url: "scribbble.app",
    note: "press & draw!",
    hotkey: ["⌥ Option", "Tab"],
    chartTitle: "Weekly signups",
    chartNote: "record week!",
  },

  // Typography
  type: {
    headlineSize: 92, // px
    headlineLeading: 1.02,
    headlineTracking: -0.035, // em
    subSize: 25,
    noteSize: 40, // handwritten notes
    brandSize: 34,
  },

  // Layout (px from top-left of the canvas)
  layout: {
    padX: 64,
    brandTop: 46,
    headlineTop: 132,
    subTop: 455,
    chipsTop: 524,
    // Coloured screen panel, bleeds off the right edge
    panel: { x: 712, inset: 22, radius: 28 },
    // The mock app window on the panel
    window: { x: 746, y: 78, w: 350, h: 290, rotate: 3 },
    // The Scribbble toolbar docked at the right edge (vertically centred)
    toolbar: { right: 22, button: 38, iconSize: 20, gap: 2 },
    // The hotkey note (keycaps + handwriting) under the window
    hotkey: { x: 752, y: 430 },
  },

  // Hand-drawn annotation strokes
  strokes: {
    circleWidth: 6,
    circlePadX: 20, // how far the circle extends past the word
    circlePadY: 10,
    circleOvershoot: 0.55, // radians the loop runs past a full turn
    circleWobble: 0.05, // radius noise, fraction of radius
    highlightOpacity: 0.85,
    highlightHeight: 0.46, // fraction of headline size
    highlightRough: 3, // edge jitter in px
    highlightTilt: -1.2, // degrees
    squiggleWidth: 6,
    squiggleAmp: 6,
    squiggleWaves: 4.5,
    arrowWidth: 5,
    burstWidth: 5, // the little "!" burst next to the circled word
    burstLength: 22,
    seed: 7, // jitter seed, change for a different hand
  },
};
