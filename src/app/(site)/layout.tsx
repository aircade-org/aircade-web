import { type ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';

import { type NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Lato, Spline_Sans_Mono } from 'next/font/google';

import { SiteHeader } from '@/components/site-header';

import '../globals.css';
import { Providers } from '../providers';

const lato: NextFontWithVariable = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const splineSansMono: NextFontWithVariable = Spline_Sans_Mono({
  variable: '--font-spline-sans-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AirCade',
  description: 'Browser-Based Party Game Platform',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AirCade',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${lato.variable} ${splineSansMono.variable} h-screen overflow-hidden antialiased`}
      >
        <Providers>
          <div className="flex h-full flex-col">
            <SiteHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
