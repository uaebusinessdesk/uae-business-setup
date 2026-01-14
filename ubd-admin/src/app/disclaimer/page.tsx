import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Disclaimer - UAE Business Desk',
  description: 'Disclaimer and terms of service for UAE Business Desk. We provide documentation preparation and application facilitation services only.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/disclaimer',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/disclaimer',
    title: 'Disclaimer - UAE Business Desk',
    description: 'Disclaimer and terms of service for UAE Business Desk. We provide documentation preparation and application facilitation services only.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/header-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer - UAE Business Desk',
    description: 'Disclaimer and terms of service for UAE Business Desk. We provide documentation preparation and application facilitation services only.',
    images: ['https://uaebusinessdesk.com/assets/header-logo.png'],
  },
};

export default function DisclaimerPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Disclaimer - UAE Business Desk"
        description="Disclaimer for UAE Business Desk services. Important information about our service scope and limitations."
        url="https://www.uaebusinessdesk.com/disclaimer"
      />
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
          <p>Important information about our services, limitations, and your responsibilities.</p>
        </div>
      </section>

      <div className="legal-content">
        <div className="legal-section">
          <h2>Service Scope</h2>
          <p>
            UAE Business Desk (UBD) provides documentation preparation and application facilitation services for UAE company incorporation and bank account setup.
          </p>
          <p>We prepare required documents, complete application forms, coordinate submissions, and facilitate communication with relevant authorities and banks. We do not provide legal, financial, or tax advice.</p>
        </div>

        <div className="legal-section">
          <h2>No Guarantees</h2>
          <p>
            <strong>Outcomes:</strong> We do not guarantee company registration approvals, bank account approvals, or any specific outcomes. Approval decisions are made solely by relevant authorities and banks.
          </p>
          <p><strong>Timelines:</strong> We do not guarantee specific processing timelines. All timelines provided are indicative estimates only, not commitments. Actual timelines depend on authority and bank processing schedules.</p>
          <p><strong>Service Completion:</strong> Our services are considered complete upon delivery of prepared documentation and submission facilitation, regardless of approval outcomes.</p>
        </div>

        <div className="legal-section">
          <h2>Third-Party Decisions</h2>
          <p>
            Outcomes depend on relevant authorities and institutions:
          </p>
          <ul>
            <li><strong>Authority Decisions:</strong> Company registration approvals are made by UAE authorities (local economic departments, free zone authorities, offshore registrars) based on their policies, procedures, and client eligibility assessments.</li>
            <li><strong>Bank Decisions:</strong> Bank account approval decisions are made solely by banks based on their internal policies, compliance requirements, and client eligibility assessments. We have no influence over bank decisions.</li>
            <li><strong>No Influence:</strong> We have no control over, and cannot influence, the decisions, policies, or processing schedules of authorities or banks. These factors are outside our control.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>No Legal or Financial Advice</h2>
          <p>We provide documentation and facilitation services only:</p>
          <ul>
            <li><strong>Not Legal Advisors:</strong> We do not provide legal advice, legal opinions, or legal representation. For legal matters, consult qualified legal professionals.</li>
            <li><strong>Not Financial Advisors:</strong> We do not provide financial advice, investment advice, or tax advice. For financial and tax matters, consult qualified financial and tax professionals.</li>
            <li><strong>Documentation Only:</strong> Our services are limited to preparing documentation and facilitating applications in accordance with your instructions and applicable requirements.</li>
          </ul>
        </div>
        <div className="legal-section">
          <h2>Limitation of Use</h2>
          <p>Website information is general in nature:</p>
          <ul>
            <li><strong>General Information:</strong> Information on this website is provided for general informational purposes only. It is not tailored to your specific circumstances or requirements.</li>
            <li><strong>Case-Specific Guidance:</strong> For case-specific guidance, pricing, and service details, please contact us directly. We provide tailored information during consultation.</li>
            <li><strong>Accuracy:</strong> While we strive to keep information accurate and current, regulations and requirements may change. We are not responsible for reliance on general website information.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>About UBD</h2>
          <p>UBD operates as a specialised business setup and account facilitation service under Capo Fin FZE, a UAE-registered company based in Sharjah Publishing City.</p>
          <p>Through UBD, Capo Fin FZE provides documentation preparation and application facilitation support for UAE company formation and business account setup, including local and international account requirements. Each request is reviewed on a feasibility-first basis to ensure clarity before proceeding.</p>
          <p>UBD does not act as a licensing authority, bank, or regulator. All approvals and decisions are made independently by UAE authorities, free zone registrars, banks, or account providers based on their respective policies and eligibility criteria.</p>
        </div>

        <div className="legal-cta">
          <p><strong>Questions About Our Services?</strong></p>
          <p>Contact us for case-specific guidance, pricing, and detailed service information.</p>
          <p><Link href="/contact" className="btn">Contact Us</Link></p>
        </div>
      </div>
    </PublicLayout>
  );
}
