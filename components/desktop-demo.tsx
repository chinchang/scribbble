"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Img from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  PenTool,
  Square,
  Highlighter,
  Ruler,
  Flashlight,
  ZoomIn,
  Type,
  Presentation,
  Camera,
  Trash2,
  EyeOff,
  X,
  Wifi,
  BatteryFull,
  Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type ToolId =
  | "pen"
  | "rectangle"
  | "highlighter"
  | "measure"
  | "spotlight"
  | "magnify"
  | "text"
  | "whiteboard"
  | "autofade"
  | "snapshot"
  | "clear"
  | "hide"
  | "close";

type Pt = { x: number; y: number };
type Rect = { left: number; top: number; width: number; height: number };

const TOOL_COLORS: Partial<Record<ToolId, string>> = {
  pen: "#ff453a",
  rectangle: "#ff9f0a",
  highlighter: "#ffd60a",
  measure: "#32d74b",
  text: "#bf5af2",
  autofade: "#0a84ff",
  whiteboard: "#1c1c1e",
};

const LENS_R = 84;
const SPOT_R = 110;
const SVG_NS = "http://www.w3.org/2000/svg";

class Cancelled extends Error {}

/* ------------------------------------------------------------------ */
/* Small math helpers                                                  */
/* ------------------------------------------------------------------ */

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const jitter = (amount: number) => (Math.random() - 0.5) * amount;

/** Slightly wobbly ellipse, a bit more than a full turn, like a hand-drawn circle. */
function ellipsePoints(cx: number, cy: number, rx: number, ry: number): Pt[] {
  const pts: Pt[] = [];
  const n = 52;
  const start = -1.1;
  const sweep = Math.PI * 2 * 1.12;
  const phase = Math.random() * Math.PI;
  for (let i = 0; i <= n; i++) {
    const a = start + (sweep * i) / n;
    const wob = 1 + 0.035 * Math.sin(3 * a + phase);
    pts.push({
      x: cx + Math.cos(a) * rx * wob + jitter(1.5),
      y: cy + Math.sin(a) * ry * wob + jitter(1.5),
    });
  }
  return pts;
}

function wavyLine(a: Pt, b: Pt, amp = 2.5, n = 24): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({
      x: lerp(a.x, b.x, t) + jitter(1),
      y: lerp(a.y, b.y, t) + Math.sin(t * Math.PI * 4) * amp + jitter(1),
    });
  }
  return pts;
}

function polyline(points: Pt[], n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({
        x: lerp(points[i].x, points[i + 1].x, t) + jitter(1.2),
        y: lerp(points[i].y, points[i + 1].y, t) + jitter(1.2),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

function toPath(pts: Pt[]): string {
  if (!pts.length) return "";
  return pts
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/* ------------------------------------------------------------------ */
/* The fake desktop scene (wallpaper + document window + dock)         */
/* ------------------------------------------------------------------ */

const DOCK_TILES = [
  "from-sky-400 to-blue-600",
  "from-slate-200 to-slate-400",
  "from-emerald-400 to-green-600",
  "from-pink-400 to-rose-600",
  "from-amber-300 to-orange-500",
  "from-violet-400 to-purple-600",
  "from-slate-700 to-slate-900",
];

function DesktopScene({
  registerTarget,
  interactive,
}: {
  registerTarget?: (name: string, el: HTMLElement | null) => void;
  interactive?: boolean;
}) {
  const reg = (name: string) => (el: HTMLElement | null) =>
    registerTarget?.(name, el);
  const bars = [38, 56, 44, 72, 92, 64];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <Img
        src="/demo-wallpaper.jpg"
        alt=""
        fill
        sizes="100vw"
        priority={interactive}
        draggable={false}
        className="object-cover select-none"
      />

      {/* Document window */}
      <div
        ref={reg("window")}
        className="absolute left-[5%] top-[12%] w-[62%] sm:w-[54%] h-[62%] rounded-xl bg-[#f6f6f8] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/20 overflow-hidden flex flex-col"
      >
        <div className="h-9 shrink-0 bg-[#ececef] border-b border-black/10 flex items-center px-3 gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          <span className="mx-auto h-2.5 w-28 rounded-full bg-black/10" />
          <span className="w-9" />
        </div>
        <div className="flex-1 p-[5%] flex flex-col gap-[4%] min-h-0">
          <div
            ref={reg("heading")}
            className="h-[9%] w-[58%] rounded-md bg-slate-800/80"
          />
          <div className="flex flex-col gap-[3%] h-[24%]">
            <div
              ref={reg("line1")}
              className="h-1/4 w-[92%] rounded-full bg-slate-400/60"
            />
            <div
              ref={reg("line2")}
              className="h-1/4 w-[84%] rounded-full bg-slate-400/60"
            />
            <div
              ref={reg("line3")}
              className="h-1/4 w-[70%] rounded-full bg-slate-400/60"
            />
          </div>
          <div className="flex-1 flex items-end gap-[5%] min-h-0">
            <div
              ref={reg("chart")}
              className="h-full w-[62%] flex items-end gap-[6%] border-b-2 border-slate-300 pb-0"
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  ref={i === 4 ? reg("bar") : undefined}
                  className={`flex-1 rounded-t-md ${
                    i === 4
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      : "bg-gradient-to-t from-slate-400 to-slate-300"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex-1 h-full flex flex-col justify-end gap-[8%]">
              <div className="h-[10%] w-full rounded-full bg-slate-300/80" />
              <div className="h-[10%] w-[80%] rounded-full bg-slate-300/80" />
              <div
                ref={reg("button")}
                className="h-[22%] w-[85%] rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dock */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-end gap-2 px-3 py-2 rounded-2xl bg-white/20 backdrop-blur-xl ring-1 ring-white/30 shadow-lg">
        {DOCK_TILES.map((c, i) => (
          <span
            key={i}
            className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${c} shadow-md shadow-black/30 ring-1 ring-white/20`}
          />
        ))}
        <span className="relative w-10 h-10 rounded-[10px] shadow-md shadow-black/30">
          <Img src="/icon.png" alt="" width={40} height={40} className="rounded-[10px]" />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/90" />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                              */
/* ------------------------------------------------------------------ */

function AutofadeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12c2-4.5 4-4.5 6 0s4 4.5 6 0 4-4.5 6 0" />
    </svg>
  );
}

const TOOL_ICONS: Record<ToolId, ReactNode> = {
  pen: <PenTool className="w-[22px] h-[22px]" />,
  rectangle: <Square className="w-[22px] h-[22px]" />,
  highlighter: <Highlighter className="w-[22px] h-[22px]" />,
  measure: <Ruler className="w-[22px] h-[22px]" />,
  spotlight: <Flashlight className="w-[22px] h-[22px]" />,
  magnify: <ZoomIn className="w-[22px] h-[22px]" />,
  text: <Type className="w-[22px] h-[22px]" />,
  whiteboard: <Presentation className="w-[22px] h-[22px]" />,
  autofade: <AutofadeIcon className="w-[22px] h-[22px]" />,
  snapshot: <Camera className="w-[22px] h-[22px]" />,
  clear: <Trash2 className="w-[22px] h-[22px]" />,
  hide: <EyeOff className="w-[22px] h-[22px]" />,
  close: <X className="w-[22px] h-[22px]" />,
};

const TOOL_ORDER: ToolId[] = [
  "pen",
  "rectangle",
  "highlighter",
  "measure",
  "spotlight",
  "magnify",
  "text",
  "whiteboard",
  "autofade",
  "snapshot",
  "clear",
  "hide",
  "close",
];

/* ------------------------------------------------------------------ */
/* Menu bar clock: the viewer's own local time, refreshed each minute   */
/* ------------------------------------------------------------------ */

function useMenuBarClock(locale: string) {
  // Empty on the server and first paint so the markup matches on hydration.
  const [clock, setClock] = useState({ date: "", time: "" });
  useEffect(() => {
    const dateFmt = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeFmt = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
    let timer = 0;
    const tick = () => {
      const now = new Date();
      setClock({ date: dateFmt.format(now), time: timeFmt.format(now) });
      // Re-run just after the next minute boundary.
      timer = window.setTimeout(
        tick,
        60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50,
      );
    };
    tick();
    return () => clearTimeout(timer);
  }, [locale]);
  return clock;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function DesktopDemo() {
  const t = useTranslations("home.desktopDemo");
  const locale = useLocale();
  const clock = useMenuBarClock(locale);

  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const annRef = useRef<SVGGElement>(null);
  const wbRef = useRef<HTMLDivElement>(null);
  const wbSvgRef = useRef<SVGGElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const lensInnerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textBodyRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const targets = useRef<Record<string, HTMLElement>>({});

  const visibleRef = useRef(false);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [toolbarScale, setToolbarScale] = useState(1);
  const [active, setActive] = useState<ToolId | null>("pen");
  const [tooltip, setTooltip] = useState<ToolId | null>(null);
  const [color, setColor] = useState(TOOL_COLORS.pen!);
  const [reduced, setReduced] = useState(false);
  const [focused, setFocused] = useState(false);

  const registerTarget = useCallback(
    (name: string, el: HTMLElement | null) => {
      if (el) targets.current[name] = el;
      else delete targets.current[name];
    },
    [],
  );

  /* Track visibility, size and motion preference. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

    // Keep the whole desktop visible under the sticky site header.
    const header = document.querySelector<HTMLElement>("header");
    const offset = header ? Math.round(header.getBoundingClientRect().height) : 0;
    section.style.setProperty("--demo-offset", `${offset}px`);

    // One observer, three jobs: 15% runs the demo, 60% snaps the section to
    // the top of the viewport, 80% lifts the grayscale filter.
    let prevRatio: number | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        visibleRef.current = ratio >= 0.15;
        setFocused(ratio >= 0.8);
        if (prevRatio !== null && prevRatio < 0.6 && ratio >= 0.6) {
          section.scrollIntoView({
            block: "start",
            behavior: mq.matches ? "auto" : "smooth",
          });
        }
        prevRatio = ratio;
      },
      { threshold: [0, 0.15, 0.6, 0.8] },
    );
    io.observe(section);

    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect();
        // Cap the toolbar at 80% of the section height (offsetHeight ignores the scale).
        const natural = toolbarRef.current?.offsetHeight ?? 0;
        setToolbarScale(natural ? Math.min(1, (r.height * 0.8) / natural) : 1);
        setSize((s) =>
          Math.abs(s.w - r.width) < 1 && Math.abs(s.h - r.height) < 1
            ? s
            : { w: r.width, h: r.height },
        );
      });
    });
    ro.observe(section);

    return () => {
      mq.removeEventListener("change", onMq);
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* The self-playing script. Restarts whenever the section is resized. */
  useEffect(() => {
    if (reduced || size.w === 0) return;
    const section = sectionRef.current!;
    const cursor = cursorRef.current!;
    const ctl = { cancelled: false };
    const cur: Pt = { x: size.w * 0.5, y: size.h * 0.55 };

    /* ---- primitives ------------------------------------------------ */

    const frozen = () => !visibleRef.current || document.hidden;

    const tween = (ms: number, fn: (t: number) => void) =>
      new Promise<void>((resolve, reject) => {
        let prev = performance.now();
        let elapsed = 0;
        const frame = (now: number) => {
          if (ctl.cancelled) return reject(new Cancelled());
          const dt = now - prev;
          prev = now;
          if (!frozen()) elapsed += dt;
          const tt = ms <= 0 ? 1 : Math.min(1, elapsed / ms);
          fn(tt);
          if (tt < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    const wait = (ms: number) => tween(ms, () => {});

    const placeCursor = (p: Pt) => {
      cur.x = p.x;
      cur.y = p.y;
      cursor.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    placeCursor(cur);

    const moveTo = async (to: Pt, speed = 1.4) => {
      const from = { ...cur };
      const d = dist(from, to);
      const ms = Math.max(260, Math.min(1400, d / speed));
      await tween(ms, (t) => {
        const e = easeInOut(t);
        placeCursor({ x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) });
      });
    };

    const press = async () => {
      cursor.dataset.pressed = "true";
      await wait(110);
      cursor.dataset.pressed = "";
    };

    const rectOf = (name: string): Rect => {
      const el = targets.current[name];
      const s = section.getBoundingClientRect();
      if (!el) return { left: 0, top: 0, width: 0, height: 0 };
      const r = el.getBoundingClientRect();
      return {
        left: r.left - s.left,
        top: r.top - s.top,
        width: r.width,
        height: r.height,
      };
    };

    const toolCenter = (tool: ToolId): Pt => {
      const btn = toolbarRef.current?.querySelector<HTMLElement>(
        `[data-tool="${tool}"]`,
      );
      if (!btn) return cur;
      const s = section.getBoundingClientRect();
      const r = btn.getBoundingClientRect();
      return {
        x: r.left - s.left + r.width / 2 - 2,
        y: r.top - s.top + r.height / 2 - 2,
      };
    };

    /* ---- overlays --------------------------------------------------- */

    const setSpot = (on: boolean) => {
      spotRef.current!.style.opacity = on ? "1" : "0";
    };
    const spotAt = (p: Pt) => {
      const el = spotRef.current!;
      el.style.setProperty("--x", `${p.x}px`);
      el.style.setProperty("--y", `${p.y}px`);
    };
    const setLens = (on: boolean) => {
      lensRef.current!.style.opacity = on ? "1" : "0";
      lensRef.current!.style.scale = on ? "1" : "0.6";
    };
    const lensAt = (p: Pt) => {
      lensRef.current!.style.transform = `translate(${p.x - LENS_R}px, ${
        p.y - LENS_R
      }px)`;
      lensInnerRef.current!.style.transform = `translate(${LENS_R - 2 * p.x}px, ${
        LENS_R - 2 * p.y
      }px) scale(2)`;
    };
    const setWhiteboard = (on: boolean) => {
      wbRef.current!.style.opacity = on ? "1" : "0";
      if (!on)
        setTimeout(() => wbSvgRef.current?.replaceChildren(), 450);
    };
    const setAnnVisible = (on: boolean) => {
      annRef.current!.style.opacity = on ? "1" : "0";
      textRef.current!.style.opacity = on ? "1" : "0";
    };
    const clearAll = () => {
      annRef.current?.replaceChildren();
      textRef.current!.style.opacity = "0";
      textBodyRef.current!.textContent = "";
    };
    const setToolbar = (on: boolean) => {
      toolbarRef.current!.dataset.hidden = on ? "" : "true";
    };

    /* ---- tool selection --------------------------------------------- */

    let current: ToolId | null = null;
    const selectTool = async (tool: ToolId) => {
      await moveTo(toolCenter(tool), 1.6);
      setTooltip(tool);
      await wait(180);
      await press();
      // leave previous mode
      if (current === "spotlight") setSpot(false);
      if (current === "magnify") setLens(false);
      if (current === "whiteboard") setWhiteboard(false);
      current = tool;
      const isMode = !["snapshot", "clear", "hide", "close"].includes(tool);
      if (isMode) setActive(tool);
      const c = TOOL_COLORS[tool];
      if (c) setColor(c);
      await wait(420);
      setTooltip(null);
    };

    /* ---- drawing ---------------------------------------------------- */

    type StrokeStyle = {
      color: string;
      width: number;
      opacity?: number;
      cap?: "round" | "butt";
    };

    const drawStroke = async (
      pts: Pt[],
      style: StrokeStyle,
      parent: SVGGElement,
      speed = 0.9,
    ) => {
      await moveTo(pts[0]);
      await press();
      const path = svgEl("path", {
        d: "",
        fill: "none",
        stroke: style.color,
        "stroke-width": style.width,
        "stroke-opacity": style.opacity ?? 1,
        "stroke-linecap": style.cap ?? "round",
        "stroke-linejoin": "round",
      });
      parent.appendChild(path);
      const cum = [0];
      for (let i = 1; i < pts.length; i++)
        cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
      const total = cum[cum.length - 1];
      await tween(Math.max(300, total / speed), (t) => {
        const s = t * total;
        let i = 1;
        while (i < cum.length && cum[i] < s) i++;
        const head = pts.slice(0, i);
        if (i < pts.length) {
          const seg = cum[i] - cum[i - 1] || 1;
          const k = (s - cum[i - 1]) / seg;
          head.push({
            x: lerp(pts[i - 1].x, pts[i].x, k),
            y: lerp(pts[i - 1].y, pts[i].y, k),
          });
        }
        path.setAttribute("d", toPath(head));
        placeCursor(head[head.length - 1]);
      });
      return path;
    };

    const dragRect = async (a: Pt, b: Pt, stroke: string) => {
      await moveTo(a);
      await press();
      const rect = svgEl("rect", {
        x: a.x,
        y: a.y,
        width: 0,
        height: 0,
        rx: 4,
        fill: "none",
        stroke,
        "stroke-width": 3.5,
      });
      annRef.current!.appendChild(rect);
      await tween(720, (t) => {
        const e = easeInOut(t);
        const p = { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
        rect.setAttribute("width", String(Math.max(0, p.x - a.x)));
        rect.setAttribute("height", String(Math.max(0, p.y - a.y)));
        placeCursor(p);
      });
    };

    const dragMeasure = async (a: Pt, b: Pt, stroke: string) => {
      await moveTo(a);
      await press();
      const g = svgEl("g", { fill: "none", stroke, "stroke-width": 2.5 });
      const line = svgEl("line", { x1: a.x, y1: a.y, x2: a.x, y2: a.y });
      const capA = svgEl("line", {
        x1: a.x,
        y1: a.y - 8,
        x2: a.x,
        y2: a.y + 8,
      });
      const capB = svgEl("line", { x1: a.x, y1: a.y - 8, x2: a.x, y2: a.y + 8 });
      const labelBg = svgEl("rect", {
        rx: 6,
        fill: stroke,
        stroke: "none",
        height: 22,
        width: 64,
      });
      const label = svgEl("text", {
        fill: "#0b1f14",
        stroke: "none",
        "font-size": 12,
        "font-weight": 700,
        "font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
        "text-anchor": "middle",
      });
      g.append(line, capA, capB, labelBg, label);
      annRef.current!.appendChild(g);
      await tween(900, (t) => {
        const e = easeInOut(t);
        const p = { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
        line.setAttribute("x2", String(p.x));
        line.setAttribute("y2", String(p.y));
        capB.setAttribute("x1", String(p.x));
        capB.setAttribute("x2", String(p.x));
        capB.setAttribute("y1", String(p.y - 8));
        capB.setAttribute("y2", String(p.y + 8));
        const mx = (a.x + p.x) / 2;
        const my = (a.y + p.y) / 2;
        labelBg.setAttribute("x", String(mx - 32));
        labelBg.setAttribute("y", String(my - 32));
        label.setAttribute("x", String(mx));
        label.setAttribute("y", String(my - 17));
        label.textContent = `${Math.round(dist(a, p))} px`;
        placeCursor(p);
      });
    };

    const typeText = async (p: Pt, text: string) => {
      await moveTo(p);
      await press();
      const el = textRef.current!;
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y - 18}px`;
      el.style.opacity = "1";
      el.dataset.typing = "true";
      textBodyRef.current!.textContent = "";
      await wait(250);
      for (const ch of Array.from(text)) {
        textBodyRef.current!.textContent += ch;
        await wait(55 + Math.random() * 70);
      }
      await wait(500);
      el.dataset.typing = "";
    };

    const fadeOutLater = (el: SVGElement, delay: number) => {
      el.style.transition = "opacity 800ms ease";
      setTimeout(() => {
        el.style.opacity = "0";
      }, delay);
    };

    /* ---- the script ------------------------------------------------- */

    const run = async () => {
      // Small settle so the first tool selection feels deliberate.
      await wait(700);
      while (!ctl.cancelled) {
        clearAll();
        setAnnVisible(true);
        setToolbar(true);
        const ann = annRef.current!;

        // 1. Pen: circle the tallest bar, underline the heading
        await selectTool("pen");
        {
          const bar = rectOf("bar");
          const chart = rectOf("chart");
          await drawStroke(
            ellipsePoints(
              bar.left + bar.width / 2,
              bar.top + bar.height / 2,
              bar.width * 1.4 + 6,
              bar.height / 2 + 14,
            ),
            { color: TOOL_COLORS.pen!, width: 4 },
            ann,
          );
          await wait(200);
          const h = rectOf("heading");
          const y = h.top + h.height + 8;
          await drawStroke(
            wavyLine({ x: h.left - 4, y }, { x: h.left + h.width + 6, y }),
            { color: TOOL_COLORS.pen!, width: 4 },
            ann,
            1.1,
          );
          void chart;
        }
        await wait(450);

        // 2. Rectangle around the chart
        await selectTool("rectangle");
        {
          const c = rectOf("chart");
          await dragRect(
            { x: c.left - 12, y: c.top - 10 },
            { x: c.left + c.width + 12, y: c.top + c.height + 12 },
            TOOL_COLORS.rectangle!,
          );
        }
        await wait(450);

        // 3. Highlighter across a line of text
        await selectTool("highlighter");
        {
          const l = rectOf("line2");
          const y = l.top + l.height / 2;
          await drawStroke(
            polyline([
              { x: l.left - 6, y },
              { x: l.left + l.width * 0.7, y: y + 1 },
            ]),
            {
              color: TOOL_COLORS.highlighter!,
              width: Math.max(14, l.height * 2.6),
              opacity: 0.55,
              cap: "butt",
            },
            ann,
            1.3,
          );
        }
        await wait(450);

        // 4. Measure the chart width
        await selectTool("measure");
        {
          const c = rectOf("chart");
          const y = c.top + c.height + 30;
          await dragMeasure(
            { x: c.left, y },
            { x: c.left + c.width, y },
            TOOL_COLORS.measure!,
          );
        }
        await wait(600);

        // 5. Spotlight follows the cursor
        await selectTool("spotlight");
        {
          const c = rectOf("chart");
          const b = rectOf("button");
          const h = rectOf("heading");
          const first = { x: c.left + c.width * 0.6, y: c.top + c.height * 0.5 };
          spotAt(cur);
          setSpot(true);
          const from = { ...cur };
          await tween(700, (t) => {
            const e = easeInOut(t);
            const p = { x: lerp(from.x, first.x, e), y: lerp(from.y, first.y, e) };
            placeCursor(p);
            spotAt(p);
          });
          for (const p of [
            { x: b.left + b.width / 2, y: b.top + b.height / 2 },
            { x: h.left + h.width / 2, y: h.top + h.height / 2 },
          ]) {
            await wait(350);
            const f = { ...cur };
            await tween(900, (t) => {
              const e = easeInOut(t);
              const q = { x: lerp(f.x, p.x, e), y: lerp(f.y, p.y, e) };
              placeCursor(q);
              spotAt(q);
            });
          }
          await wait(500);
        }

        // 6. Magnify: a lens that zooms whatever is under the cursor
        await selectTool("magnify");
        {
          const l1 = rectOf("line1");
          const c = rectOf("chart");
          const start = { x: l1.left + 20, y: l1.top + l1.height / 2 };
          const f = { ...cur };
          await tween(600, (t) => {
            const e = easeInOut(t);
            placeCursor({ x: lerp(f.x, start.x, e), y: lerp(f.y, start.y, e) });
          });
          lensAt(cur);
          setLens(true);
          await wait(250);
          const a = { ...cur };
          const end = { x: c.left + c.width * 0.75, y: c.top + c.height * 0.55 };
          await tween(1600, (t) => {
            const e = easeInOut(t);
            const p = {
              x: lerp(a.x, end.x, e),
              y: lerp(a.y, end.y, e) + Math.sin(e * Math.PI) * -30,
            };
            placeCursor(p);
            lensAt(p);
          });
          await wait(600);
        }

        // 7. Text
        await selectTool("text");
        {
          const w = rectOf("window");
          const tb = toolbarRef.current!.getBoundingClientRect();
          const x = Math.min(w.left + w.width + 28, size.w - tb.width - 200);
          await typeText({ x, y: w.top + 56 }, t("typedText"));
        }
        await wait(500);

        // 8. Whiteboard: blank canvas, sketch a quick flow
        await selectTool("whiteboard");
        {
          setWhiteboard(true);
          await wait(450);
          const wb = wbSvgRef.current!;
          const cx = size.w * 0.42;
          const cy = size.h * 0.5;
          const ink = TOOL_COLORS.whiteboard!;
          const box = (x: number, y: number) =>
            polyline(
              [
                { x: x - 60, y: y - 34 },
                { x: x + 60, y: y - 34 },
                { x: x + 60, y: y + 34 },
                { x: x - 60, y: y + 34 },
                { x: x - 60, y: y - 36 },
              ],
              6,
            );
          await drawStroke(box(cx - 170, cy), { color: ink, width: 4 }, wb, 1.2);
          await wait(120);
          await drawStroke(
            polyline([
              { x: cx - 100, y: cy },
              { x: cx + 100, y: cy },
            ]),
            { color: ink, width: 4 },
            wb,
            1.2,
          );
          await drawStroke(
            polyline([
              { x: cx + 78, y: cy - 18 },
              { x: cx + 102, y: cy },
              { x: cx + 78, y: cy + 18 },
            ], 5),
            { color: ink, width: 4 },
            wb,
            1.2,
          );
          await wait(120);
          await drawStroke(box(cx + 170, cy), { color: ink, width: 4 }, wb, 1.2);
          await wait(200);
          await drawStroke(
            ellipsePoints(cx + 170, cy, 92, 62),
            { color: TOOL_COLORS.pen!, width: 4 },
            wb,
          );
          await wait(900);
        }

        // 9. Auto-fade: strokes that vanish on their own
        await selectTool("autofade");
        {
          const l3 = rectOf("line3");
          const b = rectOf("button");
          const s1 = await drawStroke(
            polyline([
              { x: l3.left + 10, y: l3.top + l3.height + 14 },
              { x: l3.left + 34, y: l3.top + l3.height + 36 },
              { x: l3.left + 86, y: l3.top - 12 },
            ], 8),
            { color: TOOL_COLORS.autofade!, width: 4 },
            ann,
          );
          fadeOutLater(s1, 900);
          await wait(250);
          const s2 = await drawStroke(
            ellipsePoints(
              b.left + b.width / 2,
              b.top + b.height / 2,
              b.width / 2 + 16,
              b.height / 2 + 14,
            ),
            { color: TOOL_COLORS.autofade!, width: 4 },
            ann,
          );
          fadeOutLater(s2, 900);
          await wait(1400);
        }

        // 10. Snapshot: flash + thumbnail
        await selectTool("snapshot");
        {
          const flash = flashRef.current!;
          flash.style.transition = "none";
          flash.style.opacity = "0.85";
          await wait(60);
          flash.style.transition = "opacity 500ms ease";
          flash.style.opacity = "0";
          await wait(300);
          const thumb = thumbRef.current!;
          thumb.dataset.show = "true";
          await wait(1800);
          thumb.dataset.show = "";
          await wait(400);
        }

        // 11. Hide drawings, then show them again
        await selectTool("hide");
        setAnnVisible(false);
        await wait(900);
        await press();
        setAnnVisible(true);
        await wait(700);

        // 12. Clear everything
        await selectTool("clear");
        {
          const ann2 = annRef.current!;
          ann2.style.transition = "opacity 350ms ease";
          ann2.style.opacity = "0";
          textRef.current!.style.opacity = "0";
          await wait(380);
          clearAll();
          ann2.style.transition = "";
          ann2.style.opacity = "1";
        }
        await wait(500);

        // 13. Close the toolbar, wander, bring it back
        await selectTool("close");
        setToolbar(false);
        setActive(null);
        await wait(400);
        await moveTo({ x: size.w * 0.45, y: size.h * 0.6 }, 1.0);
        await wait(900);
        setToolbar(true);
        setActive("pen");
        setColor(TOOL_COLORS.pen!);
        await wait(700);
      }
    };

    run().catch((e) => {
      if (!(e instanceof Cancelled)) console.error(e);
    });

    return () => {
      ctl.cancelled = true;
      annRef.current?.replaceChildren();
      wbSvgRef.current?.replaceChildren();
      if (spotRef.current) spotRef.current.style.opacity = "0";
      if (lensRef.current) lensRef.current.style.opacity = "0";
      if (wbRef.current) wbRef.current.style.opacity = "0";
      if (thumbRef.current) thumbRef.current.dataset.show = "";
      if (textRef.current) textRef.current.style.opacity = "0";
      if (toolbarRef.current) toolbarRef.current.dataset.hidden = "";
      setTooltip(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, reduced]);

  const sceneStyle: CSSProperties = { width: size.w, height: size.h };

  return (
    <section
      ref={sectionRef}
      aria-label={t("ariaLabel")}
      data-focus={focused ? "true" : undefined}
      className="desktop-demo relative h-[calc(100svh-var(--demo-offset,0px))] min-h-[620px] scroll-mt-[var(--demo-offset,0px)] overflow-hidden bg-[#140f2c] text-white select-none grayscale hover:grayscale-0 data-[focus=true]:grayscale-0 transition-[filter] duration-700 ease-out"
    >
      {/* Desktop */}
      <DesktopScene registerTarget={registerTarget} interactive />

      {/* Menu bar */}
      <div
        className="absolute inset-x-0 top-0 h-7 z-10 flex items-center gap-5 px-4 text-[13px] font-medium bg-black/25 backdrop-blur-md text-white/95 shadow-[0_1px_0_rgba(255,255,255,0.08)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 17 20" className="w-[15px] h-[15px] fill-current">
          <path d="M14.2 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8C4.6 5.3 3.1 6.2 2.3 7.6c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-3.9zM11.9 3.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z" />
        </svg>
        <span className="font-bold">Scribbble</span>
        <span className="hidden sm:inline">{t("menu.file")}</span>
        <span className="hidden sm:inline">{t("menu.edit")}</span>
        <span className="hidden sm:inline">{t("menu.view")}</span>
        <span className="hidden md:inline">{t("menu.window")}</span>
        <span className="hidden md:inline">{t("menu.help")}</span>
        <span className="ml-auto flex items-center gap-4">
          <Img src="/icon.png" alt="" width={16} height={16} className="rounded-[4px]" />
          <Search className="w-[14px] h-[14px]" />
          <Wifi className="w-[15px] h-[15px]" />
          <BatteryFull className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline tabular-nums">{clock.date}</span>
          <span className="tabular-nums">{clock.time}</span>
        </span>
      </div>

      {/* Annotation layer */}
      <svg
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        aria-hidden="true"
      >
        <g ref={annRef} />
      </svg>
      <div
        ref={textRef}
        className="absolute z-20 pointer-events-none text-[26px] font-black leading-none whitespace-nowrap opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-opacity duration-200 group/text"
        style={{ color: TOOL_COLORS.text }}
        aria-hidden="true"
      >
        <span ref={textBodyRef} />
        <span className="demo-caret inline-block w-[3px] h-[1em] align-[-0.1em] ml-0.5 bg-current" />
      </div>

      {/* Spotlight */}
      <div
        ref={spotRef}
        className="absolute inset-0 z-30 pointer-events-none opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), transparent ${SPOT_R}px, rgba(0,0,0,0.78) ${SPOT_R + 46}px)`,
        }}
        aria-hidden="true"
      />

      {/* Magnifier lens */}
      <div
        ref={lensRef}
        className="absolute left-0 top-0 z-30 pointer-events-none rounded-full overflow-hidden opacity-0 ring-[3px] ring-white/90 shadow-[0_18px_40px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(0,0,0,0.3)] transition-[opacity,scale] duration-300"
        style={{ width: LENS_R * 2, height: LENS_R * 2, scale: "0.6" }}
        aria-hidden="true"
      >
        <div
          ref={lensInnerRef}
          className="absolute left-0 top-0 origin-top-left"
          style={sceneStyle}
        >
          {size.w > 0 && <DesktopScene />}
        </div>
      </div>

      {/* Whiteboard */}
      <div
        ref={wbRef}
        className="absolute inset-0 z-40 pointer-events-none opacity-0 transition-opacity duration-500"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#fbfbfb] dot-grid" />
        <svg className="absolute inset-0 w-full h-full">
          <g ref={wbSvgRef} />
        </svg>
      </div>

      {/* Snapshot flash + thumbnail */}
      <div
        ref={flashRef}
        className="absolute inset-0 z-50 bg-white opacity-0 pointer-events-none"
        aria-hidden="true"
      />
      <div
        ref={thumbRef}
        className="demo-thumb absolute z-50 bottom-6 right-24 w-44 aspect-[16/10] rounded-lg overflow-hidden border-[3px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.55)] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            ...sceneStyle,
            transform: `scale(${size.w ? 176 / size.w : 1})`,
          }}
        >
          {size.w > 0 && <DesktopScene />}
        </div>
      </div>

      {/* Toolbar */}
      <div
        ref={toolbarRef}
        className="demo-toolbar absolute z-[60] right-3 sm:right-5 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
        style={{ scale: String(toolbarScale), transformOrigin: "right center" }}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-1 px-2 py-3.5 rounded-[22px] bg-[#1c1c20]/95 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
          <span
            className="w-[22px] h-[22px] my-2 rounded-full ring-2 ring-white/15 transition-colors duration-300"
            style={{ background: color }}
          />
          <span className="w-1.5 h-1.5 mb-1.5 rounded-full bg-white/80" />
          <span className="w-7 h-px bg-white/10 my-1.5" />
          {TOOL_ORDER.map((tool) => (
            <span key={tool} className="relative">
              {tool === "close" && (
                <span className="block w-7 h-px bg-white/10 my-1.5 mx-auto" />
              )}
              <span
                data-tool={tool}
                data-active={active === tool ? "true" : undefined}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-200 ${
                  active === tool
                    ? "bg-[#1f4b8f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : tool === "close"
                      ? "text-[#ff6b5b]"
                      : "text-white/85"
                }`}
              >
                {TOOL_ICONS[tool]}
              </span>
              <span
                className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-md bg-[#2b2b30] text-white text-sm font-semibold whitespace-nowrap shadow-lg ring-1 ring-white/10 transition-all duration-200 ${
                  tooltip === tool
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1"
                }`}
              >
                {t(`tools.${tool}`)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Cursor */}
      <div
        ref={cursorRef}
        className="demo-cursor absolute left-0 top-0 z-[70] pointer-events-none will-change-transform"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 20 28"
          className="w-[42px] h-[58px] drop-shadow-[0_4px_7px_rgba(0,0,0,0.5)] transition-transform duration-100 origin-top-left"
        >
          <path
            d="M1.5 1.5v19.5l5-4.6 3.4 7.6 3.3-1.5-3.4-7.4h7.2z"
            fill="#000"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>

    </section>
  );
}
