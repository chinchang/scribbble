"use client";

import { Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DownloadLink from "@/components/download-link";

type Props = {
  /** Accessible name of the menu button. */
  label: string;
  links: { label: string; href: string }[];
  cta: { label: string; href: string };
};

/**
 * Header menu for small screens, where the inline nav is hidden. Labels and
 * hrefs come from the (server) header, so this needs no i18n context and
 * works on the English-only pages too.
 */
export default function MobileNav({ label, links, cta }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className="md:hidden text-foreground"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 md:hidden">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <a
              href={link.href}
              className="cursor-pointer px-3 py-3 text-base font-medium"
            >
              {link.label}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <DownloadLink
            href={cta.href}
            location="mobile_menu"
            className="cursor-pointer px-3 py-3 text-base font-bold text-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            {cta.label}
          </DownloadLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
