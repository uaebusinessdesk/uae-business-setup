import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions - UAE Business Desk',
  description: 'Terms and conditions for UAE Business Desk services. Read our terms of service and usage policies.',
};

export default function TermsPage() {
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
                <span className="breadcrumbs-current">Terms & Conditions</span>
              </li>
            </ol>
          </nav>
          <h1>Terms & Conditions</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using UAE Business Desk services, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you may not access our services.
          </p>
        </div>

        <div className="legal-section">
          <h2>Services</h2>
          <p>
            UAE Business Desk provides documentation preparation and application facilitation services for UAE company incorporation and bank account setup. Approval decisions are made by authorities and banks, not by UAE Business Desk.
          </p>
        </div>

        <div className="legal-section">
          <h2>No Guarantees</h2>
          <p>
            We do not guarantee approvals, timelines, or outcomes. All approval decisions are made by third-party authorities and banks. We provide documentation and facilitation services only.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact Us</h2>
          <p>If you have questions about these Terms & Conditions, please contact us at support@uaebusinessdesk.com</p>
        </div>
      </section>
    </PublicLayout>
  );
}
