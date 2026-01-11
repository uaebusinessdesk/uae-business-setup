import Script from 'next/script';
import HomePageClient from './HomePageClient';

export default function HomePage() {
  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <HomePageClient />
      <Script src="/assets/site.js" strategy="afterInteractive" />
    </>
  );
}
