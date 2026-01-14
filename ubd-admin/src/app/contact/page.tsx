import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import ContactPageSchema from '@/components/SEO/ContactPageSchema';

export const metadata: Metadata = {
  title: 'Contact Us - UAE Business Desk',
  description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/contact',
    title: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/contact-hero.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
    images: ['https://uaebusinessdesk.com/assets/contact-hero.jpg'],
  },
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <ContactPageSchema />
      <section className="hero" style={{ backgroundImage: "linear-gradient(rgba(11, 42, 74, 0.3), rgba(11, 42, 74, 0.4)), url('/assets/contact-hero.jpg')" }}>
        <div className="hero-inner container">
          <div className="hero-copy" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Home</Link>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Contact</span>
                </li>
              </ol>
            </nav>
            <h1>Get in Touch</h1>
            <p className="subheadline" style={{ textAlign: 'left' }}>Contact us to discuss your requirements and receive structured guidance on UAE company formation and bank account setup.</p>
            <a href="#consultation-form" className="btn btn-primary" style={{ marginTop: 'var(--space-xl)' }}>Send Your Enquiry</a>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 'var(--space-xl)' }}>
        <div className="content-wrapper">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>Contact Us</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Email</h3>
              <p>support@uaebusinessdesk.com</p>
            </div>
            <div className="contact-method">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Location</h3>
              <p>Business Center, Sharjah Publishing City, Sharjah, United Arab Emirates</p>
            </div>
            <div className="contact-method">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Office Hours</h3>
              <p>Sunday to Thursday, 9:00 AM – 6:00 PM (UAE Time)</p>
            </div>
          </div>
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
