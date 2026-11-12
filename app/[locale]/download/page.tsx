import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import BuyLink from "@/components/buy-link";
import DownloadStarter from "@/components/download-starter";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";
import { getSnapshotLatestVersion } from "@/lib/changelog";
import {
  SITE_URL,
  DOWNLOAD_URL,
  DOWNLOAD_PATH,
  BUY_URL,
  CHANGELOG_PATH,
  PRICE_USD,
  PRICE_LABEL,
  MIN_MACOS,
  TOGGLE_SHORTCUT,
} from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "download" });
  const url = localeUrl(locale, DOWNLOAD_PATH);
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: url, languages: languageAlternates(DOWNLOAD_PATH) },
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

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "download" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tPricing = await getTranslations({ locale, namespace: "pricing" });

  const version = getSnapshotLatestVersion();
  const steps = (t.raw("steps") as { title: string; body: string }[]).map(
    (step) => ({
      ...step,
      body: step.body.replace("{shortcut}", TOGGLE_SHORTCUT),
    }),
  );
  const gradient = (chunks: React.ReactNode) => (
    <span className="gradient-text">{chunks}</span>
  );

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Scribbble",
    operatingSystem: MIN_MACOS,
    applicationCategory: "DesignApplication",
    description: tHome("jsonLd.description"),
    inLanguage: locale,
    url: `${SITE_URL}${localeUrl(locale, DOWNLOAD_PATH)}`,
    downloadUrl: DOWNLOAD_URL,
    ...(version ? { softwareVersion: version } : {}),
    offers: {
      "@type": "Offer",
      price: String(PRICE_USD),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: BUY_URL,
      description: tPricing("jsonLdOffer"),
    },
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
      {[softwareJsonLd, breadcrumbJsonLd].map((data, i) => (
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

      {/* Hero: the download itself */}
      <section className="relative py-16 md:py-24 px-4 blob-bg overflow-hidden">
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
            {t.rich("heroTitle", { gradient })}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("heroSubtitle")}
          </p>

          <DownloadStarter
            labels={{
              cta: t("cta"),
              starting: t("starting"),
              retryQuestion: t("retryQuestion"),
              retryLink: t("retryLink"),
              notMac: t("notMac"),
            }}
          />

          {version && (
            <p className="mt-6 text-sm text-muted-foreground">
              {t("versionLine", { version })}
              {" · "}
              <a
                href={CHANGELOG_PATH}
                className="underline underline-offset-4 hover:text-primary transition"
              >
                {t("whatsNew")}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* What to do once the DMG lands */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center leading-tight">
            {t.rich("stepsTitle", { gradient })}
          </h2>

          <ol className="grid md:grid-cols-3 gap-6 list-none p-0 m-0">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`relative rounded-3xl border-2 ${
                  i % 2 === 0 ? "border-primary/20" : "border-accent/20"
                } bg-card/60 backdrop-blur p-8`}
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xl font-black"
                >
                  {i + 1}
                </span>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-center text-muted-foreground">{t("tip")}</p>
        </div>
      </section>

      {/* The offer, while the app is installing */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-8 py-14 md:px-16 text-center">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                {t.rich("buyTitle", { gradient, price: PRICE_LABEL })}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("buySubtitle")}
              </p>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-6 text-xl font-bold transition-all duration-300"
              >
                <BuyLink
                  href={BUY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  location="download_page"
                >
                  {tPricing("card.cta", { price: PRICE_LABEL })}
                </BuyLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} showLocaleSwitcher />
    </div>
  );
}
