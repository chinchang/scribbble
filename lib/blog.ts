import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type FaqItem = { q: string; a: string };
export type TocItem = { id: string; label: string };

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  slug: string;
  cover?: string;
  toc?: TocItem[];
  faq?: FaqItem[];
  ogTitle?: string;
};

export type Post = {
  frontmatter: PostFrontmatter;
  content: string;
};

function readPostFile(file: string): Post {
  const fullPath = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? file.replace(/\.mdx?$/, "");
  return {
    frontmatter: { ...(data as Omit<PostFrontmatter, "slug">), slug },
    content,
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map(readPostFile);
  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
}

export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.mdx`;
  const fullPath = path.join(BLOG_DIR, file);
  if (!fs.existsSync(fullPath)) return null;
  return readPostFile(file);
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
