"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from "react";
import { isSaleActive, saleBuyUrl } from "@/lib/site-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** GA4 event name, e.g. "buy_click" / "download_click". */
  event: string;
  /** Where on the site the link lives, e.g. "home_hero". */
  location?: string;
};

// Plain <a> that fires a GA4 event on click. Safe to render inside
// server components (it's the only client boundary needed for tracking).
const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  function TrackedLink({ onClick, event, location, children, ...rest }, ref) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      try {
        if (
          typeof window !== "undefined" &&
          typeof window.gtag === "function"
        ) {
          window.gtag("event", event, { location: location ?? "unknown" });
        }
      } catch {}
      onClick?.(e);
    };

    return (
      <a ref={ref} {...rest} onClick={handleClick}>
        {children}
      </a>
    );
  },
);

export default TrackedLink;

type PresetLinkProps = Omit<TrackedLinkProps, "event">;

// During a sale with a discount code (SALE.code), every buy link gets the
// code pre-filled at checkout. Done after hydration so the static HTML stays
// the plain checkout URL and the code drops off by itself once the sale ends.
export const BuyLink = forwardRef<HTMLAnchorElement, PresetLinkProps>(
  function BuyLink({ href, ...props }, ref) {
    const [finalHref, setFinalHref] = useState(href);
    useEffect(() => {
      setFinalHref(href && isSaleActive() ? saleBuyUrl(href) : href);
    }, [href]);
    return (
      <TrackedLink ref={ref} event="buy_click" href={finalHref} {...props} />
    );
  },
);

export const DownloadLink = forwardRef<HTMLAnchorElement, PresetLinkProps>(
  function DownloadLink(props, ref) {
    return <TrackedLink ref={ref} event="download_click" {...props} />;
  },
);
