import type { ReactNode } from "react";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";

type Variant = "tip" | "note" | "warning";

const variants: Record<
  Variant,
  { className: string; Icon: typeof Info; label: string }
> = {
  tip: {
    className: "border-primary/30 bg-primary/5",
    Icon: Lightbulb,
    label: "Tip",
  },
  note: {
    className: "border-accent/30 bg-accent/5",
    Icon: Info,
    label: "Note",
  },
  warning: {
    className: "border-destructive/30 bg-destructive/5",
    Icon: AlertTriangle,
    label: "Heads up",
  },
};

export default function Callout({
  type = "note",
  title,
  children,
}: {
  type?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const v = variants[type];
  const Icon = v.Icon;
  return (
    <aside
      className={`not-prose my-8 rounded-2xl border-2 p-5 md:p-6 flex gap-4 ${v.className}`}
    >
      <Icon className="w-5 h-5 mt-1 flex-shrink-0 text-primary" />
      <div className="space-y-2">
        <p className="font-bold text-foreground">{title ?? v.label}</p>
        <div className="text-foreground/90 leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}
