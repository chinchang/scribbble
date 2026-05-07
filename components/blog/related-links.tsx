import Link from "next/link";
import type { ReactNode } from "react";

type Link = { href: string; label: string };

export default function RelatedLinks({
  title = "Keep reading",
  links,
}: {
  title?: string;
  links: Link[];
}) {
  return (
    <aside className="not-prose my-10 rounded-3xl border-2 border-primary/20 bg-card/60 p-6 md:p-8">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-primary hover:underline font-medium"
            >
              {l.label} →
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
