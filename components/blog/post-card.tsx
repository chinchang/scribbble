import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PostFrontmatter } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";

export default function PostCard({ post }: { post: PostFrontmatter }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-3xl border-2 border-primary/20 bg-card/60 p-6 md:p-8 hover:border-primary/50 hover:bg-card transition"
    >
      <p className="text-sm text-muted-foreground mb-3">
        {formatPostDate(post.date)}
      </p>
      <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight group-hover:text-primary transition">
        {post.title}
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-5">
        {post.description}
      </p>
      <span className="inline-flex items-center gap-2 font-bold text-primary">
        Read the guide
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
