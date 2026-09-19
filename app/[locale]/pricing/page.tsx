import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Star } from "lucide-react";
import BuyLink from "@/components/buy-link";
import DownloadLink from "@/components/download-link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import Testimonials, { type Testimonial } from "@/components/testimonials";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { SITE_URL, DOWNLOAD_URL, BUY_URL } from "@/lib/site-config";

const PATH = "/pricing";
const PRICE_USD = 12;
const PRICE = `$${PRICE_USD}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  const url = localeUrl(locale, PATH);
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: {
      type: "website",
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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pricing" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const features = t.raw("card.features") as string[];
  const chips = t.raw("chips") as string[];
  const faq = t.raw("faq") as { q: string; a: string }[];
  const testimonials = tHome.raw("testimonials") as Testimonial[];

  const offerJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Scribbble",
    operatingSystem: "macOS 14.0+",
    applicationCategory: "DesignApplication",
    inLanguage: locale,
    url: `${SITE_URL}${localeUrl(locale, PATH)}`,
    offers: {
      "@type": "Offer",
      price: String(PRICE_USD),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: BUY_URL,
      description: t("jsonLdOffer"),
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
      { "@type": "ListItem", position: 2, name: t("breadcrumb") },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {[offerJsonLd, faqJsonLd, breadcrumbJsonLd].map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

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
          <li className="text-foreground">{t("breadcrumb")}</li>
        </ol>
      </nav>

      {/* Hero + the single pricing card */}
      <section className="relative py-20 md:py-28 px-4 blob-bg overflow-hidden">
        <div className="absolute top-24 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl float-animation pointer-events-none"></div>
        <div
          className="absolute bottom-10 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl float-animation pointer-events-none"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto max-w-4xl text-center relative">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-red-100/10 to-accent/10 text-primary border-primary/30 px-6 py-2 text-lg font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("badge")}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            {t.rich("heroTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-16">
            {t("heroSubtitle")}
          </p>

          <div className="mx-auto max-w-md text-left">
            <div className="relative rounded-3xl border-2 border-primary/30 bg-card/80 backdrop-blur p-8 md:p-10 shadow-2xl shadow-primary/10">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                {t("card.ribbon")}
              </span>

              <h2 className="text-2xl font-bold mb-1">{t("card.name")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("card.tagline")}
              </p>

              <div className="flex items-end gap-3 mb-2">
                <span className="relative text-7xl font-black leading-none tracking-tight">
                  {PRICE}
                  <svg
                    aria-hidden="true"
                    className="absolute -bottom-3 left-0 w-full h-5 text-accent draw-animation"
                    viewBox="0 0 300 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M5 15 Q150 5 295 15"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="pb-2 text-lg font-semibold text-muted-foreground">
                  {t("card.priceNote")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                {t("card.priceSubnote")}
              </p>

              <ul className="space-y-3 mb-10">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                asChild
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white py-7 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300"
              >
                <BuyLink
                  href={BUY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  location="pricing_card"
                >
                  <Star className="w-6 h-6 mr-3" />
                  {t("card.cta", { price: PRICE })}
                </BuyLink>
              </Button>

              <p className="mt-5 text-center text-muted-foreground">
                {t.rich("card.tryLine", {
                  link: (chunks) => (
                    <DownloadLink
                      href={DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      location="pricing_card"
                      className="font-bold text-primary underline decoration-2 decoration-primary/40 underline-offset-4 hover:decoration-primary transition"
                    >
                      {chunks}
                    </DownloadLink>
                  ),
                })}
              </p>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground list-none p-0 m-0">
              {chips.map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  ></span>
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Testimonials
        eyebrow={tHome("testimonialsEyebrow")}
        title={tHome.rich("testimonialsTitle", {
          gradient: (chunks) => <span className="gradient-text">{chunks}</span>,
        })}
        items={testimonials}
      />

      {/* FAQ */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            {t.rich("faqTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h2>
          <div className="space-y-6">
            {faq.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border-2 border-primary/20 bg-card/60 p-6 md:p-8"
              >
                <h3 className="text-xl font-bold mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} showLocaleSwitcher />
    </div>
  );
}
