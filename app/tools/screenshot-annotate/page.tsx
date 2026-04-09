import type { Metadata } from "next";
import ScreenshotAnnotateEditor from "./editor";

const TITLE =
  "Free Screenshot Annotator — Draw, Blur & Markup Online";
const DESCRIPTION =
  "Annotate screenshots right in your browser. Add arrows, text, rectangles, numbered steps, blur sensitive info, and copy to clipboard. No signup, no upload — 100% free.";

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
        url: "/social.png",
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
    images: ["/social.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Scribbble Screenshot Annotator",
  url: "https://scribbble.app/tools/screenshot-annotate",
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
      name: "How do I annotate a screenshot online for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paste a screenshot from your clipboard or upload an image, then use the floating toolbar to draw with the pen, add arrows, rectangles, text, numbered steps, or blur sensitive areas. Press the copy shortcut to copy the result back to your clipboard.",
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
        text: "Yes. Pick the Blur tool and drag a rectangle over any region you want to redact — useful for hiding emails, tokens, names, or other private data before sharing.",
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

      {/* SEO content — visually hidden but server-rendered for crawlers */}
      <section className="sr-only">
        <h1>Free Online Screenshot Annotator</h1>
        <p>
          Scribbble&apos;s free screenshot annotator lets you mark up images
          directly in your browser. Paste from your clipboard or upload a
          screenshot, then draw with the freehand pen, add arrows, rectangles,
          text labels, numbered step markers, or blur out sensitive
          information. When you&apos;re done, copy the annotated screenshot
          back to your clipboard with a single keyboard shortcut. No signup,
          no upload to a server, no watermark.
        </p>

        <h2>Tools included</h2>
        <ul>
          <li>Freehand pen for drawing and highlighting</li>
          <li>Arrow tool to point at things</li>
          <li>Rectangle tool for outlining UI elements</li>
          <li>Text tool to add labels and captions</li>
          <li>Blur / pixelate tool to redact sensitive areas</li>
          <li>Numbered step markers (1, 2, 3…) for tutorials</li>
          <li>Backgrounds — solid, gradient, and image</li>
          <li>Depth of field for cinematic focus</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <h3>How do I annotate a screenshot online for free?</h3>
        <p>
          Paste a screenshot from your clipboard or upload an image, then use
          the floating toolbar to draw, add arrows, rectangles, text, numbered
          steps, or blur sensitive areas. Press the copy shortcut to copy the
          result back to your clipboard.
        </p>

        <h3>Is my screenshot uploaded to a server?</h3>
        <p>
          No. Everything happens in your browser — your screenshot never
          leaves your device.
        </p>

        <h3>Can I blur or pixelate sensitive information?</h3>
        <p>
          Yes. Pick the Blur tool and drag a rectangle over any region you
          want to redact — useful for hiding emails, tokens, names, or other
          private data before sharing.
        </p>

        <h3>Want to annotate live on your Mac screen instead?</h3>
        <p>
          Try the{" "}
          <a href="/">Scribbble Mac app</a> — draw and annotate over anything
          on your screen in real time.
        </p>
      </section>

      <ScreenshotAnnotateEditor />
    </>
  );
}
