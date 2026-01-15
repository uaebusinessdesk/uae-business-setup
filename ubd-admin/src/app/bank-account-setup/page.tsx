import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';
import BankAccountPrescreenForm from '@/components/BankAccountPrescreenForm';
import BankAccountFaq from '@/components/BankAccountFaq';
import ClientImage from '@/components/ClientImage';

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
      <div className="page-bank-account">
        <section className="mainland-hero">
          <div className="content-wrapper">
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
            <h1>Bank Account Setup Support</h1>
            <p>UAE local business accounts and international business accounts — with documentation preparation and application facilitation.</p>
            <p style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '20px' }}>We review feasibility first. You proceed only if it makes sense.</p>
            <a href="#consultation-form" className="btn">Request a Free Consultation</a>
          </div>
        </section>

        <section className="mainland-content">
          <div className="content-wrapper">
            <div className="mainland-section">
              <div style={{ backgroundColor: '#ffffff', padding: 'var(--space-4xl) 0 0 0' }}>
                <div className="mainland-intro-grid">
                  <div className="mainland-intro-text">
                    <h2>What This Service Covers</h2>
                    <p>Opening a business account requires structured documentation and meeting eligibility checks set by banks or account providers.</p>
                    <p>We support you by preparing bank-ready documentation and facilitating submissions so your application is complete and consistent. Approval decisions are made independently by banks or account providers.</p>
                  </div>
                  <div className="mainland-intro-image">
                    <ClientImage
                      src="/assets/bank-account-intro.jpg"
                      alt="UAE Bank Account Setup Support"
                    />
                  </div>
                </div>
              </div>

              <div className="why-mainland-wrapper">
                <div className="why-mainland-header">
                  <h2 style={{ textAlign: 'center' }}>Two Options We Support</h2>
                </div>
                <div className="benefits-grid">
                  <div className="benefits-image">
                    <ClientImage
                      src="/assets/bank-account-benefits.jpg"
                      alt="Bank Account Setup Options"
                    />
                  </div>
                  <div className="benefits-content">
                    <div className="benefit-card">
                      <h4>UAE Business Bank Accounts (Local)</h4>
                      <p>For companies that need a UAE-based business account with local banking access.</p>
                      <p style={{ marginTop: '8px', fontSize: '0.9375rem', color: '#64748b' }}><strong>Note:</strong> UAE local business bank accounts typically require completed company formation documents, as banks need final company documentation for account opening.</p>
                    </div>
                    <div className="benefit-card">
                      <h4>International Business Accounts (Multi-currency / Virtual)</h4>
                      <p>For businesses that need international collection accounts and multi-currency account capabilities for cross-border operations.</p>
                      <p style={{ marginTop: '8px', fontSize: '0.9375rem', color: '#64748b' }}>Support for international business accounts designed for cross-border collections and payments in multiple currencies.</p>
                      <p style={{ marginTop: '8px', fontSize: '0.9375rem', color: '#64748b' }}>We support documentation and onboarding requirements based on eligibility review and the provider&apos;s criteria.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="why-mainland-wrapper">
          <div className="content-wrapper">
            <div className="why-mainland-header">
              <h2 style={{ textAlign: 'center' }}>Who This Service Is For</h2>
              <p style={{ textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>This service is suitable for businesses that want documentation done properly before submitting:</p>
            </div>

            <div className="benefits-grid" style={{ marginTop: '40px' }}>
              <div className="benefits-content">
                <div className="benefit-card">
                  <h4>Businesses Needing Bank Accounts</h4>
                  <p>Companies that need a UAE local bank account or international business account for their operations.</p>
                </div>
                <div className="benefit-card">
                  <h4>Existing Businesses</h4>
                  <p>Companies opening additional accounts or switching providers.</p>
                </div>
                <div className="benefit-card">
                  <h4>International Businesses</h4>
                  <p>Businesses that need international account capabilities for cross-border collections and payments.</p>
                </div>
                <div className="benefit-card">
                  <h4>Time-Conscious Clients</h4>
                  <p>Clients who want documentation compiled correctly to avoid delays and back-and-forth.</p>
                </div>
              </div>
              <div className="benefits-image">
                <ClientImage
                  src="/assets/bank-account-service.jpg"
                  alt="Bank Account Setup Benefits"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="legal-structure-section">
          <div className="content-wrapper">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>How We Support Account Setup</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', maxWidth: '100%' }}>Our support focuses on documentation readiness and coordination — not account decisions.</p>
            <div className="legal-structure-grid">
              <div className="legal-structure-content">
                <div className="legal-card">
                  <h4>Preparing bank-ready documentation packages</h4>
                </div>
                <div className="legal-card">
                  <h4>Organising shareholder and company information</h4>
                </div>
                <div className="legal-card">
                  <h4>Completing application forms accurately</h4>
                </div>
                <div className="legal-card">
                  <h4>Facilitating submission and follow-up communication</h4>
                </div>
              </div>
              <div className="legal-structure-image">
                <ClientImage
                  src="/assets/bank-account-included.jpg"
                  alt="Bank Account Setup Inclusions"
                />
              </div>
            </div>
            <p style={{ marginTop: '30px', fontStyle: 'italic', whiteSpace: 'nowrap' }}>All approvals, compliance checks, and account decisions are made solely by banks or account providers.</p>
          </div>
        </div>

        <section className="anywhere-section" style={{ marginBottom: 'var(--space-4xl)' }}>
          <div className="content-wrapper">
            <div className="authorities-wrapper">
              <div className="anywhere-content">
                <h2>Financial Institutions We Work With</h2>
                <div className="authority-logos-scroll">
                  <div className="authority-logos-track">
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/ADCB.png" alt="ADCB" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Al%20Hilal.png" alt="Al Hilal Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Barclays.png" alt="Barclays" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/BOC.png" alt="BOC" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/CIti.png" alt="Citibank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/DBS.png" alt="DBS" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/DIB.png" alt="DIB" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Deutsche.png" alt="Deutsche Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/EIB.png" alt="Emirates Islamic Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/EmiratesNBD.png?v=2" alt="Emirates NBD" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/FAB.png" alt="First Abu Dhabi Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/HSBC%20Bank.png?v=2" alt="HSBC Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/JPM.png" alt="JPMorgan" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Mashreq.png" alt="Mashreq" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/RAK.png" alt="RAK Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/WIO.png" alt="WIO" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/ADCB.png" alt="ADCB" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Al%20Hilal.png" alt="Al Hilal Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Barclays.png" alt="Barclays" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/BOC.png" alt="BOC" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/CIti.png" alt="Citibank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/DBS.png" alt="DBS" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/DIB.png" alt="DIB" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Deutsche.png" alt="Deutsche Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/EIB.png" alt="Emirates Islamic Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/EmiratesNBD.png?v=2" alt="Emirates NBD" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/FAB.png" alt="First Abu Dhabi Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/HSBC%20Bank.png?v=2" alt="HSBC Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/JPM.png" alt="JPMorgan" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/Mashreq.png" alt="Mashreq" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/RAK.png" alt="RAK Bank" />
                    </div>
                    <div className="authority-logo-item">
                      <img src="/assets/Bank%20logos/WIO.png" alt="WIO" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BankAccountPrescreenForm />
        <BankAccountFaq />
      </div>
    </PublicLayout>
  );
}
