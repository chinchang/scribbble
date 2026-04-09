import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Check, Sparkles } from "lucide-react";
import { personas, personaSlugs, getPersona } from "@/lib/personas";
import { comparisons } from "@/lib/comparisons";
import { listicles } from "@/lib/listicles";

export const dynamicParams = false;

export function generateStaticParams() {
  return personaSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPersona(slug);
  if (!p) return {};
  const url = `/for/${p.slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.description,
      url,
      type: "website",
      images: ["/social.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: ["/social.png"],
    },
  };
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const persona = getPersona(slug);
  if (!persona) notFound();

  const others = personas.filter((p) => p.slug !== persona.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: persona.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

      {/* Breadcrumb */}
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
          <li>For</li>
          <li>/</li>
          <li className="text-foreground">{persona.audience}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/30 px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Scribbble for {persona.audience}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            {persona.h1}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {persona.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-accent text-white px-10 py-6 text-lg font-bold"
            >
              <a
                href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Free
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-10 py-6 text-lg font-bold border-2 border-primary text-primary"
            >
              <a
                href="https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy License
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            Why {persona.audience.toLowerCase()} use{" "}
            <span className="gradient-text">Scribbble</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {persona.painPoints.map((pp) => (
              <div
                key={pp.title}
                className="rounded-2xl border-2 border-primary/20 bg-card/60 p-6"
              >
                <h3 className="text-xl font-bold mb-3">{pp.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pp.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflows */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            How {persona.audience.toLowerCase()} use it
          </h2>
          <div className="space-y-6">
            {persona.workflows.map((w, i) => (
              <div
                key={w.title}
                className="rounded-2xl border-2 border-accent/20 bg-card/60 p-8 flex gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-black text-xl">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{w.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tools */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            The tools that matter most
          </h2>
          <ul className="space-y-4">
            {persona.featuredTools.map((t) => (
              <li
                key={t}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-primary/20"
              >
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-lg">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            FAQ
          </h2>
          <div className="space-y-6">
            {persona.faq.map((f) => (
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

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-background to-card">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Try Scribbble <span className="gradient-text">free</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Built for {persona.audience.toLowerCase()}. Works on macOS 11+.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white px-12 py-7 text-xl font-bold"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-6 h-6 mr-3" />
              Download Scribbble
            </a>
          </Button>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Scribbble for other roles</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/for/${o.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                Scribbble for {o.audience}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Compare Scribbble</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                Scribbble vs {c.competitor}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Guides</h2>
          <div className="flex flex-wrap gap-3">
            {listicles.map((l) => (
              <Link
                key={l.slug}
                href={`/best/${l.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {l.h1}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-primary/20 py-10 px-4 bg-gradient-to-br from-card to-background text-center text-muted-foreground">
        © 2025 Kushagra Gour ·{" "}
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        ·{" "}
        <a href="mailto:chinchang457@gmail.com" className="hover:text-primary">
          Support
        </a>
      </footer>
    </div>
  );
}
