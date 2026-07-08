import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import Analytics from "@/components/analytics";
import { geistSans, geistMono } from "@/lib/fonts";
import { buildBaseMetadata } from "@/lib/site-config";
import { routing } from "@/i18n/routing";
import { localeUrl, languageAlternates } from "@/lib/i18n/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = buildBaseMetadata({
    title: t("titleDefault"),
    titleTemplate: t("titleTemplate"),
    ogTitle: t("ogTitle"),
    description: t("description"),
    ogImageAlt: t("ogImageAlt"),
  });
  return {
    ...base,
    alternates: {
      canonical: localeUrl(locale, "/"),
      languages: languageAlternates("/"),
    },
    openGraph: { ...base.openGraph, locale },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
