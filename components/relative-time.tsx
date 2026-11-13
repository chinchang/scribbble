"use client";

import { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
// Past these many days, switch to the next unit ("5 weeks ago" reads worse
// than "last month", so days go straight to months).
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "today", "yesterday", "4 days ago", "2 months ago", "last year". */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const days = Math.max(0, Math.floor((now - Date.parse(iso)) / DAY_MS));
  if (days < DAYS_PER_MONTH) return relativeFormat.format(-days, "day");
  if (days < DAYS_PER_YEAR) {
    return relativeFormat.format(-Math.floor(days / DAYS_PER_MONTH), "month");
  }
  return relativeFormat.format(-Math.floor(days / DAYS_PER_YEAR), "year");
}

type Props = {
  /** ISO timestamp */
  date: string;
  /** Full date, shown as the tooltip. */
  title: string;
  className?: string;
};

/**
 * A date shown as time elapsed. The server renders it as of the last page
 * build; it is recomputed in the browser so a cached page never shows a
 * stale "4 days ago".
 */
export default function RelativeTime({ date, title, className }: Props) {
  const [text, setText] = useState(() => formatRelative(date));

  useEffect(() => {
    setText(formatRelative(date));
  }, [date]);

  return (
    <time
      dateTime={date}
      title={title}
      className={className}
      suppressHydrationWarning
    >
      {text}
    </time>
  );
}
