import type { Metadata } from "next";
import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Check, X, Sparkles } from "lucide-react";
import { comparisons } from "@/lib/comparisons";
import { personas } from "@/lib/personas";
import { listicles } from "@/lib/listicles";
import SiteFooter from "@/components/site-footer";

const TITLE = "ZoomIt vs Epic Pen — Which Is Better in 2026?";
const DESCRIPTION =
  "ZoomIt and Epic Pen are two of the most popular screen annotation tools. Honest side-by-side comparison: features, pricing, platforms — and the best Mac alternative.";
const URL = "/vs/zoomit-vs-epic-pen";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "article",
    url: URL,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social.png"],
  },
};

const table: { feature: string; zoomit: string; epicPen: string }[] = [
  { feature: "Price", zoomit: "Free", epicPen: "Free + Pro tier" },
  { feature: "Maker", zoomit: "Microsoft Sysinternals", epicPen: "Epic Pen" },
  { feature: "Windows", zoomit: "Yes (original)", epicPen: "Yes (original)" },
  { feature: "macOS", zoomit: "Yes (recent port)", epicPen: "No" },
  { feature: "Linux", zoomit: "No", epicPen: "No" },
  { feature: "Pen tool", zoomit: "Yes", epicPen: "Yes" },
  { feature: "Highlighter", zoomit: "Limited", epicPen: "Yes" },
  { feature: "Shapes (arrow / rectangle)", zoomit: "Yes", epicPen: "Yes (Pro)" },
  { feature: "Text tool", zoomit: "Yes (typing mode)", epicPen: "Yes (Pro)" },
  { feature: "Screen zoom", zoomit: "Yes", epicPen: "No" },
  { feature: "Break timer", zoomit: "Yes", epicPen: "No" },
  { feature: "Whiteboard mode", zoomit: "Yes", epicPen: "No" },
  { feature: "Modern Mac-native UI", zoomit: "No (Windows port)", epicPen: "—" },
];

const renderCell = (val: string) => {
  if (val.toLowerCase() === "yes")
    return <Check className="w-5 h-5 text-primary inline" />;
  if (val.toLowerCase() === "no")
    return <X className="w-5 h-5 text-muted-foreground inline" />;
  return <span>{val}</span>;
};

const faq = [
  {
    q: "Which is better, ZoomIt or Epic Pen?",
    a: "It depends on your platform and needs. ZoomIt is free, runs on both Windows and macOS, and includes a built-in screen zoom and break timer that Epic Pen doesn't have. Epic Pen has a more polished annotation UI and a Pro tier that adds shapes and text, but it's Windows-only. If you're on Mac, ZoomIt is the only one of the two that runs at all.",
  },
  {
    q: "Why do users choose ZoomIt over Epic Pen?",
    a: "Three main reasons: (1) ZoomIt is fully free with no Pro tier, while Epic Pen gates shapes and text behind a paid upgrade. (2) ZoomIt includes a true screen zoom feature for showing fine detail, which Epic Pen lacks. (3) ZoomIt now runs on macOS — Epic Pen does not. Reviewers also note ZoomIt's zero-friction hotkeys feel faster than Epic Pen's toolbar.",
  },
  {
    q: "How does Epic Pen compare to ZoomIt?",
    a: "Epic Pen has a friendlier, more modern annotation UI and is designed around presentation use. ZoomIt is a Sysinternals utility — minimal UI, hotkey-driven, with extra features (zoom, break timer, whiteboard mode) layered on. Epic Pen's free tier is limited to pen and highlighter; ZoomIt's full feature set is free.",
  },
  {
    q: "Is there a Mac alternative to both ZoomIt and Epic Pen?",
    a: "Yes. Scribbble is a Mac-first screen annotation app that combines what's good about both — a modern, polished UI like Epic Pen, with the focused, hotkey-driven workflow of ZoomIt. It includes pen, highlighter, arrow, rectangle, text, Spotlight (focus dim) and Measure tools, free to download and try with a one-time license to unlock everything.",
  },
  {
    q: "What features do alternatives offer that Epic Pen doesn't?",
    a: "Most modern alternatives add at least one of: a Spotlight / focus-dim tool, a Measure tool for on-screen distances, a screen zoom (ZoomIt), or a built-in screen recorder (CleanShot X). Scribbble specifically adds Spotlight, Measure and a companion free Screenshot Annotate web tool. ZoomIt adds zoom, break timer and whiteboard mode.",
  },
  {
    q: "Which screen annotation tools do reviewers recommend instead of Epic Pen?",
    a: "On Windows, ZoomIt is the most-recommended free alternative. On Mac (where Epic Pen doesn't run at all), the most-recommended alternatives are Scribbble (modern Mac-first), Presentify (cursor highlighting), ZoomIt (free, Windows-style UI) and CleanShot X (capture + annotation).",
  },
  {
    q: "Is ZoomIt safe to use?",
    a: "Yes — ZoomIt is published by Microsoft as part of the Sysinternals suite, distributed directly from Microsoft's site. It's widely used in enterprise environments.",
  },
  {
    q: "Does Epic Pen work on Mac?",
    a: "No. Epic Pen is Windows-only with no native Mac build. If you're on macOS, look at Scribbble (Mac-first), ZoomIt (free Microsoft port) or Presentify.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  url: `https://www.scribbble.app${URL}`,
  image: "https://www.scribbble.app/social.png",
  author: { "@type": "Person", name: "Kushagra Gour", url: "https://kushagra.dev" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.scribbble.app/" },
    { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://www.scribbble.app/vs/zoomit" },
    { "@type": "ListItem", position: 3, name: "ZoomIt vs Epic Pen" },
  ],
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="relative border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Img src="/icon.png" alt="Scribbble" width={40} height={40} />
            <span className="text-2xl font-bold gradient-text">Scribbble</span>
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4 mr-2" />
              Get Scribbble
            </a>
          </Button>
        </div>
      </header>

      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-8 text-sm text-muted-foreground"
      >
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>vs</li>
          <li>/</li>
          <li className="text-foreground">ZoomIt vs Epic Pen</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/30 px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Honest, hands-on comparison
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            ZoomIt vs Epic Pen
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Two of the most popular screen annotation tools, side by side.
            Features, pricing, platforms — and what to pick if you&rsquo;re on a
            Mac.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-primary/20 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">The short answer</h2>
            <ul className="space-y-3 text-lg">
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong>Pick ZoomIt</strong> if you want a free, hotkey-driven
                  utility with built-in screen zoom and break timer — and if
                  you&rsquo;re on Mac, since Epic Pen doesn&rsquo;t run there.
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong>Pick Epic Pen</strong> if you&rsquo;re on Windows,
                  prefer a friendlier presentation-focused UI, and don&rsquo;t
                  mind paying for the Pro tier (shapes, text).
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>
                  <strong>Pick Scribbble</strong> if you&rsquo;re on Mac and
                  want a modern, Mac-native app with the polish of Epic Pen and
                  a richer toolset (Spotlight, Measure) than either.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What is each */}
      <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border-2 border-accent/30 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">What is ZoomIt?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ZoomIt is a free screen annotation, zoom and break-timer utility
              from Microsoft Sysinternals. It originated on Windows and
              Microsoft has since released a macOS build. Its strength is
              zero-friction hotkeys and the integrated zoom feature — popular
              with sysadmins, presenters and trainers who want to show fine
              detail on screen.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-accent/30 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">What is Epic Pen?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Epic Pen is a Windows screen annotation tool designed around
              presentations and lessons. It lets you draw, highlight and (on
              the Pro tier) add shapes and text on top of any application. It
              has a friendlier UI than ZoomIt but is Windows-only — there is no
              native Mac build.
            </p>
          </div>
        </div>
      </section>

      {/* Feature table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            Side-by-side comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border-2 border-primary/20">
            <table className="w-full">
              <thead className="bg-primary/10">
                <tr>
                  <th className="text-left p-4 font-bold">Feature</th>
                  <th className="text-left p-4 font-bold">ZoomIt</th>
                  <th className="text-left p-4 font-bold">Epic Pen</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-card/30" : ""}
                  >
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4">{renderCell(row.zoomit)}</td>
                    <td className="p-4">{renderCell(row.epicPen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* When to pick each */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Choose ZoomIt if&hellip;</h3>
            <ul className="space-y-3">
              {[
                "You want a fully free tool with no Pro tier",
                "You need built-in screen zoom for showing fine detail",
                "You're on macOS — Epic Pen doesn't run there",
                "You like hotkey-driven, minimal-UI tools",
                "You also want a break timer for training sessions",
              ].map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">Choose Epic Pen if&hellip;</h3>
            <ul className="space-y-3">
              {[
                "You're on Windows",
                "You prefer a friendlier presentation-style UI over a sysadmin utility",
                "You're okay paying for the Pro tier to unlock shapes and text",
                "You don't need screen zoom or break timer features",
              ].map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mac-specific section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            On a Mac? Here&rsquo;s the better option.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Epic Pen doesn&rsquo;t run on macOS at all, and ZoomIt&rsquo;s Mac
            port still feels like a Windows utility. If you&rsquo;re on a Mac
            and want something that actually feels like a Mac app, Scribbble is
            built specifically for macOS — with a modern draggable toolbar,
            Apple Silicon native performance, and a richer toolset (Spotlight,
            Measure) than either ZoomIt or Epic Pen.
          </p>
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-8">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              Where Scribbble fits in
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>
                  Same core tools as Epic Pen — pen, highlighter, arrow,
                  rectangle, text — without a Pro paywall
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>
                  Adds Spotlight (focus dim) and Measure tools that neither
                  ZoomIt nor Epic Pen include
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>Mac-native UI with Apple Silicon support</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>Free to download and try, one-time license</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                <a
                  href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Try Scribbble Free
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/best/best-epic-pen-alternatives-mac">
                  See all Epic Pen alternatives for Mac
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-black mb-10 text-center">FAQ</h2>
          <div className="space-y-6">
            {faq.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border-2 border-primary/20 bg-card/60 p-6"
              >
                <h3 className="text-xl font-bold mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal linking */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Related comparisons</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                Scribbble vs {c.competitor}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Guides</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {listicles.map((l) => (
              <Link
                key={l.slug}
                href={`/best/${l.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                {l.h1}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Scribbble for your role</h2>
          <div className="flex flex-wrap gap-3">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                Scribbble for {p.audience}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
