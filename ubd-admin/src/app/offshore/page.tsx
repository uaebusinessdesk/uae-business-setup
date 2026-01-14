import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Offshore Company Formation in the UAE - UAE Business Desk',
  description: 'Professional UAE offshore company formation services. We prepare incorporation paperwork and handle documentation; offshore authorities make approval decisions.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/offshore',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/offshore',
    title: 'Offshore Company Formation in the UAE - UAE Business Desk',
    description: 'Professional UAE offshore company formation services. We prepare incorporation paperwork and handle documentation; offshore authorities make approval decisions.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/offshore-hero-bg.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Offshore Company Formation in the UAE - UAE Business Desk',
    description: 'Professional UAE offshore company formation services. We prepare incorporation paperwork and handle documentation; offshore authorities make approval decisions.',
    images: ['https://uaebusinessdesk.com/assets/offshore-hero-bg.jpg'],
  },
};

export default function OffshorePage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Offshore Company Formation in the UAE - UAE Business Desk"
        description="Professional UAE offshore company formation services. We prepare incorporation paperwork and handle documentation; offshore authorities make approval decisions."
        url="https://www.uaebusinessdesk.com/offshore"
      />
      <section className="hero" style={{ backgroundImage: "linear-gradient(rgba(11, 42, 74, 0.3), rgba(11, 42, 74, 0.4)), url('/assets/offshore-hero-bg.jpg')" }}>
        <div className="hero-inner container">
          <div className="hero-copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Home</Link>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Offshore Company Formation</span>
                </li>
              </ol>
            </nav>
            <h1>Offshore Company Formation in the UAE</h1>
            <p className="subheadline">Suitable for asset holding, international structuring, and businesses without local operations.</p>
            <a href="#consultation-form" className="btn btn-primary">Request a Free Consultation</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="content-wrapper">
          <h2>Offshore Company Formation</h2>
          <p>UAE Offshore companies offer privacy, asset protection, and international structuring benefits. We provide documentation preparation and application facilitation for offshore company formation.</p>
          <p>We conduct initial review first and proceed only with your approval. Approval decisions are made by offshore authorities.</p>
        </div>
      </section>

      <section id="consultation-form" className="section consultation-section" style={{ padding: 'var(--space-4xl) 0' }}>
        <div className="content-wrapper">
          <div className="ubd-form">
            <div className="form-card">
              <div className="form-header">
                <h3>Request a Free Consultation</h3>
                <p className="form-reassurance">Share your details. We&apos;ll conduct initial review and get back to you.</p>
              </div>
              <p style={{ textAlign: 'center', padding: '20px' }}>
                <Link href="/#consultation-form" className="btn btn-primary">Go to Consultation Form</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
