import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RecallLens - Scan it. If it\'s recalled, know in seconds.',
  description: 'Scan product barcodes to instantly check for recalls. Get official recall information from FDA, FSIS, and CPSC sources.',
  keywords: 'recall, product safety, barcode scanner, FDA, food safety, consumer protection',
  authors: [{ name: 'RecallLens Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#10B981',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    title: 'RecallLens - Product Recall Scanner',
    description: 'Scan product barcodes to instantly check for recalls',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecallLens - Product Recall Scanner',
    description: 'Scan product barcodes to instantly check for recalls',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RecallLens" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
