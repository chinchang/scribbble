import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Callout from "@/components/blog/callout";
import RelatedLinks from "@/components/blog/related-links";

function MdxLink(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href ?? "";
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    const { ref: _ref, ...rest } = props;
    return (
      <Link
        href={href}
        className="text-primary font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
        {...rest}
      />
    );
  }
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
      {...props}
    />
  );
}

export const mdxComponents = {
  a: MdxLink,
  Callout,
  RelatedLinks,
};
