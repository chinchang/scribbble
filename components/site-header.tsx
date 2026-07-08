import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DOWNLOAD_URL } from "@/lib/site-config";

export default function SiteHeader({
  homeHref = "/",
  ctaLabel = "Get Scribbble",
}: {
  homeHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="relative border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href={homeHref} className="flex items-center space-x-3">
          <Img src="/icon.png" alt="Scribbble" width={40} height={40} />
          <span className="text-2xl font-bold gradient-text">Scribbble</span>
        </Link>
        <Button
          asChild
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            {ctaLabel}
          </a>
        </Button>
      </div>
    </header>
  );
}
