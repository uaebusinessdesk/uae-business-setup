import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import "./globals.css";
import StylesheetLoader from "@/components/StylesheetLoader";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
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

// Add stylesheet link to head
export function Head() {
  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${workSans.variable} antialiased`}
      >
        <StylesheetLoader />
        {children}
      </body>
    </html>
  );
}
