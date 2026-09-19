import { Fragment, type ReactNode } from "react";

export type Testimonial = {
  /** Quote text. Wrap the phrase to highlight in `<hl>…</hl>`. */
  quote: string;
  name: string;
  role: string;
};

type Props = {
  eyebrow: string;
  title: ReactNode;
  items: Testimonial[];
};

/**
 * Render the `<hl>` segments of a quote as highlighter strokes, the way you'd
 * run Scribbble's highlighter over the line that matters.
 */
function renderQuote(quote: string): ReactNode {
  const parts = quote.split(/<hl>(.*?)<\/hl>/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="hl-mark">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Testimonials laid out like annotations on a screen: a numbered step marker
 * on each card, a highlighter stroke through the key phrase, and a hand-drawn
 * circle around the author's name that redraws itself on hover.
 *
 * Works with any number of quotes: one is shown as a single wide card, two
 * split the row, three or more fall into a three-column grid.
 */
export default function Testimonials({ eyebrow, title, items }: Props) {
  if (items.length === 0) return null;

  const single = items.length === 1;
  const gridCols =
    items.length === 1
      ? "grid-cols-1 max-w-3xl"
      : items.length === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-5xl"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl";

  return (
    <section
      id="testimonials"
      className="relative py-32 px-4 overflow-hidden scroll-mt-24"
    >
      <div className="absolute inset-0 dot-grid pointer-events-none"></div>
      <div
        className="absolute -bottom-24 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl float-animation pointer-events-none"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="container mx-auto relative">
        <div className="text-center mb-20">
          <span className="inline-block mb-5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-bold uppercase tracking-[0.2em]">
            {eyebrow}
          </span>
          <h2 className="text-5xl md:text-6xl font-black leading-tight">
            {title}
          </h2>
        </div>

        <ul className={`grid ${gridCols} gap-8 mx-auto list-none p-0 m-0`}>
          {items.map((item, i) => (
            <li key={item.name + i} className="group relative pt-5 pl-5">
              {/* Numbered step marker, dropped on the corner of the card */}
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground font-black text-xl flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-background -rotate-6 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110"
              >
                {i + 1}
              </span>

              <figure
                className={`relative h-full rounded-3xl border-2 border-primary/20 bg-card/70 backdrop-blur p-8 md:p-10 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 ${
                  single ? "md:p-14" : ""
                }`}
              >
                {/* Sketchy rectangle-tool outline, a hair off the card edge */}
                <svg
                  aria-hidden="true"
                  className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] text-accent pointer-events-none"
                  viewBox="0 0 400 300"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                >
                  <path
                    pathLength={100}
                    className="annotate-stroke opacity-60"
                    d="M14 12c110-3 240-4 372 2 4 70 3 180 1 274-130 3-250 4-374-2-2-90-1-180 1-274Z"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <blockquote
                  className={`relative font-semibold leading-snug tracking-tight text-foreground ${
                    single ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 -left-3 text-7xl font-black leading-none text-primary/15 select-none"
                  >
                    &ldquo;
                  </span>
                  <p className="relative">{renderQuote(item.quote)}</p>
                </blockquote>

                <figcaption className="relative mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="relative inline-block px-3 py-1 text-lg font-bold">
                    {item.name}
                    {/* Pen-tool circle around the name */}
                    <svg
                      aria-hidden="true"
                      className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+8px)] text-primary pointer-events-none"
                      viewBox="0 0 200 60"
                      preserveAspectRatio="none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path
                        pathLength={100}
                        className="annotate-stroke"
                        d="M16 32C14 14 60 4 104 5s88 10 82 27c-5 18-50 26-96 24S6 46 12 30c3-7 12-13 24-17"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                  <span className="text-muted-foreground">{item.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
