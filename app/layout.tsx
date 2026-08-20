import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { LegacyBetaStorageCleanup } from '@/components/legacy-beta-storage-cleanup'
import { SITE_URL } from '@/lib/site-config'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'IndoBiz Japan | インドビズジャパン',
  description:
    'IndoBiz Japan（インドビズジャパン）は、日本企業向けにインド市場の短報、業界別ウォッチ、進出・採用の示唆を届ける情報プラットフォームです。',
  applicationName: 'IndoBiz Japan',
  keywords: [
    'IndoBiz Japan',
    'Indo Biz Japan',
    'インドビズジャパン',
    'インドビジネス',
    'インド市場',
    'インド進出',
  ],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: 'IndoBiz Japan',
    title: 'IndoBiz Japan | インドビズジャパン',
    description:
      '日本企業の意思決定に役立つ、インド市場・経済・規制・進出情報を日本語で届けます。',
    images: [{ url: '/goindia.png', width: 1024, height: 1024, alt: 'IndoBiz Japan' }],
  },
  twitter: {
    card: 'summary',
    title: 'IndoBiz Japan | インドビズジャパン',
    description:
      '日本企業の意思決定に役立つ、インド市場・経済・規制・進出情報を日本語で届けます。',
    images: ['/goindia.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/goindia.png', type: 'image/png', sizes: '1024x1024' }],
    shortcut: '/goindia.png',
    apple: [{ url: '/goindia.png', type: 'image/png', sizes: '1024x1024' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#1e2a4a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${notoSansJP.variable} font-sans antialiased`}
      >
        {children}
        <LegacyBetaStorageCleanup />
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
