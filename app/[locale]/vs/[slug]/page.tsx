import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BuyLink from "@/components/buy-link";
import { Download, ArrowRight, Check, X, Sparkles } from "lucide-react";
import { comparisonSlugs } from "@/lib/comparisons";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  getComparison,
  getComparisons,
  getPersonas,
  getListicles,
} from "@/lib/i18n/data";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL, DOWNLOAD_URL, BUY_URL } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    comparisonSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = getComparison(slug, locale);
  if (!c) return {};
  const path = `/vs/${c.slug}`;
  const url = localeUrl(locale, path);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: c.title,
      description: c.description,
      url,
      type: "website",
      locale,
      images: ["/social-2.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: ["/social-2.png"],
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const c = getComparison(slug, locale);
  if (!c) notFound();

  const t = await getTranslations({ locale, namespace: "vsPage" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const others = getComparisons(locale).filter((x) => x.slug !== c.slug);
  const personas = getPersonas(locale);
  const listicles = getListicles(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tc("home"),
        item: `${SITE_URL}${localeUrl(locale, "/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("scribbbleVs", { competitor: c.competitor }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <SiteHeader locale={locale} showLocaleSwitcher />

      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-8 text-sm text-muted-foreground"
      >
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              {tc("home")}
            </Link>
          </li>
          <li>/</li>
          <li>{t("breadcrumbVs")}</li>
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
            {t("badge")}
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
              <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5 mr-2" />
                {t("tryFree")}
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-10 py-6 text-lg font-bold border-2 border-primary text-primary"
            >
              <BuyLink
                href={BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                location="vs_hero"
              >
                {tc("buyLicense")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </BuyLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Direct answers to what people actually searched for */}
      {c.answerSections && c.answerSections.length > 0 && (
        <section className="px-4 pb-4">
          <div className="container mx-auto max-w-3xl space-y-12">
            {c.answerSections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-3xl md:text-4xl font-black mb-5">
                  {s.heading}
                </h2>
                <div className="space-y-4">
                  {s.body.map((p) => (
                    <p
                      key={p}
                      className="text-lg text-muted-foreground leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About competitor */}
      <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            {t("whatIs", { competitor: c.competitor })}
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
            {t("tableTitle")}
          </h2>
          <div className="overflow-x-auto rounded-2xl border-2 border-primary/20">
            <table className="w-full">
              <thead className="bg-primary/10">
                <tr>
                  <th className="text-left p-4 font-bold">{t("feature")}</th>
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
                  <td className="p-4 font-bold">{t("pricing")}</td>
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
              {t("whereScribbbleWins")}
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
              {t("whereCompetitorWins", { competitor: c.competitor })}
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
            <h3 className="text-2xl font-bold mb-4">{t("chooseScribbble")}</h3>
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
              {t("chooseCompetitor", { competitor: c.competitor })}
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
          <h2 className="text-4xl font-black mb-10 text-center">{tc("faq")}</h2>
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
            {t.rich("ctaTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t("ctaSubtitle")}
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white px-12 py-7 text-xl font-bold"
          >
            <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
              <Download className="w-6 h-6 mr-3" />
              {tc("downloadScribbble")}
            </a>
          </Button>
        </div>
      </section>

      {/* Internal linking */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">{t("otherComparisons")}</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/vs/${o.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {t("scribbbleVs", { competitor: o.competitor })}
              </Link>
            ))}
            <Link
              href="/vs/zoomit-vs-epic-pen"
              className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
            >
              {t("zoomitVsEpicPen")}
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-6">{t("forYourRole")}</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                {t("scribbbleFor", { audience: p.audience })}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">{t("guides")}</h2>
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

      <SiteFooter locale={locale} showLocaleSwitcher />
    </div>
  );
}
