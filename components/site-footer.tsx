import Img from "next/image";
import { getTranslations } from "next-intl/server";
import { personas } from "@/lib/personas";
import { comparisons } from "@/lib/comparisons";
import { listicles } from "@/lib/listicles";
import { BUY_URL } from "@/lib/site-config";
import { localeUrl } from "@/lib/i18n/seo";
import LocaleSwitcher from "@/components/locale-switcher";

export default async function SiteFooter({
  locale = "en",
  showLocaleSwitcher = false,
}: {
  locale?: string;
  showLocaleSwitcher?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="border-t-2 border-primary/20 py-16 px-4 bg-gradient-to-br from-card to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <Img
              src="/icon.png"
              alt="Scribbble Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="text-3xl font-bold gradient-text">Scribbble</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
          <div>
            <h3 className="font-bold text-foreground mb-4">{t("tools")}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/tools/screenshot-annotate"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  {t("screenshotAnnotate")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("learn")}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  {t("blog")}
                </a>
              </li>
              <li>
                <a
                  href="/blog/screen-annotation-guide"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  {t("screenAnnotationGuide")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("for")}</h3>
            <ul className="space-y-3">
              {personas.map((p) => (
                <li key={p.slug}>
                  <a
                    href={localeUrl(locale, `/for/${p.slug}`)}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    {p.audience}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("guides")}</h3>
            <ul className="space-y-3">
              {listicles.map((l) => (
                <li key={l.slug}>
                  <a
                    href={localeUrl(locale, `/best/${l.slug}`)}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    {l.h1}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("compare")}</h3>
            <ul className="space-y-3">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <a
                    href={localeUrl(locale, `/vs/${c.slug}`)}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    {t("scribbbleVs", { competitor: c.competitor })}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={BUY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  {t("buyLicense")}
                </a>
              </li>
              <li>
                <a
                  href="mailto:chinchang457@gmail.com"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  {t("support")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {showLocaleSwitcher && (
          <div className="mb-12">
            <h3 className="font-bold text-foreground mb-4">{t("language")}</h3>
            <LocaleSwitcher />
          </div>
        )}

        <div className="pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-lg">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
