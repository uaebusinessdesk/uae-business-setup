import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Bank Account Setup Support - UAE Business Desk',
  description: 'UAE business bank account setup services. We prepare bank-ready documentation and handle application facilitation; banks make approval decisions.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/bank-account-setup',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/bank-account-setup',
    title: 'UAE Bank Account Setup - Business Banking Solutions',
    description: 'UAE business bank account setup services. We prepare bank-ready documentation and handle application facilitation; banks make approval decisions.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/bank-account-hero-bg.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UAE Bank Account Setup - Business Banking Solutions',
    description: 'UAE business bank account setup services. We prepare bank-ready documentation and handle application facilitation; banks make approval decisions.',
    images: ['https://uaebusinessdesk.com/assets/bank-account-hero-bg.jpg'],
  },
};

export default function BankAccountSetupPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Bank Account Setup Support - UAE Business Desk"
        description="UAE business bank account setup services. We prepare bank-ready documentation and handle application facilitation; banks make approval decisions."
        url="https://www.uaebusinessdesk.com/bank-account-setup"
      />
      <section className="hero" style={{ backgroundImage: "linear-gradient(rgba(11, 42, 74, 0.3), rgba(11, 42, 74, 0.4)), url('/assets/bank-hero-bg.jpg')" }}>
        <div className="hero-inner container">
          <div className="hero-copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Home</Link>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Bank Account Setup</span>
                </li>
              </ol>
            </nav>
            <h1>Bank Account Setup in the UAE</h1>
            <p className="subheadline">Bank account support is introduced only after company incorporation is completed.</p>
            <a href="#consultation-form" className="btn btn-primary">Request a Free Consultation</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="content-wrapper">
          <h2>Bank Account Setup Services</h2>
          <p>We provide documentation preparation and application facilitation for UAE bank account setup. Bank account support is introduced only after company incorporation is completed.</p>
          <p>We conduct initial review first and proceed only with your approval. Approval decisions are made by banks.</p>
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
