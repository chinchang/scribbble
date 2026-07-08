import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BuyLink from "@/components/buy-link";
import { Download, ArrowRight, Check, Sparkles } from "lucide-react";
import { personaSlugs } from "@/lib/personas";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPersona, getPersonas, getComparisons, getListicles } from "@/lib/i18n/data";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL, DOWNLOAD_URL, BUY_URL } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    personaSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getPersona(slug, locale);
  if (!p) return {};
  const path = `/for/${p.slug}`;
  const url = localeUrl(locale, path);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: p.title,
      description: p.description,
      url,
      type: "website",
      locale,
      images: ["/social-2.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: ["/social-2.png"],
    },
  };
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const persona = getPersona(slug, locale);
  if (!persona) notFound();

  const t = await getTranslations({ locale, namespace: "personaPage" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const audience =
    locale === "en" ? persona.audience.toLowerCase() : persona.audience;

  const others = getPersonas(locale).filter((p) => p.slug !== persona.slug);
  const comparisons = getComparisons(locale);
  const listicles = getListicles(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: persona.faq.map((f) => ({
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
        name: t("scribbbleFor", { audience: persona.audience }),
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

      {/* Breadcrumb */}
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
          <li>{t("breadcrumbFor")}</li>
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
            {t("badge", { audience: persona.audience })}
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
              <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5 mr-2" />
                {tc("downloadFree")}
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
                location="for_hero"
              >
                {tc("buyLicense")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </BuyLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            {t.rich("whyTitle", {
              audience,
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
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
            {t("howTitle", { audience })}
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
            {t("toolsTitle")}
          </h2>
          <ul className="space-y-4">
            {persona.featuredTools.map((tool) => (
              <li
                key={tool}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-primary/20"
              >
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-lg">{tool}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            {tc("faq")}
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
            {t.rich("ctaTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t("ctaSubtitle", { audience })}
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

      {/* Internal links */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">{t("otherRolesTitle")}</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/for/${o.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {t("scribbbleFor", { audience: o.audience })}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">{t("compareTitle")}</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                {t("scribbbleVs", { competitor: c.competitor })}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">{t("guidesTitle")}</h2>
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
