import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAE Business Desk - Company Setup Services",
  description: "We provide documentation preparation and application facilitation for UAE company incorporation and bank account setup. Approval decisions are made by authorities and banks. Bank account support is introduced only after company incorporation is completed.",
  robots: 'index, follow',
  verification: {
    google: 'Ima1zTCHXiR2FZ3wCXhzEru2bMgGzjST0jlEbAKBX8A',
  },
  icons: {
    icon: [
      { url: '/assets/favicon.ico' },
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'sitemap': 'https://uaebusinessdesk.com/sitemap.xml',
  },
  metadataBase: new URL('https://uaebusinessdesk.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/styles.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
