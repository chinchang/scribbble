import type { SVGProps } from "react";

export type FeatureIconName =
  | "pen"
  | "shapes"
  | "whiteboard"
  | "autofade"
  | "spotlight"
  | "highlighter"
  | "snapshot"
  | "magnify"
  | "measure";

/**
 * Hand-drawn style feature glyphs. Every shape carries `pathLength={100}` so
 * the `.sketch-in` CSS animation can draw each one from start to finish on
 * card hover, whatever its real length. Primary strokes use `currentColor`;
 * accent details use the `text-accent` class.
 */
const glyphs: Record<FeatureIconName, React.ReactNode> = {
  pen: (
    <>
      <path pathLength={100} d="M37 6l5 5-21 21-8 3 3-8z" />
      <path pathLength={100} d="M13 27l8 8" />
      <path
        pathLength={100}
        className="text-accent"
        d="M6 42c4-6 8-6 12 0s8 6 12 0 8-6 12 0"
      />
    </>
  ),
  shapes: (
    <>
      <rect pathLength={100} x="5" y="6" width="17" height="14" rx="2.5" />
      <ellipse
        pathLength={100}
        className="text-accent"
        cx="35"
        cy="13"
        rx="8"
        ry="7"
      />
      <path pathLength={100} d="M7 37h33" />
      <path pathLength={100} d="M32 29l8 8-8 8" />
    </>
  ),
  whiteboard: (
    <>
      <rect pathLength={100} x="5" y="7" width="38" height="26" rx="3" />
      <path pathLength={100} d="M15 33l-4 9M33 33l4 9M24 33v4" />
      <path
        pathLength={100}
        className="text-accent"
        d="M12 24c4-9 8-9 12 0s8 9 12 0"
      />
    </>
  ),
  autofade: (
    <>
      <path pathLength={100} d="M5 32c5-12 10-12 15 0" />
      <path pathLength={100} opacity="0.6" d="M20 32c4 8 8 8 12 0" />
      <path pathLength={100} opacity="0.3" d="M32 32c3-6 6-6 10 0" />
      <circle pathLength={100} className="text-accent" cx="36" cy="12" r="7" />
      <path pathLength={100} className="text-accent" d="M36 8v4h3" />
    </>
  ),
  spotlight: (
    <>
      <rect
        pathLength={100}
        x="5"
        y="7"
        width="38"
        height="34"
        rx="4"
        opacity="0.45"
      />
      <circle pathLength={100} className="text-accent" cx="24" cy="24" r="9" />
      <path
        pathLength={100}
        className="text-accent"
        d="M24 9v3M24 36v3M9 24h3M36 24h3"
      />
    </>
  ),
  highlighter: (
    <>
      <path pathLength={100} d="M28 5l13 13-12 12L16 17z" />
      <path pathLength={100} d="M16 17l-5 5-2 9 9-2 5-5" />
      <path
        pathLength={100}
        className="text-accent"
        strokeWidth="7"
        opacity="0.6"
        d="M9 42h30"
      />
    </>
  ),
  snapshot: (
    <>
      <rect pathLength={100} x="5" y="14" width="38" height="26" rx="4" />
      <path pathLength={100} d="M16 14l3-6h10l3 6" />
      <circle pathLength={100} className="text-accent" cx="24" cy="27" r="7" />
      <path pathLength={100} className="text-accent" d="M36 20h1" />
    </>
  ),
  magnify: (
    <>
      <circle pathLength={100} cx="20" cy="20" r="13" />
      <path pathLength={100} strokeWidth="3.5" d="M30 30l12 12" />
      <path pathLength={100} className="text-accent" d="M14 20h12M20 14v12" />
    </>
  ),
  measure: (
    <>
      <path pathLength={100} d="M6 34L34 6l8 8-28 28z" />
      <path
        pathLength={100}
        className="text-accent"
        d="M13 27l4 4M19 21l6 6M25 15l4 4"
      />
    </>
  ),
};

export default function FeatureIcon({
  name,
  ...props
}: { name: FeatureIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {glyphs[name]}
    </svg>
  );
}
