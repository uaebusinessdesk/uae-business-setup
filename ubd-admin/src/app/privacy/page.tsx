import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Privacy Policy - UAE Business Desk',
  description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information when you use our company setup and bank account services.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/privacy',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/privacy',
    title: 'Privacy Policy - UAE Business Desk',
    description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/header-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - UAE Business Desk',
    description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information.',
    images: ['https://uaebusinessdesk.com/assets/header-logo.png'],
  },
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Privacy Policy - UAE Business Desk"
        description="Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information."
        url="https://www.uaebusinessdesk.com/privacy"
      />
      <section className="legal-page-hero">
        <div className="content-wrapper">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
              <li className="breadcrumbs-item">
                <Link href="/" className="breadcrumbs-link">Home</Link>
              </li>
              <li className="breadcrumbs-item">
                <span className="breadcrumbs-current">Privacy Policy</span>
              </li>
            </ol>
          </nav>
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your personal information.</p>
        </div>
      </section>

      <div className="legal-content">
        <div className="legal-section">
          <h2>Information We Collect</h2>
          <p>We collect information that you provide directly to us through:</p>
          <ul>
            <li>Contact forms on our website</li>
            <li>Email communications</li>
            <li>Phone or WhatsApp conversations</li>
            <li>Service enquiry messages</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number or WhatsApp contact</li>
            <li>Enquiry details and business requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>How We Use Information</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Respond to your enquiries and provide information about our services</li>
            <li>Deliver documentation preparation and application facilitation services</li>
            <li>Follow up on service delivery and provide updates</li>
            <li>Communicate with you regarding your business setup requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Cookies and Analytics</h2>
          <p>We may use basic cookies for site functionality and to improve your browsing experience. We do not sell your data to third parties.</p>
        </div>

        <div className="legal-section">
          <h2>Sharing of Information</h2>
          <p>We may share your information only with service providers as needed to deliver our services (such as document processing or communication tools). We do not sell your personal information to third parties.</p>
        </div>

        <div className="legal-section">
          <h2>Data Retention</h2>
          <p>We retain your information as long as needed for business purposes and compliance requirements. You may request deletion of your data where applicable, and we will comply with reasonable requests subject to legal and business obligations.</p>
        </div>
        <div className="legal-section">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information (subject to legal and business requirements)</li>
          </ul>
        </div>
        <div className="legal-cta">
          <p><strong>Questions About Privacy?</strong></p>
          <p>For privacy-related enquiries or to exercise your rights, please contact us.</p>
          <p><Link href="/contact" className="btn">Contact Us</Link></p>
        </div>
      </div>
    </PublicLayout>
  );
}
