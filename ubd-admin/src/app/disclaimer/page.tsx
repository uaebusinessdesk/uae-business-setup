import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export const metadata: Metadata = {
  title: 'Disclaimer - UAE Business Desk',
  description: 'Disclaimer for UAE Business Desk services. Important information about our service scope and limitations.',
};

export default function DisclaimerPage() {
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
                <span className="breadcrumbs-current">Disclaimer</span>
              </li>
            </ol>
          </nav>
          <h1>Disclaimer</h1>
          <p>Important information about our services</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>Service Scope</h2>
          <p>
            UAE Business Desk provides documentation preparation and application facilitation services for UAE company incorporation and bank account setup. We do not make approval decisions; these are made by UAE authorities and banks.
          </p>
        </div>

        <div className="legal-section">
          <h2>No Guarantees</h2>
          <p>
            We do not guarantee approvals, specific timelines, or outcomes. Approval decisions, processing times, and requirements are determined by third-party authorities and banks, which are beyond our control.
          </p>
        </div>

        <div className="legal-section">
          <h2>Initial Review</h2>
          <p>
            We conduct initial review first and proceed only with your approval. This review is based on available information and our experience, but does not guarantee final approval by authorities or banks.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact Us</h2>
          <p>If you have questions about this Disclaimer, please contact us at support@uaebusinessdesk.com</p>
        </div>
      </section>
    </PublicLayout>
  );
}
