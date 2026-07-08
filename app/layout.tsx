import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Analytics from "@/components/analytics";
import { geistSans, geistMono } from "@/lib/fonts";
import { SITE_URL, SITE_KEYWORDS } from "@/lib/site-config";
const DEFAULT_DESCRIPTION =
  "Scribbble is a beautiful Mac app to scribble, draw, highlight and annotate directly on your screen. Perfect for teachers, streamers, YouTubers, designers and sales demos. Free download, one-time license.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Scribbble — Screen Annotation App for Mac · Draw on Screen",
    template: "%s | Scribbble",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Scribbble",
  keywords: SITE_KEYWORDS,
  authors: [{ name: "Kushagra Gour", url: "https://kushagra.dev" }],
  creator: "Kushagra Gour",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Scribbble",
    url: SITE_URL,
    title: "Scribbble — Screen Annotation App for Mac",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/social-2.png",
        width: 1200,
        height: 630,
        alt: "Scribbble — Screen annotation app for Mac",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scribbble — Screen Annotation App for Mac",
    description: DEFAULT_DESCRIPTION,
    images: ["/social-2.png"],
    creator: "@cssMonk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
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
