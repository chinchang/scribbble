"use client";

import { useLocale } from "next-intl";
import { Check, Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE_NAMES } from "@/lib/i18n/locale-names";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LocaleDropdown() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary font-medium"
          aria-label={`Language: ${LOCALE_NAMES[locale]}`}
        >
          <Globe className="w-4 h-4 mr-1" />
          {LOCALE_NAMES[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem key={l} asChild>
            <Link
              href={pathname}
              locale={l}
              className="flex items-center justify-between gap-4 cursor-pointer"
            >
              {LOCALE_NAMES[l]}
              {l === locale && <Check className="w-4 h-4" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
