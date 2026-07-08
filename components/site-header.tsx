import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DOWNLOAD_URL } from "@/lib/site-config";
import { localeUrl } from "@/lib/i18n/seo";
import LocaleDropdown from "@/components/locale-dropdown";

export default async function SiteHeader({
  locale = "en",
  showLocaleSwitcher = false,
}: {
  locale?: string;
  showLocaleSwitcher?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "header" });

  return (
    <header className="relative border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link
          href={localeUrl(locale, "/")}
          className="flex items-center space-x-3"
        >
          <Img src="/icon.png" alt="Scribbble" width={40} height={40} />
          <span className="text-2xl font-bold gradient-text">Scribbble</span>
        </Link>
        <div className="flex items-center gap-2">
          {showLocaleSwitcher && <LocaleDropdown />}
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white"
          >
            <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              {t("cta")}
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
