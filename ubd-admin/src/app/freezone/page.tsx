import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';
import CompanyConsultationForm from '@/components/CompanyConsultationForm';
import CompanyFaq from '@/components/CompanyFaq';
import ClientImage from '@/components/ClientImage';

export const metadata: Metadata = {
  title: 'Free Zone Company Formation in UAE - UAE Business Desk',
  description: 'Expert UAE free zone company formation services. We prepare incorporation paperwork and handle documentation; free zone authorities make approval decisions.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/freezone',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/freezone',
    title: 'Free Zone Company Formation UAE - Expert Incorporation Services',
    description: 'Expert UAE free zone company formation services. We prepare incorporation paperwork and handle documentation; free zone authorities make approval decisions.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/freezone-hero-bg.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Zone Company Formation UAE - Expert Incorporation Services',
    description: 'Expert UAE free zone company formation services. We prepare incorporation paperwork and handle documentation; free zone authorities make approval decisions.',
    images: ['https://uaebusinessdesk.com/assets/freezone-hero-bg.jpg'],
  },
};

export default function FreezonePage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Free Zone Company Formation in UAE - UAE Business Desk"
        description="Expert UAE free zone company formation services. We prepare incorporation paperwork and handle documentation; free zone authorities make approval decisions."
        url="https://www.uaebusinessdesk.com/freezone"
      />
      <div className="page-freezone">
        <section className="mainland-hero">
          <div className="content-wrapper">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Home</Link>
                </li>
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Company Formation</Link>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Free Zone Company Formation</span>
                </li>
              </ol>
            </nav>
            <h1>Free Zone Company Formation in the UAE</h1>
            <p>Suitable for international businesses and startups within designated free zones.</p>
            <p style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '20px' }}>We review feasibility first. You approve before we proceed.</p>
            <a href="#consultation-form" className="btn">Request a Free Consultation</a>
          </div>
        </section>

        <section className="mainland-content">
          <div className="content-wrapper">
            <div className="mainland-section">
              <div className="mainland-intro-grid">
                <div className="mainland-intro-text">
                  <h2>Business Setup Services in UAE Free Zones</h2>
                  <p>UAE Free Zones allow businesses to operate within designated jurisdictions with simplified setup procedures and sector-specific infrastructure.</p>
                  <p>We provide documentation preparation and application facilitation for Free Zone company formation, aligned with the requirements of individual free zone authorities.</p>
                  <p>We conduct initial review first and proceed only after your approval.</p>
                </div>
                <div className="mainland-intro-image">
                  <ClientImage
                    src="/assets/freezone-intro.jpg"
                    alt="UAE Free Zones"
                  />
                </div>
              </div>

              <div className="why-mainland-wrapper">
                <div className="why-mainland-header">
                  <h2 style={{ textAlign: 'center' }}>Why Free Zone?</h2>
                  <p style={{ textAlign: 'center' }}>Free Zones are commonly chosen for international operations, specialized industries, and faster setup timelines.</p>
                </div>

                <div className="benefits-grid">
                  <div className="benefits-image">
                    <ClientImage
                      src="/assets/freezone-benefits.jpg"
                      alt="UAE Free Zone Benefits"
                    />
                  </div>
                  <div className="benefits-content">
                    <div className="benefit-card">
                      <h4>100% Foreign Ownership</h4>
                      <p>Full ownership without a local sponsor, subject to free zone regulations.</p>
                    </div>
                    <div className="benefit-card">
                      <h4>Tax Efficiency</h4>
                      <p>Corporate tax benefits and customs incentives as per applicable free zone frameworks.</p>
                    </div>
                    <div className="benefit-card">
                      <h4>Faster Setup</h4>
                      <p>Streamlined registration processes compared to Mainland structures.</p>
                    </div>
                    <div className="benefit-card">
                      <h4>Sector-Focused Zones</h4>
                      <p>Zones designed around specific industries such as technology, logistics, media, and services.</p>
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
                  <h4>Free Zone Establishment (FZE)</h4>
                  <p>Suitable for single shareholders establishing a Free Zone company with limited liability. Commonly used by solo founders and small businesses.</p>
                </div>
                <div className="legal-card">
                  <h4>Free Zone Company (FZCO)</h4>
                  <p>Designed for businesses with multiple shareholders operating under a Free Zone entity with limited liability protection.</p>
                </div>
                <div className="legal-card">
                  <h4>Branch Office</h4>
                  <p>An extension of an existing foreign or UAE company operating within a Free Zone. No separate legal entity is created.</p>
                </div>
              </div>
              <div className="legal-structure-image">
                <ClientImage
                  src="/assets/freezone-legal.jpg"
                  alt="Legal Structure UAE Free Zone"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="process-section">
          <div className="content-wrapper">
            <h2 style={{ textAlign: 'center' }}>Free Zone Company Formation Process</h2>
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
                <p>We prepare documentation and facilitate application submission to free zone authorities.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mainland-content">
          <div className="content-wrapper">
            <div className="mainland-section why-choose-section">
              <h2 style={{ textAlign: 'center' }}>Why Choose UBD for Free Zone Formation?</h2>
              <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>Zone-specific expertise and efficient processes:</p>
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
                  <p>Documentation aligned to your activity and selected free zone.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Regulatory Expertise</h4>
                  <p>Familiarity with free zone authority requirements.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Transparent Communication</h4>
                  <p>Clear explanation of steps before proceeding.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11L12 14L22 4" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Comprehensive Documentation</h4>
                  <p>Coordinated preparation and submission support.</p>
                </div>
              </div>
            </div>

            <div className="mainland-section related-services-section">
              <h2>Related Services</h2>
              <div className="related-services-grid">
                <Link href="/mainland" className="related-service-card">
                  <h3>Mainland Company Formation</h3>
                  <p>For businesses that require unrestricted access to the UAE market.</p>
                  <span className="related-service-link">Learn More →</span>
                </Link>
                <Link href="/offshore" className="related-service-card">
                  <h3>Offshore Company Formation</h3>
                  <p>For asset holding, international structuring, and non-local businesses.</p>
                  <span className="related-service-link">Learn More →</span>
                </Link>
              </div>
            </div>

            <div className="mainland-section disclaimer-section">
              <div className="disclaimer-note">
                <p><strong>Important:</strong> UBD provides documentation preparation and application facilitation services only. We do not guarantee company registration approvals. Approval decisions are made by the relevant free zone authorities based on their policies and client eligibility. All timelines are indicative estimates only, not commitments.</p>
              </div>
            </div>
          </div>
        </section>

        <CompanyConsultationForm variant="freezone" />
        <CompanyFaq variant="freezone" />
      </div>
    </PublicLayout>
  );
}
