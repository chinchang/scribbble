import type { TocItem } from "@/lib/blog";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden lg:block"
    >
      <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-4">
        On this page
      </p>
      <ol className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-primary transition block leading-snug"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
