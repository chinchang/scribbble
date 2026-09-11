"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

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

export const BuyLink = forwardRef<HTMLAnchorElement, PresetLinkProps>(
  function BuyLink(props, ref) {
    return <TrackedLink ref={ref} event="buy_click" {...props} />;
  },
);

export const DownloadLink = forwardRef<HTMLAnchorElement, PresetLinkProps>(
  function DownloadLink(props, ref) {
    return <TrackedLink ref={ref} event="download_click" {...props} />;
  },
);
