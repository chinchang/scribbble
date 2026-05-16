"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

type BuyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  location?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const BuyLink = forwardRef<HTMLAnchorElement, BuyLinkProps>(function BuyLink(
  { onClick, location, children, ...rest },
  ref,
) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "buy_click", {
          link_url: rest.href,
          location: location ?? "unknown",
        });
      }
    } catch {}
    onClick?.(e);
  };

  return (
    <a ref={ref} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
});

export default BuyLink;
