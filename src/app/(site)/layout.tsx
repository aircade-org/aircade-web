import { ReactNode } from 'react';

import type { Metadata } from 'next';

import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Lato, Spline_Sans_Mono } from 'next/font/google';

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
        className={`${lato.variable} ${splineSansMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
