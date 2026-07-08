import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  DollarSign,
  Download,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Palette,
  Layers,
} from "lucide-react";
import Img from "next/image";
import { Link } from "@/i18n/navigation";
import SiteFooter from "@/components/site-footer";
import BuyLink from "@/components/buy-link";
import { personas } from "@/lib/personas";
import { listicles } from "@/lib/listicles";
import { comparisons } from "@/lib/comparisons";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE_URL, DOWNLOAD_URL, BUY_URL } from "@/lib/site-config";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tHeader = await getTranslations({ locale, namespace: "header" });

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Scribbble",
    operatingSystem: "macOS 11.0+",
    applicationCategory: "DesignApplication",
    description: t("jsonLd.description"),
    inLanguage: locale,
    url: SITE_URL,
    image: `${SITE_URL}/social-2.png`,
    featureList: t.raw("jsonLd.featureList"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: t("jsonLd.offerDescription"),
    },
    author: {
      "@type": "Person",
      name: "Kushagra Gour",
      url: "https://kushagra.dev",
    },
  };

  const cards = t.raw("cards") as { title: string; body: string }[];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <header className="relative border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="absolute inset-0 blob-bg"></div>
        <div className="container mx-auto px-4 py-6 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className=" puls-glow transform rotate-12">
              <Img
                src="/icon.png"
                alt="Scribbble Logo"
                className=""
                width={40}
                height={40}
              />
            </div>
            <span className="text-2xl font-bold gradient-text">Scribbble</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <BuyLink
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
              location="home_nav"
            >
              {tHeader("buyLicense")}
            </BuyLink>
          </nav>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              {tHeader("cta")}
            </a>
          </Button>
        </div>
      </header>

      <section className="relative py-32 px-4 blob-bg">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto text-center max-w-6xl relative">
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-red-100/10 to-accent/10 text-primary border-primary/30 px-6 py-2 text-lg font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("badge")}
            </Badge>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            {t.rich("heroTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
              underline: (chunks) => (
                <span className="relative">
                  {chunks}
                  <svg
                    className="absolute -bottom-4 left-0 w-full h-6 text-accent draw-animation"
                    viewBox="0 0 300 20"
                  >
                    <path
                      d="M5 15 Q150 5 295 15"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              ),
            })}
          </h1>

          <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            {t.rich("heroSubtitle", {
              strong: (chunks) => (
                <span className="text-primary font-bold">{chunks}</span>
              ),
            })}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
            >
              <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Download className="w-6 h-6 mr-3" />
                {t("tryFree")}
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-12 py-6 text-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300 bg-transparent"
            >
              <BuyLink
                href={BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                location="home_hero"
              >
                <Star className="w-6 h-6 mr-3" />
                {t("buyLicense")}
                <ArrowRight className="w-5 h-5 ml-3" />
              </BuyLink>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <Zap className="w-8 h-8 text-accent" />
              <span className="text-lg font-semibold">{t("chipZeroSetup")}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-lg font-semibold">{t("chipPayOnce")}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <Palette className="w-8 h-8 text-accent" />
              <span className="text-lg font-semibold">{t("chipAnyApp")}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="py-32 px-4 bg-gradient-to-br from-card to-background"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              {t.rich("demoTitle", {
                gradient: (chunks) => (
                  <span className="gradient-text">{chunks}</span>
                ),
              })}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("demoSubtitle")}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-12 border-2 border-primary/20">
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <iframe
                style={{ aspectRatio: "560 / 315", width: "100%" }}
                src="https://www.youtube.com/embed/Ghcb4ElDlF4?si=H30vDZti0-W2OmJ2"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* SEO content section: cluster targeting "screen annotation tool mac", "mac screen annotation", "annotation app for mac" */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              {t.rich("seoTitle", {
                gradient: (chunks) => (
                  <span className="gradient-text">{chunks}</span>
                ),
              })}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("seoSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={`rounded-2xl border-2 ${
                  i % 2 === 0 ? "border-primary/20" : "border-accent/20"
                } bg-card/60 p-8`}
              >
                <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          {/* Internal links — use cluster keywords as anchor text */}
          <div className="rounded-2xl border-2 border-primary/20 bg-card/40 p-8">
            <h3 className="text-2xl font-bold mb-6">
              {t("linksWorkflowsTitle")}
            </h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {personas.map((p) => (
                <Link
                  key={p.slug}
                  href={`/for/${p.slug}`}
                  className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
                >
                  {t("linkPersona", {
                    audience:
                      locale === "en" ? p.audience.toLowerCase() : p.audience,
                  })}
                </Link>
              ))}
            </div>

            <h3 className="text-2xl font-bold mb-6">
              {t("linksCompareTitle")}
            </h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {comparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/vs/${c.slug}`}
                  className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
                >
                  {t("linkVs", { competitor: c.competitor })}
                </Link>
              ))}
              <Link
                href="/vs/zoomit-vs-epic-pen"
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                {t("linkZoomitVsEpicPen")}
              </Link>
            </div>

            <h3 className="text-2xl font-bold mb-6">{t("linksGuidesTitle")}</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {listicles.map((l) => (
                <Link
                  key={l.slug}
                  href={`/best/${l.slug}`}
                  className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
                >
                  {l.h1}
                </Link>
              ))}
              <a
                href="/blog/screen-annotation-guide"
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {t("linkGuide")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="download"
        className="py-32 px-4 bg-gradient-to-br from-background to-card"
      >
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            {t.rich("downloadTitle", {
              gradient: (chunks) => (
                <span className="gradient-text">{chunks}</span>
              ),
            })}
          </h2>
          <p className="text-2xl text-muted-foreground mb-12 leading-relaxed">
            {t("downloadSubtitle")}
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 mb-8"
          >
            <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
              <Download className="w-8 h-8 mr-4" />
              {t("tryFree")}
            </a>
          </Button>
          <div className="flex items-center justify-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>{t("chipMacos")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>{t("chipNoSignup")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-accent" />
              <span>{t("chipRefund")}</span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} showLocaleSwitcher />
    </div>
  );
}
