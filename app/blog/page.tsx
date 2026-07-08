import type { Metadata } from "next";
import Link from "next/link";
import Img from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import PostCard from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/blog";

const TITLE = "Scribbble Blog — Guides on Screen Annotation";
const DESCRIPTION =
  "Long-form guides on screen annotation: how to draw on your screen, when to use which tool, and tips for teachers, presenters, designers and creators.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
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

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
          <li className="text-foreground">Blog</li>
        </ol>
      </nav>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            The Scribbble <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Long-form guides on screen annotation — how to draw, when to draw,
            and the tools that make it look intentional rather than messy.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 pb-24">
        <div className="container mx-auto max-w-3xl space-y-6">
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No posts yet. Check back soon.
            </p>
          ) : (
            posts.map((p) => (
              <PostCard key={p.frontmatter.slug} post={p.frontmatter} />
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
