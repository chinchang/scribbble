"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isSaleActive } from "@/lib/site-config";

/**
 * Renders `on` while the sale runs and `off` afterwards. Pages are statically
 * generated, so `initial` (the build-time answer) is what the HTML ships with;
 * the browser re-checks the clock after hydration, which makes the sale UI
 * vanish at SALE.endsAt even if the site isn't rebuilt.
 */
export default function SaleSwitchClient({
  initial,
  on,
  off = null,
}: {
  initial: boolean;
  on: ReactNode;
  off?: ReactNode;
}) {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    setActive(isSaleActive());
  }, []);
  return <>{active ? on : off}</>;
}
