import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://erasmusbudget.com'),
  title: {
    default: "Erasmus Budget Calculator | Plan Your Study Abroad Expenses",
    template: "%s | Erasmus Budget Calculator"
  },
  description: "Free tool to plan and calculate your Erasmus+ study abroad budget. Compare living costs, estimate expenses, and calculate Erasmus grants for European cities.",
  keywords: ["erasmus calculator", "erasmus budget", "study abroad costs", "erasmus grant calculator", "student exchange budget", "european cities cost of living", "erasmus planning tool"],
  authors: [{ name: "José Luis Saorín Ferrer", url: "https://github.com/joseluissaorin" }],
  creator: "José Luis Saorín Ferrer",
  publisher: "José Luis Saorín Ferrer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "Erasmus Budget Calculator | Plan Your Study Abroad Expenses",
    description: "Free tool to plan and calculate your Erasmus+ study abroad budget. Compare living costs, estimate expenses, and calculate Erasmus grants for European cities.",
    url: 'https://erasmusbudget.com',
    siteName: 'Erasmus Budget Calculator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Erasmus Budget Calculator Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Erasmus Budget Calculator | Plan Your Study Abroad Expenses",
    description: "Free tool to plan and calculate your Erasmus+ study abroad budget. Compare living costs, estimate expenses, and calculate Erasmus grants for European cities.",
    images: ['/og-image.png'],
    creator: '@joseluissaorin',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: 'your-google-site-verification',
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Erasmus Budget Calculator",
              "description": "Free tool to plan and calculate your Erasmus+ study abroad budget. Compare living costs, estimate expenses, and calculate Erasmus grants for European cities.",
              "url": "https://erasmusbudget.com",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "author": {
                "@type": "Person",
                "name": "José Luis Saorín Ferrer",
                "url": "https://github.com/joseluissaorin"
              }
            })
          }}
        />
        <Script
          defer
          data-domain="erasmusbudget.com"
          src="https://analytics.joseluissaorin.com/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}