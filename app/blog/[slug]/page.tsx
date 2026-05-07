import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Img from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import TableOfContents from "@/components/blog/toc";
import { mdxComponents } from "@/components/mdx-components";
import {
  getAllPostSlugs,
  getPostBySlug,
  formatPostDate,
  type PostFrontmatter,
} from "@/lib/blog";
import { listicles } from "@/lib/listicles";
import { personas } from "@/lib/personas";
import { comparisons } from "@/lib/comparisons";

const SITE_URL = "https://www.scribbble.app";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const fm = post.frontmatter;
  const url = `/blog/${fm.slug}`;
  return {
    title: fm.ogTitle ?? fm.title,
    description: fm.description,
    alternates: { canonical: url },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url,
      type: "article",
      publishedTime: fm.date,
      images: [fm.cover ?? "/social.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.description,
      images: [fm.cover ?? "/social.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const fm: PostFrontmatter = post.frontmatter;

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["heading-anchor"] },
            },
          ],
        ],
      },
    },
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    dateModified: fm.date,
    image: [`${SITE_URL}${fm.cover ?? "/social.png"}`],
    mainEntityOfPage: `${SITE_URL}/blog/${fm.slug}`,
    author: {
      "@type": "Person",
      name: "Kushagra Gour",
      url: "https://kushagra.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "Scribbble",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: fm.title,
      },
    ],
  };

  const faqJsonLd =
    fm.faq && fm.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: fm.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <header className="relative border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Img src="/icon.png" alt="Scribbble" width={40} height={40} />
            <span className="text-2xl font-bold gradient-text">Scribbble</span>
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4 mr-2" />
              Get Scribbble
            </a>
          </Button>
        </div>
      </header>

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
          <li>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground line-clamp-1">{fm.title}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/30 px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            The Complete Guide
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            {fm.title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            {fm.description}
          </p>
          <p className="text-sm text-muted-foreground">
            Published {formatPostDate(fm.date)}
          </p>
        </div>
      </section>

      {/* Body + TOC */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12">
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
            {content}
          </article>
          {fm.toc && fm.toc.length > 0 && (
            <aside>
              <TableOfContents items={fm.toc} />
            </aside>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 mt-8 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Try <span className="gradient-text">Scribbble</span> on your Mac
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Free to download. One-time license. Native macOS — no monthly fee.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent text-white px-12 py-7 text-xl font-bold"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-6 h-6 mr-3" />
              Download Scribbble
            </a>
          </Button>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Hands-on roundups</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {listicles.map((l) => (
              <Link
                key={l.slug}
                href={`/best/${l.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                {l.h1}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Compare Scribbble</h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/10 hover:text-accent transition"
              >
                Scribbble vs {c.competitor}
              </Link>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6">Scribbble for your role</h2>
          <div className="flex flex-wrap gap-3">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              >
                Scribbble for {p.audience}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
