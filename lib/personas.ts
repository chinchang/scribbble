export type Persona = {
  slug: string;
  audience: string; // "Teachers"
  title: string; // SEO <title>
  description: string; // meta description
  h1: string;
  subheadline: string;
  painPoints: { title: string; body: string }[];
  workflows: { title: string; body: string }[];
  featuredTools: string[]; // which Scribbble tools matter most
  faq: { q: string; a: string }[];
};

export const personas: Persona[] = [
  {
    slug: "teachers",
    audience: "Teachers",
    title: "Screen Annotation App for Teachers — Draw on Screen | Scribbble",
    description:
      "Scribbble lets teachers draw, highlight and annotate directly on their Mac screen during live or recorded lessons. One-time price, zero setup.",
    h1: "The screen annotation app built for teachers",
    subheadline:
      "Mark up slides, websites, PDFs and Zoom shares in real time. Keep students focused on exactly what matters — without alt-tabbing into a separate whiteboard.",
    painPoints: [
      {
        title: "Switching to a whiteboard breaks the lesson flow",
        body: "Opening Jamboard or Miro mid-class loses student attention. Scribbble draws on top of whatever you already have open — slides, browsers, PDFs, code editors.",
      },
      {
        title: "Students can't tell what you're pointing at",
        body: "On a shared screen, a mouse pointer is invisible to half the class. Circle it, underline it, or draw an arrow — your emphasis is unmistakable on the recording too.",
      },
      {
        title: "Recording lessons means re-doing diagrams",
        body: "Sketch directly over your existing material instead of recreating diagrams in a separate app. Erase and redraw without leaving your slide.",
      },
    ],
    workflows: [
      {
        title: "Live Zoom / Google Meet lessons",
        body: "Share your screen, then press a hotkey to start drawing. Highlight key vocabulary in a reading, sketch a geometry proof on a slide, or annotate a student's submitted work in real time.",
      },
      {
        title: "Recorded lectures and Loom videos",
        body: "Use the pen and arrow tools while recording with QuickTime, Loom or ScreenStudio. Annotations are baked into the recording — no post-production needed.",
      },
      {
        title: "1-on-1 tutoring",
        body: "Walk through a problem on a shared whiteboard, PDF worksheet or website. Use different colors per concept so students can follow your thinking.",
      },
    ],
    featuredTools: [
      "Freehand pen for diagrams and underlines",
      "Highlighter to mark key passages in a reading or slide",
      "Spotlight to dim everything except the part you're explaining",
      "Arrow tool to direct attention",
      "Rectangle tool to box key concepts",
      "Text tool for vocabulary call-outs",
      "Quick-erase to keep slides clean",
    ],
    faq: [
      {
        q: "Does Scribbble work with Zoom and Google Meet?",
        a: "Yes. Scribbble draws on top of any app, including the screen-share preview from Zoom, Meet, Webex and Teams. Whatever your students see, they see your annotations.",
      },
      {
        q: "Will my annotations show up in QuickTime or Loom recordings?",
        a: "Yes. Because Scribbble draws at the OS level, every screen recorder captures the annotations as part of the screen.",
      },
      {
        q: "Is there a discount for educators?",
        a: "Reach out via the support link below — we're happy to help teachers and schools with bulk licensing.",
      },
    ],
  },
  {
    slug: "streamers",
    audience: "Streamers",
    title: "Screen Annotation for Streamers — Draw on Stream | Scribbble",
    description:
      "Scribbble lets Twitch and YouTube streamers draw, circle and highlight on their Mac screen live. Works with OBS, Streamlabs and any capture software.",
    h1: "Draw on your stream in real time",
    subheadline:
      "Circle the loot, sketch the strat, react to chat with arrows and doodles. Scribbble overlays directly on your screen so OBS captures every stroke.",
    painPoints: [
      {
        title: "Pointing at things on stream is awkward",
        body: "Your cursor is tiny on a downscaled stream. Drawing a quick circle keeps viewers oriented during fast-paced gameplay or react content.",
      },
      {
        title: "Browser-source overlays add latency and complexity",
        body: "Scribbble runs as a native Mac app — no browser source, no extra OBS scene, no audio routing weirdness.",
      },
    ],
    workflows: [
      {
        title: "Reaction streams and watch-alongs",
        body: "Highlight the part of the meme, draw eyebrows on the YouTuber, sketch out predictions during a sports clip.",
      },
      {
        title: "Coaching and educational gaming",
        body: "Pause the gameplay, draw the rotation, circle the enemy position. Perfect for VOD reviews and coaching streams.",
      },
      {
        title: "Just-chatting and product reviews",
        body: "Annotate websites, browse product specs and circle line items as you read them out loud.",
      },
    ],
    featuredTools: [
      "Pen tool with bright, stream-friendly colors",
      "Highlighter for emphasizing text on screen",
      "Spotlight to focus chat's eyes on one part of the gameplay",
      "Arrow tool for quick callouts",
      "Rectangle and text tools for overlays",
      "Quick-clear hotkey to wipe the screen between bits",
    ],
    faq: [
      {
        q: "Does Scribbble work with OBS and Streamlabs?",
        a: "Yes. Scribbble draws at the OS level so any screen-capture source — OBS, Streamlabs, Restream — picks up your annotations automatically.",
      },
      {
        q: "Will it slow down my game?",
        a: "Scribbble is a lightweight native Mac app and uses GPU acceleration for drawing. Performance impact is negligible.",
      },
    ],
  },
  {
    slug: "youtubers",
    audience: "YouTubers",
    title: "Screen Annotation for YouTubers — Tutorial Tool | Scribbble",
    description:
      "Add professional on-screen annotations to your YouTube tutorials and explainer videos. Scribbble draws on top of any Mac app — no editing needed.",
    h1: "The annotation tool for YouTube creators",
    subheadline:
      "Stop adding circles in post. Draw arrows, boxes and call-outs while you record — Scribbble bakes them right into the screen capture.",
    painPoints: [
      {
        title: "Adding callouts in Final Cut or Premiere is slow",
        body: "Every circle, arrow and highlight in post-production eats hours. Drawing live cuts your editing time dramatically.",
      },
      {
        title: "Re-recording when you point at the wrong thing",
        body: "With a real annotation tool you can erase and redraw mid-take instead of cutting the whole clip.",
      },
    ],
    workflows: [
      {
        title: "Software tutorials",
        body: "Walk through any Mac app — Figma, Photoshop, VS Code, Excel — circling buttons and drawing arrows as you narrate. The viewer's eye follows yours.",
      },
      {
        title: "Code walkthroughs",
        body: "Highlight specific lines, draw connections between functions, box off key blocks. Replaces the need for a second screen-recording layer.",
      },
      {
        title: "Comparison and review videos",
        body: "Side-by-side product comparisons with on-the-fly annotations. Use the rectangle tool to call out feature differences.",
      },
    ],
    featuredTools: [
      "Pen tool for freehand emphasis",
      "Highlighter for marking up code or text on screen",
      "Spotlight to dim everything except the part you're demonstrating",
      "Arrow tool for guided tours",
      "Rectangle and text for feature callouts",
      "Multiple colors to differentiate concepts",
      "Undo / redo so you can keep recording through small mistakes",
    ],
    faq: [
      {
        q: "Will the annotations be in my final video?",
        a: "Yes. Scribbble draws at the screen level, so anything ScreenFlow, Camtasia, Loom, ScreenStudio or QuickTime captures will include the annotations.",
      },
      {
        q: "Can I undo a stroke without restarting the recording?",
        a: "Yes — Scribbble has full undo / redo. Erase a mistake mid-take and keep rolling.",
      },
    ],
  },
  {
    slug: "designers",
    audience: "Designers",
    title: "Screen Annotation for Designers — Mark Up Anywhere | Scribbble",
    description:
      "Scribbble lets designers sketch, redline and annotate directly on top of Figma, browsers and design files on macOS. Perfect for crits and feedback.",
    h1: "Sketch and redline directly on your designs",
    subheadline:
      "Run design crits without exporting screenshots. Scribbble draws on top of Figma, the browser, your prototype — whatever you're reviewing — and lets you save the marked-up frame to clipboard.",
    painPoints: [
      {
        title: "Exporting → marking up → re-importing is friction",
        body: "Most feedback dies between Figma and another tool. Scribbble lets you draw the redline where you're already looking.",
      },
      {
        title: "Crits feel disconnected on Zoom",
        body: "Pointing at things with your mouse loses the audience. Drawing a circle while you talk keeps the conversation tight.",
      },
      {
        title: "Eyeballing pixel measurements wastes time",
        body: "Scribbble's Measure tool lets you check spacing, padding and component dimensions directly on screen — no exporting to a separate ruler app.",
      },
    ],
    workflows: [
      {
        title: "Live design crits",
        body: "On a Zoom share, walk through a Figma frame and circle issues as you go. The whole team sees your strokes in real time, no plugin or export step.",
      },
      {
        title: "Async feedback for engineers",
        body: "Need to share static markup? Pair the Scribbble Mac app with the free Screenshot Annotate web tool to capture and redline a frame, then drop it straight into a Linear ticket.",
      },
      {
        title: "User testing notes",
        body: "Annotate screen recordings of user sessions to highlight UX moments worth sharing with the team.",
      },
    ],
    featuredTools: [
      "Pen tool for redlines",
      "Measure tool to check spacing, padding and dimensions on screen",
      "Rectangle tool for spacing issues",
      "Highlighter for marking copy and content blocks",
      "Spotlight to focus a crit on one frame at a time",
      "Arrow tool for flow critique",
      "Text tool for inline notes",
    ],
    faq: [
      {
        q: "Does Scribbble integrate with Figma?",
        a: "Scribbble draws on top of Figma (or anything else) at the OS level — no plugin required. Annotations live on the screen, not inside the Figma file.",
      },
      {
        q: "Can I save the annotated frame as an image?",
        a: "The Scribbble Mac app draws on the live screen — for saving an annotated still, use the free Screenshot Annotate tool at /tools/screenshot-annotate which lets you upload or paste an image, mark it up and copy to clipboard.",
      },
    ],
  },
  {
    slug: "sales-teams",
    audience: "Sales teams",
    title: "Screen Annotation for Sales Demos — Scribbble for Mac",
    description:
      "Make every product demo memorable. Scribbble lets sales teams draw, highlight and circle on their Mac screen during live demos and recorded walkthroughs.",
    h1: "The screen annotation tool for sales demos",
    subheadline:
      "Direct your prospect's attention with a single keystroke. Highlight pricing tiers, circle the ROI number, draw the workflow — your demo lands harder when you guide the eye.",
    painPoints: [
      {
        title: "Prospects miss the key moment in a demo",
        body: "On a Zoom share, the prospect is half-watching their email. A live circle around the headline number snaps them back.",
      },
      {
        title: "Recording demos for async send-throughs",
        body: "Recorded walkthroughs are dramatically more effective with annotations baked in. No editor required — Scribbble draws live.",
      },
    ],
    workflows: [
      {
        title: "Live discovery and demo calls",
        body: "Share your screen on Zoom or Gong, then highlight the exact pricing tier, dashboard widget or integration as you talk through it.",
      },
      {
        title: "Async Loom / Vidyard walkthroughs",
        body: "Record a 3-minute personalized demo with on-screen annotations baked right in. Higher response rates than plain screen recordings.",
      },
      {
        title: "Internal enablement and call reviews",
        body: "Annotate Gong recordings or competitive collateral when training the team.",
      },
    ],
    featuredTools: [
      "Highlighter for ROI numbers and pricing rows",
      "Spotlight to dim everything except the dashboard widget you're showing",
      "Arrow tool for guided tours",
      "Rectangle tool for pricing call-outs",
      "Text tool for inline labels",
      "One-key clear between sections of the demo",
    ],
    faq: [
      {
        q: "Does this work with Zoom, Gong, Chorus and Loom?",
        a: "Yes. Scribbble draws at the OS level so any screen capture or share — Zoom, Gong, Chorus, Loom, Vidyard — captures the annotations.",
      },
      {
        q: "Is there a team license?",
        a: "Reach out via the support link below for team and volume licensing.",
      },
    ],
  },
];

export const personaSlugs = personas.map((p) => p.slug);
export const getPersona = (slug: string) =>
  personas.find((p) => p.slug === slug);
