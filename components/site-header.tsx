import Link from "next/link";
import DownloadLink from "@/components/download-link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CHANGELOG_PATH } from "@/lib/site-config";
import { localeUrl, downloadCtaUrl } from "@/lib/i18n/seo";
import LocaleDropdown from "@/components/locale-dropdown";
import MobileNav from "@/components/mobile-nav";

const navLinkClass =
  "text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium";

/**
 * Shared site header: logo, Features + Pricing + Changelog nav, optional
 * locale switcher and the download CTA. Used by every page, including the
 * homepage. Below `md` the nav collapses into a menu button (MobileNav).
 */
export default async function SiteHeader({
  locale = "en",
  showLocaleSwitcher = false,
  location = "header",
}: {
  locale?: string;
  showLocaleSwitcher?: boolean;
  /** GA4 `location` for the download CTA, e.g. "home_nav" on the homepage. */
  location?: string;
}) {
  const t = await getTranslations({ locale, namespace: "header" });
  const home = localeUrl(locale, "/");
  const downloadHref = downloadCtaUrl(locale);

  const links = [
    { label: t("features"), href: `${home}#features` },
    { label: t("pricing"), href: localeUrl(locale, "/pricing") },
    // English-only page, same URL from every locale.
    { label: t("changelog"), href: CHANGELOG_PATH },
  ];

  return (
    <header className="relative border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="absolute inset-0 blob-bg pointer-events-none"></div>
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between relative">
        <Link href={home} className="flex items-center space-x-3">
          <span className="inline-block rotate-12">
            <Img src="/icon.png" alt="Scribbble" width={40} height={40} />
          </span>
          <span className="text-2xl font-bold gradient-text">Scribbble</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* The footer carries the language list on small screens. */}
          {showLocaleSwitcher && (
            <div className="hidden md:block">
              <LocaleDropdown />
            </div>
          )}
          <Button
            asChild
            className="hidden sm:inline-flex bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <DownloadLink href={downloadHref} location={location}>
              <Download className="w-4 h-4 mr-2" />
              {t("cta")}
            </DownloadLink>
          </Button>
          <MobileNav
            label={t("menu")}
            links={links}
            cta={{ label: t("cta"), href: downloadHref }}
          />
        </div>
      </div>
    </header>
  );
}
