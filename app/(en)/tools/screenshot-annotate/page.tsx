import type { Metadata } from "next";
import ScreenshotAnnotateEditor from "./editor";

const TITLE =
  "Free Mac Screenshot Annotation Tool — Annotate Images Online";
const DESCRIPTION =
  "Paste a screenshot, mark it up, copy it back — free in your browser. Arrows, text, numbered steps, blur to redact, plus 3D tilt and depth of field. No signup, no upload, nothing to install.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/screenshot-annotate" },
  openGraph: {
    type: "website",
    url: "/tools/screenshot-annotate",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/social-2.png",
        width: 1200,
        height: 630,
        alt: "Scribbble — Free online screenshot annotator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social-2.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Scribbble Screenshot Annotator",
  url: "https://www.scribbble.app/tools/screenshot-annotate",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any (browser-based)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: DESCRIPTION,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I annotate a screenshot on a Mac for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Take a screenshot on Mac with Cmd+Shift+4, then paste it into this tool with Cmd+V (or upload it). Use the floating toolbar to draw with the pen, add arrows, rectangles, text, numbered steps, or blur sensitive areas. Press Cmd+C to copy the annotated result back to your clipboard.",
      },
    },
    {
      "@type": "Question",
      name: "What's the best Mac image annotation tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For free, in-browser annotation with no install: this Scribbble Screenshot Annotator covers pen, arrow, text, rectangle, blur, numbered markers and backgrounds — plus two effects most other tools don't have: 3D tilt (rotate the screenshot in space with arrow keys) and depth-of-field (cinematic focus blur on part of the image). For drawing on the live Mac screen during presentations or recordings, install the Scribbble Mac app.",
      },
    },
    {
      "@type": "Question",
      name: "Can I add 3D tilt or depth of field to a Mac screenshot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — both. Switch on the Tilt tool and use the arrow keys to rotate the screenshot in 3D space, perfect for hero images and Twitter / X posts. The Depth of Field tool blurs everything except a focused band of the image with adjustable intensity and focus position — a cinematic effect for highlighting one UI element. Most free screenshot tools don't include either of these.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free Mac screenshot annotation tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — this one. It's a free in-browser image annotation tool that works on any Mac with a modern browser. No signup, no upload to a server, no watermark, no time limit.",
      },
    },
    {
      "@type": "Question",
      name: "Is my screenshot uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Everything happens in your browser. Your screenshot never leaves your device.",
      },
    },
    {
      "@type": "Question",
      name: "Can I blur or pixelate sensitive information in a screenshot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Pick the Blur tool and drag a rectangle over any region you want to redact — useful for hiding emails, tokens, names, or other private data before sharing a Mac screenshot.",
      },
    },
    {
      "@type": "Question",
      name: "Can I add a background to a Mac screenshot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Background tool lets you place your screenshot on a solid color, gradient or image background — useful for blog headers, social posts and product shots.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to sign up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No signup, no account, no email. The tool is 100% free to use.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <ScreenshotAnnotateEditor />

      {/* Visible, crawlable content below the editor */}
      <section
        className="bg-[#f8f8f8] text-[#1a1a1f] px-5 py-20 border-t border-black/10
          [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:mt-14 [&_h2]:mb-4
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-2
          [&_p]:text-[#3a3a44] [&_p]:leading-relaxed [&_p]:mb-4
          [&_li]:text-[#3a3a44] [&_li]:leading-relaxed [&_li]:mb-2
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_a]:text-[#5b4bff] [&_a]:underline [&_a]:underline-offset-2
          [&_strong]:text-[#1a1a1f]"
      >
        <div className="mx-auto max-w-3xl">
        <h2 className="!mt-0">What this Mac screenshot annotation tool does</h2>
        <p>
          Scribbble&apos;s free Mac screenshot annotation tool lets you mark
          up images directly in your browser — no install, no signup, no
          upload to a server. Beyond the standard pen, arrow, text, rectangle,
          blur and numbered-step tools, it includes two effects almost no
          other free screenshot annotator offers: 3D tilt (rotate the
          screenshot in 3D space with arrow keys, perfect for hero images and
          social posts) and depth of field (a cinematic focus-blur effect that
          highlights one part of the image while softly blurring the rest).
        </p>

        <h2>How to annotate a screenshot on Mac</h2>
        <p>
          You don&apos;t need to install anything. Take your screenshot the
          usual way — <strong>Cmd+Shift+4</strong> for a region,{" "}
          <strong>Cmd+Shift+3</strong> for the full screen, or{" "}
          <strong>Cmd+Ctrl+Shift+4</strong> to send it straight to the
          clipboard. Then paste it into the editor above with{" "}
          <strong>Cmd+V</strong>, mark it up, and press <strong>Cmd+C</strong>{" "}
          to copy the annotated version back out. The whole loop takes a few
          seconds and never leaves your browser.
        </p>
        <p>
          macOS does include Markup inside Preview and Quick Look, and for
          drawing a quick circle it&apos;s fine. It runs out of road as soon as
          you need numbered steps for a walkthrough, a real blur for redacting
          credentials, or a background to make the shot presentable — which is
          where a dedicated Mac screenshot annotation tool earns its place.
        </p>

        <h2>Using it as a Mac image annotation tool</h2>
        <p>
          Nothing here is specific to screenshots. Any image works — a photo, a
          design export, a scanned page, a diagram, a chart from a dashboard.
          Drag a file in or paste from the clipboard and every tool behaves the
          same way, which makes it a general-purpose image annotation tool for
          Mac rather than a screenshot-only utility.
        </p>
        <p>
          Because it runs entirely in the browser, it also works on any
          machine — macOS, Windows, Linux, ChromeOS, iPad. It&apos;s built and
          tested Mac-first, but nothing stops it working elsewhere.
        </p>

        <h2>What makes this Mac screenshot annotator different</h2>
        <ul>
          <li>
            <strong>3D tilt:</strong> rotate the screenshot in 3D space using
            the arrow keys. Lock in any angle for hero images, marketing
            shots, and social-media posts that look designed rather than
            captured.
          </li>
          <li>
            <strong>Depth of field:</strong> apply a cinematic focus-blur with
            adjustable blur intensity and focus position. Draws the eye to one
            UI element while softening everything around it — like a fast lens
            on a real camera.
          </li>
          <li>
            <strong>Backgrounds:</strong> place your screenshot on solid
            colors, gradients, or image backgrounds for a polished, framed
            look.
          </li>
          <li>
            All of the standard markup tools too: pen, arrow, rectangle, text,
            blur, numbered step markers.
          </li>
        </ul>

        <h2>Step by step: marking up a Mac screenshot online</h2>
        <ol>
          <li>
            Take a screenshot on your Mac (Cmd+Shift+4 for a region or
            Cmd+Shift+3 for the full screen).
          </li>
          <li>
            Paste it into this tool with Cmd+V — or click the upload area to
            choose an image file.
          </li>
          <li>
            Use the floating toolbar to draw with the pen, add arrows, draw
            rectangles, place numbered step markers, write text, blur
            sensitive regions, add a background, apply depth of field, or
            tilt the image in 3D.
          </li>
          <li>
            Press Cmd+C to copy the annotated result back to your clipboard,
            ready to paste into Slack, Linear, an email, or a doc.
          </li>
        </ol>

        <h2>Tools included in this Mac screenshot markup tool</h2>
        <ul>
          <li>Freehand pen for drawing and highlighting</li>
          <li>Arrow tool to point at things on a Mac screenshot</li>
          <li>Rectangle tool for outlining UI elements</li>
          <li>Text tool to add labels and captions</li>
          <li>
            Blur / pixelate tool to redact sensitive areas of a Mac
            screenshot
          </li>
          <li>Numbered step markers (1, 2, 3…) for tutorials and bug reports</li>
          <li>Backgrounds — solid colors, gradients and image backgrounds</li>
          <li>
            Depth of field — cinematic focus blur with adjustable intensity
            and focus position
          </li>
          <li>
            3D tilt — rotate the screenshot in 3D space using arrow keys, for
            hero images and social posts
          </li>
        </ul>

        <h2>
          Why use a dedicated Mac screenshot annotation tool over Preview?
        </h2>
        <p>
          macOS Preview includes basic Markup, but it&apos;s missing
          everything that actually makes a screenshot look great when you
          share it: numbered step markers for walkthroughs, a real blur tool
          for redacting credentials, gradient and image backgrounds, depth of
          field for focusing on one UI element, and 3D tilt for hero shots.
          Most free screenshot annotators online don&apos;t have tilt or
          depth-of-field either — this one does, in your browser, with
          nothing to install.
        </p>

        <h2>Mac screenshot annotation FAQ</h2>
        <h3>How do I annotate a screenshot on a Mac for free?</h3>
        <p>
          Take a screenshot on Mac with Cmd+Shift+4, paste it into this tool
          with Cmd+V, then use the floating toolbar to draw, add arrows,
          rectangles, text, numbered steps, or blur sensitive areas. Press
          Cmd+C to copy the result back to your clipboard.
        </p>

        <h3>What&apos;s the best Mac image annotation tool?</h3>
        <p>
          For free, in-browser annotation with no install, this Scribbble
          Screenshot Annotator covers pen, arrow, text, rectangle, blur,
          numbered markers and backgrounds — plus 3D tilt and depth of
          field, two effects most other free screenshot tools don&apos;t
          have. For drawing on the live Mac screen during presentations or
          recordings, install the Scribbble Mac app.
        </p>

        <h3>Can I add 3D tilt or depth of field to a Mac screenshot?</h3>
        <p>
          Yes — both. Switch on the Tilt tool and use the arrow keys to
          rotate the screenshot in 3D space, perfect for hero images and
          social-media posts. The Depth of Field tool blurs everything
          except a focused band of the image with adjustable intensity and
          focus position — a cinematic effect for highlighting one UI
          element. Most free screenshot annotators don&apos;t include either
          of these.
        </p>

        <h3>Is my screenshot uploaded to a server?</h3>
        <p>
          No. Everything happens in your browser — your screenshot never
          leaves your device.
        </p>

        <h3>Can I blur or pixelate sensitive information in a screenshot?</h3>
        <p>
          Yes. Pick the Blur tool and drag a rectangle over any region you
          want to redact — useful for hiding emails, tokens, names, or other
          private data before sharing a Mac screenshot.
        </p>

        <h3>Can I add a background to a Mac screenshot?</h3>
        <p>
          Yes. The Background tool lets you place your screenshot on a solid
          color, gradient or image background — useful for blog headers,
          social posts and product shots.
        </p>

        <h3>Want to annotate live on your Mac screen instead?</h3>
        <p>
          Try the <a href="/">Scribbble Mac app</a> — a Mac-native screen
          annotation app that draws on top of any application on your screen
          in real time. Perfect for live Zoom presentations, OBS streams and
          recorded tutorials.
        </p>

        <h3>Related guides</h3>
        <ul>
          <li>
            <a href="/blog/screen-annotation-guide">
              The complete guide to screen annotation
            </a>
          </li>
          <li>
            <a href="/best/best-screen-annotation-apps-mac">
              The best screen annotation apps for Mac
            </a>
          </li>
          <li>
            <a href="/best/best-epic-pen-alternatives-mac">
              The best Epic Pen alternatives for Mac
            </a>
          </li>
          <li>
            <a href="/best/best-zoomit-alternatives-mac">
              The best ZoomIt alternatives for Mac
            </a>
          </li>
          <li>
            <a href="/best/best-presentify-alternatives-mac">
              The best Presentify alternatives for Mac
            </a>
          </li>
        </ul>
        </div>
      </section>
    </>
  );
}
