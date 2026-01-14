import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Terms & Conditions - UAE Business Desk',
  description: 'Terms and conditions for UAE Business Desk website and services. Scope of services, client responsibilities, fees, and limitations.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/terms',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/terms',
    title: 'Terms & Conditions - UAE Business Desk',
    description: 'Terms and conditions for UAE Business Desk website and services. Scope of services, client responsibilities, fees, and limitations.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/header-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions - UAE Business Desk',
    description: 'Terms and conditions for UAE Business Desk website and services. Scope of services, client responsibilities, fees, and limitations.',
    images: ['https://uaebusinessdesk.com/assets/header-logo.png'],
  },
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Terms & Conditions - UAE Business Desk"
        description="Terms and conditions for UAE Business Desk services. Read our terms of service and usage policies."
        url="https://www.uaebusinessdesk.com/terms"
      />
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
          <p>Terms governing your use of our website and engagement with our services.</p>
        </div>
      </section>

      <div className="legal-content">
        <div className="legal-section">
          <h2>About These Terms</h2>
          <p>These terms and conditions govern your use of the UAE Business Desk (UBD) website and your engagement with our services. By using our website or engaging our services, you agree to these terms.</p>
          <p>These terms apply to both website use and service engagement. We may update these terms from time to time, and continued use of our website or services constitutes acceptance of any changes.</p>
        </div>

        <div className="legal-section">
          <h2>Scope of Services</h2>
          <p>UBD provides documentation preparation and application facilitation services for UAE company incorporation and bank account setup.</p>
          <p>Our services include:</p>
          <ul>
            <li>Preparing required documents and application forms</li>
            <li>Coordinating submissions to relevant authorities and banks</li>
            <li>Facilitating communication between you and relevant parties</li>
            <li>Providing status updates and coordination support</li>
          </ul>
          <p>We do not provide legal, financial, or tax advice. Our services are limited to documentation preparation and application facilitation.</p>
        </div>

        <div className="legal-section">
          <h2>Client Responsibilities</h2>
          <p>To ensure efficient service delivery, you are responsible for:</p>
          <ul>
            <li><strong>Accurate Information:</strong> Providing accurate, complete, and up-to-date information and documents</li>
            <li><strong>Timely Documents:</strong> Submitting required documents and information within agreed timeframes</li>
            <li><strong>Cooperation:</strong> Cooperating with our team and responding promptly to requests for information or clarification</li>
            <li><strong>Compliance:</strong> Ensuring all information and documents comply with applicable requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Fees & Payments</h2>
          <p>Service fees are as agreed upon engagement. Fees cover our documentation preparation and application facilitation services.</p>
          <p>Government fees, third-party fees, and bank charges are separate and paid directly to the relevant authorities or institutions. These costs are not included in our service fees unless explicitly stated.</p>
          <p>Payment terms and methods will be communicated upon service agreement.</p>
        </div>
        <div className="legal-section">
          <h2>Refunds & Cancellations</h2>
          <p>Service fees are non-refundable once work has commenced. If you cancel before work begins, we will discuss refund arrangements on a case-by-case basis.</p>
          <p>If cancellation occurs after work has started, fees for work completed up to the cancellation date remain due. We will provide a summary of work completed upon request.</p>
        </div>

        <div className="legal-section">
          <h2>No Guarantees</h2>
          <p>We do not guarantee company registration approvals, bank account approvals, or any specific outcomes. Approval decisions are made solely by relevant authorities and banks based on their policies and client eligibility assessments.</p>
        </div>

        <div className="legal-section">
          <h2>Limitation of Liability</h2>
          <p>Our liability is limited to the value of service fees paid. We are not liable for:</p>
          <ul>
            <li>Decisions made by authorities or banks</li>
            <li>Delays caused by third parties or circumstances beyond our control</li>
            <li>Indirect, consequential, or incidental damages</li>
            <li>Losses arising from inaccurate or incomplete information provided by you</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, and design, is the property of UAE Business Desk (UBD) and is protected by copyright and other intellectual property laws.</p>
          <p>You may not copy, reproduce, distribute, or use any website content without our prior written permission. Documents prepared for your specific use remain your property, subject to our right to retain copies for our records.</p>
        </div>

        <div className="legal-section">
          <h2>Governing Law & Jurisdiction</h2>
          <p>These terms are governed by the laws of the United Arab Emirates. Any disputes arising from these terms or our services shall be subject to the jurisdiction of UAE courts.</p>
        </div>

        <div className="legal-cta">
          <p><strong>Questions About These Terms?</strong></p>
          <p>If you have questions about these terms or need clarification, please contact us.</p>
          <p><Link href="/contact" className="btn">Contact Us</Link></p>
        </div>
      </div>
    </PublicLayout>
  );
}
