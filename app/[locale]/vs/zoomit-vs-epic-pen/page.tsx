import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, Check, X, Sparkles } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPersonas, getComparisons, getListicles } from "@/lib/i18n/data";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL, DOWNLOAD_URL } from "@/lib/site-config";

const PATH = "/vs/zoomit-vs-epic-pen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "zoomitVsEpicPen" });
  const url = localeUrl(locale, PATH);
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: {
      type: "article",
      url,
      locale,
      title: t("title"),
      description: t("description"),
      images: ["/social-2.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "zoomitVsEpicPen" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const personas = getPersonas(locale);
  const comparisons = getComparisons(locale);
  const listicles = getListicles(locale);

  const table = t.raw("table") as {
    feature: string;
    zoomit: string;
    epicPen: string;
  }[];
  const tldr = t.raw("tldr") as { lead: string; body: string }[];
  const chooseZoomit = t.raw("chooseZoomit") as string[];
  const chooseEpicPen = t.raw("chooseEpicPen") as string[];
  const scribbbleFits = t.raw("scribbbleFits") as string[];
  const faq = t.raw("faq") as { q: string; a: string }[];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t("title"),
    description: t("description"),
    inLanguage: locale,
    url: `${SITE_URL}${localeUrl(locale, PATH)}`,
    image: `${SITE_URL}/social-2.png`,
    author: {
      "@type": "Person",
      name: "Kushagra Gour",
      url: "https://kushagra.dev",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
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
      {
        "@type": "ListItem",
        position: 1,
        name: tc("home"),
        item: `${SITE_URL}${localeUrl(locale, "/")}`,
      },
      { "@type": "ListItem", position: 2, name: t("h1") },
    ],
  };

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
          <li>vs</li>
          <li>/</li>
          <li className="text-foreground">{t("h1")}</li>
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
            {t("badge")}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            {t("h1")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-primary/20 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">{t("tldrTitle")}</h2>
            <ul className="space-y-3 text-lg">
              {tldr.map((item) => (
                <li key={item.lead} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong>{item.lead}</strong> {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What is each */}
      <section className="py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border-2 border-accent/30 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">{t("whatIsZoomitTitle")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("whatIsZoomitBody")}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-accent/30 bg-card/60 p-8">
            <h2 className="text-2xl font-bold mb-4">
              {t("whatIsEpicPenTitle")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("whatIsEpicPenBody")}
            </p>
          </div>
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
            <h3 className="text-2xl font-bold mb-4">{t("chooseZoomitTitle")}</h3>
            <ul className="space-y-3">
              {chooseZoomit.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">
              {t("chooseEpicPenTitle")}
            </h3>
            <ul className="space-y-3">
              {chooseEpicPen.map((s) => (
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
            {t("macTitle")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {t("macBody")}
          </p>
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-8">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              {t("scribbbleFitsTitle")}
            </h3>
            <ul className="space-y-3 mb-6">
              {scribbbleFits.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
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
                  {t("tryFree")}
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/best/best-epic-pen-alternatives-mac">
                  {t("seeAlternatives")}
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
          <h2 className="text-4xl font-black mb-10 text-center">{tc("faq")}</h2>
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
          <h2 className="text-2xl font-bold mb-6">{t("relatedComparisons")}</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {t("scribbbleVs", { competitor: c.competitor })}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">{t("guides")}</h2>
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
