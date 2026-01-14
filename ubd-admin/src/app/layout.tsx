import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
