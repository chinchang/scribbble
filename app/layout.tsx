import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Scribbble - Mac app',
  description: 'The beautiful screen annotation app for creators, teachers and presenters.',
  authors: [{ name: 'Kushagra Gour', url: 'https://kushagra.dev' }],
  openGraph: {
    title: 'Scribbble - Mac app',
    description: 'The beautiful screen annotation app for creators, teachers and presenters.',
    images: [
      {
        url: 'https://scribbble.app/social.png',
        width: 1200,
        height: 630,
        alt: 'Scribbble - Screen annotation app',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scribbble - Mac app',
    description: 'The beautiful screen annotation app for creators, teachers and presenters.',
    images: ['https://scribbble.app/social.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
