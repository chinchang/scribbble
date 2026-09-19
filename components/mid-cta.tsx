import type { ReactNode } from "react";
import Img from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadLink from "@/components/download-link";
import { DOWNLOAD_URL } from "@/lib/site-config";

type Props = {
  title: ReactNode;
  subtitle: string;
  cta: string;
  /** Small "or buy a license" line rendered under the button. */
  buyLine: ReactNode;
  chips: string[];
  /** GA4 `location` param for the download click. */
  location: string;
};

/**
 * Compact download band for the middle of a long page: one primary button,
 * a text link to buy, and the trust chips. Used once the visitor has seen
 * the demo and the toolkit and just needs a nudge.
 */
export default function MidCta({
  title,
  subtitle,
  cta,
  buyLine,
  chips,
  location,
}: Props) {
  return (
    <section className="px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-8 py-14 md:px-16 text-center">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative">
            <div className="mx-auto mb-6 w-16 h-16 rotate-12">
              <Img src="/icon.png" alt="" width={64} height={64} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {subtitle}
            </p>

            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
            >
              <DownloadLink
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                location={location}
              >
                <Download className="w-6 h-6 mr-3" />
                {cta}
              </DownloadLink>
            </Button>

            <p className="mt-5 text-muted-foreground">{buyLine}</p>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground list-none p-0 m-0">
              {chips.map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  ></span>
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
