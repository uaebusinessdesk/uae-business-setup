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

      <section className="mainland-content">
        <div className="content-wrapper">
          <div className="mainland-section">
            <div className="mainland-intro-grid">
              <div className="mainland-intro-text">
                <h2>Business Setup Services in UAE Offshore</h2>
                <p>Offshore companies in the UAE are commonly used for asset holding, ownership structures, and international business arrangements without conducting commercial activities inside the UAE.</p>
                <p>We provide documentation preparation and application facilitation for offshore company formation, aligned with the requirements of offshore registrars and relevant authorities.</p>
                <p>Initial review is conducted first, and we proceed only after your approval.</p>
              </div>
              <div className="mainland-intro-image">
                <Image src="/assets/offshore-intro.jpg" alt="Offshore Company Formation" width={500} height={400} />
              </div>
            </div>

            {/* Why Offshore Section */}
            <div className="why-mainland-wrapper">
              <div className="why-mainland-header">
                <h2 style={{ textAlign: 'center' }}>Why Offshore?</h2>
                <p style={{ textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>Offshore structures are typically used for ownership, protection, and international business purposes rather than active trading within the UAE.</p>
              </div>
              <div className="benefits-grid">
                <div className="benefits-image">
                  <Image src="/assets/offshore-benefits.jpg" alt="Offshore Company Benefits" width={500} height={400} />
                </div>
                <div className="benefits-content">
                  <div className="benefit-card">
                    <h4>Asset Holding & Protection</h4>
                    <p>Commonly used to hold shares, intellectual property, real estate interests, and international assets.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>International Structuring</h4>
                    <p>Suitable for global ownership structures, cross-border investments, and holding arrangements.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>No Local Operating Requirement</h4>
                    <p>Offshore companies are not permitted to conduct business within the UAE market and do not require physical office presence.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>Privacy & Simplicity</h4>
                    <p>Simplified corporate structure with limited public disclosure, subject to applicable regulations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="legal-structure-section">
        <div className="content-wrapper">
          <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Legal Structure</h2>
          <div className="legal-structure-grid">
            <div className="legal-structure-content">
              <div className="legal-card">
                <h4>Offshore Company</h4>
                <p>A single legal structure used for holding, ownership, and international business activities. Offshore companies cannot conduct commercial operations within the UAE.</p>
              </div>
              <div className="legal-card">
                <h4>International Business Company (IBC)</h4>
                <p>Designed for international business activities, asset holding, and cross-border investments. Suitable for businesses operating outside the UAE.</p>
              </div>
              <div className="legal-card">
                <h4>Offshore Limited Liability Company</h4>
                <p>Provides limited liability protection for shareholders while maintaining flexibility for international structuring and asset management purposes.</p>
              </div>
            </div>
            <div className="legal-structure-image">
              <Image src="/assets/offshore-legal.jpg" alt="Legal Structure" width={500} height={400} />
            </div>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="content-wrapper">
          <h2 style={{ textAlign: 'center' }}>Offshore Company Formation Process</h2>
          <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>A simple, transparent process from start to finish:</p>
          <div className="process-grid">
            <div className="process-step">
              <div className="process-number">1</div>
              <h4>Share your requirements</h4>
              <p>Tell us about your business needs and objectives.</p>
            </div>
            <div className="process-step">
              <div className="process-number">2</div>
              <h4>We conduct initial review</h4>
              <p>We assess your case and confirm what&apos;s possible.</p>
            </div>
            <div className="process-step">
              <div className="process-number">3</div>
              <h4>You approve before proceeding</h4>
              <p>You review and approve before we move forward.</p>
            </div>
            <div className="process-step">
              <div className="process-number">4</div>
              <h4>Documentation preparation and application facilitation</h4>
              <p>We prepare documentation and facilitate application submission to offshore registrars and relevant authorities.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mainland-content">
        <div className="content-wrapper">
          <div className="mainland-section why-choose-section">
            <h2 style={{ textAlign: 'center' }}>Why Choose UBD for Offshore Formation?</h2>
            <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>Offshore-specific expertise and efficient processes:</p>
            <div className="why-choose-grid">
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Tailored Approach</h4>
                <p>Documentation aligned to your structuring objectives and selected offshore jurisdiction.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Regulatory Expertise</h4>
                <p>Familiarity with offshore registrar requirements and compliance frameworks.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Transparent Communication</h4>
                <p>Clear explanation of steps and requirements before proceeding.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Comprehensive Documentation</h4>
                <p>Coordinated preparation and submission support for offshore structures.</p>
              </div>
            </div>
          </div>

          {/* Related Services Section */}
          <div className="mainland-section related-services-section">
            <h2>Related Services</h2>
            <div className="related-services-grid">
              <Link href="/mainland" className="related-service-card">
                <h3>Mainland Company Formation</h3>
                <p>For businesses that require unrestricted access to the UAE market.</p>
                <span className="related-service-link">Learn More →</span>
              </Link>
              <Link href="/freezone" className="related-service-card">
                <h3>Free Zone Company Formation</h3>
                <p>Suitable for international businesses and startups within designated free zones.</p>
                <span className="related-service-link">Learn More →</span>
              </Link>
            </div>
          </div>

          <div className="mainland-section disclaimer-section">
            <div className="disclaimer-note">
              <p><strong>Important:</strong> UBD provides documentation preparation and application facilitation services only. We do not guarantee company registration approvals. Approval decisions are made by offshore registrars and relevant authorities based on their policies and client eligibility. All timelines are indicative estimates only, not commitments.</p>
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
