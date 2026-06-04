import '@/presentation/styles/globals.css';
import { ReduxProvider } from '@/presentation/store/Provider';
import { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://enwari.enjirou.com'),
  title: 'Enwari - Online Split Bill & Receipt Scanner App',
  description: 'Split bills, dining receipts, and shared expenses easily with Enwari. Snap or scan receipts with AI for instant, automated splitting and share via WhatsApp.',
  keywords: [
    'split bill', 'split bill online', 'bill splitter', 'receipt scanner',
    'receipt scan', 'split bill calculator', 'whatsapp split bill', 'group bill splitting',
    'enwari', 'online expense splitter'
  ],
  authors: [{ name: 'Enwari Team' }],
  openGraph: {
    title: 'Enwari - Online Split Bill & Receipt Scanner App',
    description: 'Split dinner and shopping bills quickly and fairly. Scan receipts with AI for automatic share calculation.',
    url: 'https://enwari.enjirou.com',
    siteName: 'Enwari',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Enwari Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Enwari - Online Split Bill & Receipt Scanner App',
    description: 'Split dinner and shopping bills quickly using AI.',
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Analytics />

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
