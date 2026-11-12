"use client";

import { useEffect, useState } from "react";
import { Download, Laptop, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadLink from "@/components/download-link";
import {
  DOWNLOAD_URL,
  DOWNLOAD_AUTOSTART_PARAM,
  DOWNLOAD_AUTOSTART_DELAY_MS,
} from "@/lib/site-config";

type Props = {
  labels: {
    cta: string;
    starting: string;
    retryQuestion: string;
    retryLink: string;
    notMac: string;
  };
};

type Status = "idle" | "starting" | "notMac";

// iPadOS reports itself as a Mac; touch points tell them apart.
function isMac(): boolean {
  const platform = navigator.platform || navigator.userAgent;
  return /Mac/i.test(platform) && navigator.maxTouchPoints <= 1;
}

/**
 * The download page's primary action. Visitors arriving from a "Download"
 * CTA (flagged in the URL) get the DMG started for them; direct visitors get
 * a button; anyone not on a Mac is told so instead of being handed a file
 * they can't open. Without JavaScript it is simply the button.
 */
export default function DownloadStarter({ labels }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!isMac()) {
      setStatus("notMac");
      return;
    }
    const url = new URL(window.location.href);
    if (!url.searchParams.has(DOWNLOAD_AUTOSTART_PARAM)) return;

    setStatus("starting");
    const timer = window.setTimeout(() => {
      // Drop the flag first so a refresh or a shared link doesn't re-download.
      url.searchParams.delete(DOWNLOAD_AUTOSTART_PARAM);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      window.location.assign(DOWNLOAD_URL);
    }, DOWNLOAD_AUTOSTART_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const button = (
    <Button
      size="lg"
      asChild
      className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
    >
      <DownloadLink href={DOWNLOAD_URL} location="download_page">
        <Download className="w-6 h-6 mr-3" />
        {labels.cta}
      </DownloadLink>
    </Button>
  );

  return (
    <div
      className="flex flex-col items-center gap-5 min-h-[7rem] justify-center"
      aria-live="polite"
    >
      {status === "starting" && (
        <>
          <p className="flex items-center gap-3 text-xl font-semibold">
            <Loader2
              className="w-6 h-6 text-primary animate-spin"
              aria-hidden="true"
            />
            {labels.starting}
          </p>
          <p className="text-muted-foreground">
            {labels.retryQuestion}{" "}
            <DownloadLink
              href={DOWNLOAD_URL}
              location="download_page_retry"
              className="font-bold text-primary underline decoration-2 decoration-primary/40 underline-offset-4 hover:decoration-primary transition"
            >
              {labels.retryLink}
            </DownloadLink>
          </p>
        </>
      )}

      {status === "notMac" && (
        <p className="flex items-center gap-3 max-w-xl rounded-2xl border-2 border-accent/30 bg-card/60 px-6 py-4 text-lg font-medium text-left">
          <Laptop className="w-6 h-6 shrink-0 text-accent" aria-hidden="true" />
          {labels.notMac}
        </p>
      )}

      {status !== "starting" && button}
    </div>
  );
}
