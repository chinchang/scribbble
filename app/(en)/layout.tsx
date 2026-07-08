import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import Analytics from "@/components/analytics";
import { geistSans, geistMono } from "@/lib/fonts";
import { buildBaseMetadata } from "@/lib/site-config";

export const metadata: Metadata = buildBaseMetadata();

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
