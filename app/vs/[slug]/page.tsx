import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Check, X, Sparkles } from "lucide-react";
import {
  comparisons,
  comparisonSlugs,
  getComparison,
} from "@/lib/comparisons";
import { personas } from "@/lib/personas";
import { listicles } from "@/lib/listicles";
import SiteFooter from "@/components/site-footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return comparisonSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  const url = `/vs/${c.slug}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    openGraph: {
      title: c.title,
      description: c.description,
      url,
      type: "website",
      images: ["/social.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: ["/social.png"],
    },
  };
}

const renderCell = (val: string) => {
  if (val.toLowerCase() === "yes")
    return <Check className="w-5 h-5 text-primary inline" />;
  if (val.toLowerCase() === "no")
    return <X className="w-5 h-5 text-muted-foreground inline" />;
  return <span>{val}</span>;
};

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  const others = comparisons.filter((x) => x.slug !== c.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
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
          <li className="text-foreground">{c.competitor}</li>
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
            Honest comparison
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            {c.h1}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {c.subheadline}
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
                Try Scribbble Free
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

      {/* About competitor */}
      <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            What is {c.competitor}?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {c.competitorSummary}
          </p>
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
                  <th className="text-left p-4 font-bold gradient-text">
                    Scribbble
                  </th>
                  <th className="text-left p-4 font-bold">{c.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {c.table.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-card/30" : ""}
                  >
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4">{renderCell(row.scribbble)}</td>
                    <td className="p-4">{renderCell(row.competitor)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary/20">
                  <td className="p-4 font-bold">Pricing</td>
                  <td className="p-4">{c.pricing.scribbble}</td>
                  <td className="p-4">{c.pricing.competitor}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border-2 border-primary/30 bg-card/60 p-8">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              Where Scribbble wins
            </h3>
            <ul className="space-y-3">
              {c.scribbbleStrengths.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-accent/30 bg-card/60 p-8">
            <h3 className="text-2xl font-bold mb-4">
              Where {c.competitor} wins
            </h3>
            <ul className="space-y-3">
              {c.competitorStrengths.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* When to choose */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Choose Scribbble if…</h3>
            <ul className="space-y-3">
              {c.whenToChooseScribbble.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Choose {c.competitor} if…
            </h3>
            <ul className="space-y-3">
              {c.whenToChooseCompetitor.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-black mb-10 text-center">FAQ</h2>
          <div className="space-y-6">
            {c.faq.map((f) => (
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
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Try <span className="gradient-text">Scribbble</span> free
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Native macOS. One-time license. No subscription.
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

      {/* Internal linking */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Other comparisons</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/vs/${o.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                Scribbble vs {o.competitor}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Scribbble for your role</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                Scribbble for {p.audience}
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

      <SiteFooter />
    </div>
  );
}
