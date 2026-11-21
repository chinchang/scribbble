import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import BuyLink from "@/components/buy-link";
import { cn } from "@/lib/utils";
import SaleSwitchClient from "@/components/sale-switch-client";
import {
  SALE,
  BUY_URL,
  PRICE_LABEL,
  SALE_PRICE_LABEL,
  isSaleActive,
} from "@/lib/site-config";

/** Values for the `sale.*` messages: percent, localized end date, prices. */
export function saleValues(locale: string) {
  return {
    percent: SALE.percent,
    date: new Intl.DateTimeFormat(locale, {
      month: "long",
      day: "numeric",
      timeZone: SALE.endsAtTimeZone,
    }).format(new Date(SALE.endsAt)),
    price: PRICE_LABEL,
    salePrice: SALE_PRICE_LABEL,
    code: SALE.code,
  };
}

/** Regular price, struck through, with a screen-reader label. */
export function RegularPrice({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <s className={cn("opacity-60 decoration-2", className)}>
      <span className="sr-only">{label} </span>
      {children}
    </s>
  );
}

/** Shows `on` during the sale and `off` (default: nothing) otherwise. */
export function SaleSwitch({ on, off }: { on: ReactNode; off?: ReactNode }) {
  if (!SALE.enabled) return <>{off ?? null}</>;
  return <SaleSwitchClient initial={isSaleActive()} on={on} off={off} />;
}

/** Small highlighter-yellow "35% off" pill. */
export function SaleTag({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-yellow-300 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-neutral-950 -rotate-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin strip above the header on every page while the sale runs. */
export async function SaleBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sale" });
  const v = saleValues(locale);
  const regularLabel = t("regularPriceLabel");

  return (
    <SaleSwitch
      on={
        <div className="relative z-10 bg-neutral-950 text-white text-sm">
          <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span>
              {t.rich("banner", {
                ...v,
                strong: (chunks) => (
                  <strong className="font-black">{chunks}</strong>
                ),
                tag: (chunks) => <SaleTag className="mx-1">{chunks}</SaleTag>,
              })}
            </span>
            <span className="font-bold">
              <RegularPrice label={regularLabel}>{v.price}</RegularPrice>{" "}
              <span className="text-yellow-300">{v.salePrice}</span>
            </span>
            {v.code && (
              <span>
                {t.rich("code", {
                  code: v.code,
                  c: (chunks) => (
                    <code className="rounded bg-white/15 px-1.5 py-0.5 font-mono font-bold">
                      {chunks}
                    </code>
                  ),
                })}
              </span>
            )}
            <BuyLink
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              location="sale_banner"
              className="font-bold text-yellow-300 underline decoration-2 decoration-yellow-300/50 underline-offset-4 hover:decoration-yellow-300 transition"
            >
              {t("bannerCta")}
            </BuyLink>
          </div>
        </div>
      }
    />
  );
}
