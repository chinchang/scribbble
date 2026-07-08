import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Check, X, Trophy, Sparkles } from "lucide-react";
import { listicleSlugs } from "@/lib/listicles";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  getListicle,
  getListicles,
  getPersonas,
  getComparisons,
} from "@/lib/i18n/data";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL, DOWNLOAD_URL } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listicleSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = getListicle(slug, locale);
  if (!l) return {};
  const path = `/best/${l.slug}`;
  const url = localeUrl(locale, path);
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: l.title,
      description: l.description,
      url,
      type: "article",
      locale,
      images: ["/social-2.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: l.title,
      description: l.description,
      images: ["/social-2.png"],
    },
  };
}

export default async function ListiclePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = getListicle(slug, locale);
  if (!l) notFound();

  const t = await getTranslations({ locale, namespace: "bestPage" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const others = getListicles(locale).filter((x) => x.slug !== l.slug);
  const personas = getPersonas(locale);
  const comparisons = getComparisons(locale);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: l.title,
    description: l.description,
    inLanguage: locale,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: l.items.length,
    itemListElement: l.items.map((item) => ({
      "@type": "ListItem",
      position: item.rank,
      name: item.name,
      description: item.tagline,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: l.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: l.h1 },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
          <li>{t("breadcrumbGuides")}</li>
          <li>/</li>
          <li className="text-foreground">{l.h1}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/30 px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            {l.h1}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {l.intro}
          </p>
        </div>
      </section>

      {/* Criteria */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-primary/20 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-6">{t("howWePicked")}</h2>
            <ul className="space-y-3">
              {l.criteria.map((c) => (
                <li key={c} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">
          {l.items.map((item) => (
            <article
              key={item.rank}
              className={`rounded-3xl border-2 p-8 md:p-10 ${
                item.isScribbble
                  ? "border-primary bg-gradient-to-br from-primary/10 to-accent/5"
                  : "border-border bg-card/60"
              }`}
            >
              <div className="flex items-start gap-5 mb-6">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${
                    item.isScribbble
                      ? "bg-gradient-to-br from-primary to-accent text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.rank === 1 ? (
                    <Trophy className="w-8 h-8" />
                  ) : (
                    `#${item.rank}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="text-3xl font-black">{item.name}</h2>
                    {item.isScribbble && (
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        {t("ourPick")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground italic">
                    {item.tagline}
                  </p>
                </div>
              </div>

              <p className="text-lg leading-relaxed mb-6">{item.summary}</p>

              <div className="mb-6 p-4 rounded-xl bg-background/60 border border-border">
                <span className="font-bold text-sm uppercase tracking-wide text-muted-foreground">
                  {t("bestFor")}
                </span>
                <p className="mt-1 text-lg">{item.bestFor}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold mb-3 text-primary">{t("pros")}</h3>
                  <ul className="space-y-2">
                    {item.pros.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-muted-foreground">
                    {t("cons")}
                  </h3>
                  <ul className="space-y-2">
                    {item.cons.map((c) => (
                      <li key={c} className="flex gap-2">
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                <span className="text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {t("pricing")}
                  </span>{" "}
                  {item.pricing}
                </span>
                {item.isScribbble ? (
                  <Button
                    asChild
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    <a
                      href={DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {tc("downloadScribbble")}
                    </a>
                  </Button>
                ) : item.vsSlug ? (
                  <Button asChild variant="outline">
                    <Link href={`/vs/${item.vsSlug}`}>
                      {t("scribbbleVsItem", { name: item.name })}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            {t("bottomLine")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {l.conclusion}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            {tc("faq")}
          </h2>
          <div className="space-y-6">
            {l.faq.map((f) => (
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            {t.rich("ctaTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
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

      {/* Internal links */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          {others.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-6">{t("otherGuides")}</h2>
              <div className="flex flex-wrap gap-3 mb-10">
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/best/${o.slug}`}
                    className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
                  >
                    {o.h1}
                  </Link>
                ))}
              </div>
            </>
          )}
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
          <h2 className="text-2xl font-bold mb-6">{t("forYourRole")}</h2>
          <div className="flex flex-wrap gap-3">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {t("scribbbleFor", { audience: p.audience })}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} showLocaleSwitcher />
    </div>
  );
}
