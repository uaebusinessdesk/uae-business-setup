import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from './HomePageClient';
import OrganizationSchema from '@/components/SEO/OrganizationSchema';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'UAE Business Desk - Company Setup Services',
  description: 'Expert UAE company setup and bank account services. Documentation preparation and application facilitation for mainland, freezone, and offshore formation.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/',
    title: 'UAE Business Desk - Expert Company Setup & Bank Account Services',
    description: 'Expert UAE company setup and bank account services. Documentation preparation and application facilitation for mainland, freezone, and offshore formation.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/hero1.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UAE Business Desk - Expert Company Setup & Bank Account Services',
    description: 'Expert UAE company setup and bank account services. Documentation preparation and application facilitation for mainland, freezone, and offshore formation.',
    images: ['https://uaebusinessdesk.com/assets/hero1.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebPageSchema
        name="UAE Business Desk - Company Setup Services"
        description="Expert UAE company setup and bank account services. We handle documentation preparation and application facilitation for mainland, freezone, and offshore company formation."
        url="https://www.uaebusinessdesk.com"
      />
      <HomePageClient />
      <Script src="/assets/site.js" strategy="afterInteractive" />
    </>
  );
}
