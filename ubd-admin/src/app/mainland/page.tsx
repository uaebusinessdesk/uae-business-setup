import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Mainland Company Formation in the UAE - UAE Business Desk',
  description: 'Professional UAE mainland company formation services. We prepare incorporation paperwork and handle documentation; UAE authorities make approval decisions.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/mainland',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/mainland',
    title: 'Mainland Company Formation UAE - Professional Setup Services',
    description: 'Professional UAE mainland company formation services. We prepare incorporation paperwork and handle documentation; UAE authorities make approval decisions.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/mainland-hero-bg.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mainland Company Formation UAE - Professional Setup Services',
    description: 'Professional UAE mainland company formation services. We prepare incorporation paperwork and handle documentation; UAE authorities make approval decisions.',
    images: ['https://uaebusinessdesk.com/assets/mainland-hero-bg.jpg'],
  },
};

export default function MainlandPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Mainland Company Formation in the UAE - UAE Business Desk"
        description="Professional UAE mainland company formation services. We prepare incorporation paperwork and handle documentation; UAE authorities make approval decisions."
        url="https://www.uaebusinessdesk.com/mainland"
      />
      <section className="mainland-hero" style={{ backgroundImage: "url('/assets/mainland-hero-bg.jpg')" }}>
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
                <span className="breadcrumbs-current">Mainland Company Formation</span>
              </li>
            </ol>
          </nav>
          <h1>Mainland Company Formation in the UAE</h1>
          <p>For businesses that require unrestricted access to the UAE market.</p>
          <p style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '20px' }}>We review feasibility first. You approve before we proceed.</p>
          <a href="#consultation-form" className="btn">Request a Free Consultation</a>
        </div>
      </section>

      <section className="mainland-content">
        <div className="content-wrapper">
          <div className="mainland-section">
            <div className="mainland-intro-grid" style={{ marginBottom: 0 }}>
              <div className="mainland-intro-text">
                <h1>Business Setup Services in UAE Mainland</h1>
                <p>UAE Mainland offers direct local market access, strategic East-West positioning, and 100% foreign ownership in most sectors. Low taxes and a business-friendly environment support unrestricted market access.</p>
                <p>We provide documentation preparation and application facilitation for mainland company formation. We conduct initial review first and proceed only with your approval. Approval decisions are made by UAE authorities (local economic departments).</p>
              </div>
              <div className="mainland-intro-image">
                <Image src="/assets/mainland-intro.jpg" alt="UAE Mainland" width={500} height={400} />
              </div>
            </div>

            {/* Emirates Section */}
            <div className="mainland-section emirates-section-spacing" style={{ marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}>
              <div style={{ background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%)', border: '2px solid #c9a14a', borderRadius: '12px', padding: '30px', margin: 0 }}>
                <h2 style={{ textAlign: 'center', color: '#0b2a4a', marginBottom: '24px', fontSize: '28px' }}>Available Across the United Arab Emirates</h2>
                <p style={{ textAlign: 'center', color: '#334155', marginBottom: '32px', fontSize: '16px', lineHeight: '1.7', maxWidth: '100%', wordWrap: 'break-word' }}>
                  Mainland company formation services are available in all seven emirates of the UAE. Each emirate has its own economic department that handles company registration and licensing.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '32px' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Dubai</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>DED - Dubai Economic Department</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Abu Dhabi</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>ADDED - Abu Dhabi Department of Economic Development</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Sharjah</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>SEDD - Sharjah Economic Development Department</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Ajman</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Ajman Department of Economic Development</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Umm Al Quwain</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Umm Al Quwain Department of Economic Development</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Ras Al Khaimah</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>RAK Department of Economic Development</p>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}>
                    <h4 style={{ color: '#0b2a4a', marginBottom: '8px', fontSize: '18px', whiteSpace: 'nowrap' }}>Fujairah</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Fujairah Department of Economic Development</p>
                  </div>
                </div>
                <p style={{ textAlign: 'center', color: '#334155', marginTop: '32px', fontSize: '15px', lineHeight: '1.7', maxWidth: '100%', wordWrap: 'break-word' }}>
                  We prepare documentation and facilitate applications according to the requirements of the relevant emirate authority. Whether you&apos;re setting up a company in Dubai, Sharjah, Abu Dhabi, or any other emirate, we provide the same professional documentation and facilitation services.
                </p>
              </div>
            </div>

            {/* Why Mainland Section */}
            <div className="why-mainland-wrapper">
              <div className="why-mainland-header">
                <h2 style={{ textAlign: 'center' }}>Why Mainland?</h2>
                <p style={{ textAlign: 'center' }}>Unrestricted market access, government contract eligibility, and operational freedom:</p>
              </div>
              <div className="benefits-grid">
                <div className="benefits-image">
                  <Image src="/assets/mainland-benefits.jpg" alt="UAE Mainland Benefits" width={500} height={400} />
                </div>
                <div className="benefits-content">
                  <div className="benefit-card">
                    <h4>Unrestricted Market Access</h4>
                    <p>Operate freely across the UAE without restrictions. Trade directly with local businesses and consumers.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>100% Foreign Ownership</h4>
                    <p>Full foreign ownership in most sectors without a local sponsor. Complete control of your operations.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>Strategic Gateway</h4>
                    <p>Global trade hub with seamless access to markets across Asia, Africa, and Europe.</p>
                  </div>
                  <div className="benefit-card">
                    <h4>Government Contract Eligibility</h4>
                    <p>Bid for government tenders and public sector projects unavailable to free zone entities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="legal-structure-section">
        <div className="content-wrapper">
          <h1 style={{ textAlign: 'left', marginBottom: '20px' }}>Legal Structure</h1>
          <div className="legal-structure-grid">
            <div className="legal-structure-content">
              <div className="legal-card">
                <h4>Sole Establishment</h4>
                <p>For single-owner businesses and small-scale operations.</p>
              </div>
              <div className="legal-card">
                <h4>Limited Liability Company (LLC)</h4>
                <p>For businesses with multiple shareholders. 100% foreign ownership available in most sectors.</p>
              </div>
              <div className="legal-card">
                <h4>Civil Company</h4>
                <p>For professional service providers such as consultants, lawyers, and accountants.</p>
              </div>
            </div>
            <div className="legal-structure-image">
              <Image src="/assets/mainland-legal.jpg" alt="Legal Structure" width={500} height={400} />
            </div>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="content-wrapper">
          <h1 style={{ textAlign: 'center' }}>Mainland Company Formation Process</h1>
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
              <p>We prepare documentation and facilitate application submission to local economic departments.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mainland-content">
        <div className="content-wrapper">
          <div className="mainland-section why-choose-section">
            <h2 style={{ textAlign: 'center' }}>Why Choose UBD for Mainland Company Formation?</h2>
            <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>Deep regulatory knowledge and efficient processes:</p>
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
                <p>Customized documentation and application strategy matching your business activity, structure, and requirements.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Regulatory Expertise</h4>
                <p>Current with UAE authority requirements and regulatory changes, ensuring compliance from day one.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Transparent Pricing</h4>
                <p>Clear, upfront service fees. Government fees separate and communicated upfront.</p>
              </div>
              <div className="why-choose-card">
                <div className="why-choose-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Comprehensive Documentation</h4>
                <p>All required documents, MOA drafting, trade name reservations, and authority-compliant submissions.</p>
              </div>
            </div>
          </div>

          {/* Related Services Section */}
          <div className="mainland-section related-services-section">
            <h2>Related Services</h2>
            <div className="related-services-grid">
              <Link href="/freezone" className="related-service-card">
                <h3>Free Zone Company Formation</h3>
                <p>Suitable for international businesses and startups within designated free zones.</p>
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
              <p><strong>Important:</strong> UBD provides documentation preparation and application facilitation services only. We do not guarantee company registration approvals. Approval decisions are made by UAE authorities based on their policies and client eligibility. All timelines are indicative estimates only, not commitments.</p>
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
