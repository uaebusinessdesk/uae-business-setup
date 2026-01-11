import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy - UAE Business Desk',
  description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
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
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>Introduction</h2>
          <p>
            UAE Business Desk (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
        </div>

        <div className="legal-section">
          <h2>Information We Collect</h2>
          <p>We may collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information (email, phone number, WhatsApp number)</li>
            <li>Business information (activity, nationality, country of residence)</li>
            <li>Service requirements and preferences</li>
            <li>Any other information you choose to provide</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and respond to your inquiries</li>
            <li>Communicate with you about our services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at support@uaebusinessdesk.com</p>
        </div>
      </section>
    </PublicLayout>
  );
}
