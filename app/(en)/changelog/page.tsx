import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadLink from "@/components/download-link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getReleases } from "@/lib/changelog";
import { downloadCtaUrl } from "@/lib/i18n/seo";
import { SITE_URL, CHANGELOG_PATH } from "@/lib/site-config";

const TITLE = "Changelog: What's New in Scribbble";
const DESCRIPTION =
  "Every Scribbble release, newest first: new tools, improvements and fixes for the Mac screen annotation app.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CHANGELOG_PATH },
  openGraph: {
    type: "website",
    url: CHANGELOG_PATH,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social-2.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social-2.png"],
  },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

// Release notes use a little inline markdown: **bold**, `code`, links.
const INLINE =
  /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s)]+)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <kbd
          key={i}
          className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.slice(1, -1)}
        </kbd>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\((.+)\)$/);
    const href = link ? link[2] : /^https?:\/\//.test(part) ? part : null;
    if (href) {
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4"
        >
          {link ? link[1] : part.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      );
    }
    return part;
  });
}

export default async function ChangelogPage() {
  const releases = await getReleases();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Changelog" },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />

      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-8 text-sm text-muted-foreground"
      >
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Changelog</li>
        </ol>
      </nav>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            What&apos;s new in <span className="gradient-text">Scribbble</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {releases.length} releases and counting. Every update is free for
            license holders.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <ol className="container mx-auto max-w-3xl list-none p-0 m-0 border-l-2 border-primary/20">
          {releases.map((release, i) => (
            <li
              key={release.version}
              id={`v${release.version}`}
              className="relative pl-8 pb-14 last:pb-0 scroll-mt-28"
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-background ${
                  i === 0 ? "bg-primary" : "bg-primary/40"
                }`}
              ></span>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
                <h2 className="text-3xl font-black">
                  <a href={`#v${release.version}`} className="hover:text-primary">
                    {release.version}
                  </a>
                  {release.codename && (
                    <span className="ml-3 text-xl font-bold text-muted-foreground">
                      {release.codename}
                    </span>
                  )}
                </h2>
                {i === 0 && (
                  <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    Latest
                  </span>
                )}
                <time
                  dateTime={release.date}
                  className="text-sm text-muted-foreground"
                >
                  {dateFormat.format(new Date(release.date))}
                </time>
              </div>

              {release.sections.map((section, s) => (
                <div key={s} className="mb-6 last:mb-0">
                  {section.title && (
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      {section.title}
                    </h3>
                  )}
                  <ul className="space-y-3 list-none p-0 m-0">
                    {section.items.map((item, k) => (
                      <li
                        key={k}
                        className="text-lg text-muted-foreground leading-relaxed"
                      >
                        {renderInline(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-3xl rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-8 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Get the <span className="gradient-text">latest version</span>
          </h2>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-10 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <DownloadLink href={downloadCtaUrl()} location="changelog_cta">
              <Download className="w-6 h-6 mr-3" />
              Download Scribbble
            </DownloadLink>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
