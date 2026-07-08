"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  ja: "日本語",
  de: "Deutsch",
  hi: "हिन्दी",
  nl: "Nederlands",
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {routing.locales.map((l) => (
        <li key={l}>
          {l === locale ? (
            <span className="font-medium text-foreground" aria-current="true">
              {LOCALE_NAMES[l]}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={l}
              className="text-muted-foreground hover:text-primary transition font-medium"
            >
              {LOCALE_NAMES[l]}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
