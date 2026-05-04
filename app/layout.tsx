import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const GA_MEASUREMENT_ID = "G-8D1EQCT847";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const SITE_URL = "https://www.scribbble.app";
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
  keywords: [
    "screen annotation",
    "draw on screen",
    "mac annotation app",
    "screen drawing tool",
    "screen annotation tool mac",
    "mac screen annotation",
    "annotation app for mac",
    "scribble app",
    "scribble app mac",
    "presentation annotation",
    "zoomit for mac",
    "epic pen for mac",
    "presentify alternative",
    "screen marker",
    "live screen draw",
  ],
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
        url: "/social.png",
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
    images: ["/social.png"],
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
