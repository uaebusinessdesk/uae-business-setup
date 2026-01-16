import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';
import CompanyConsultationForm from '@/components/CompanyConsultationForm';
import CompanyFaq from '@/components/CompanyFaq';
import ClientImage from '@/components/ClientImage';

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
      <style>{`
        /* Richman-style Mainland Page Specific Styles */
        .mainland-hero {
            background-color: var(--color-navy);
            background-image: url('./assets/offshore-hero-bg.jpg');
            background-size: cover;
            background-position: center bottom;
            background-repeat: no-repeat;
            padding: 120px 0 100px;
            text-align: left;
            color: white;
            position: relative;
        }
        .mainland-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(11, 42, 74, 0.3), rgba(11, 42, 74, 0.2));
            z-index: 1;
        }
        .mainland-hero .content-wrapper {
            position: relative;
            z-index: 2;
            text-align: left;
        }
        .mainland-hero h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: white;
            line-height: 1.2;
            text-align: left;
        }
        .mainland-hero p {
            font-size: 1.125rem;
            margin-bottom: 40px;
            color: rgba(255, 255, 255, 0.95);
            max-width: 800px;
            text-align: left;
        }
        .mainland-hero .btn {
            display: inline-block;
            padding: 16px 40px;
            background-color: #c9a14a;
            color: #0b2a4a;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .mainland-hero .btn:hover {
            background-color: #a8853a;
            transform: translateY(-2px);
        }
        .mainland-content {
            padding: 0;
        }
        .mainland-section {
            padding: var(--space-4xl) var(--container-padding);
            margin-bottom: 0;
            background-color: var(--color-bg);
        }
        .why-choose-section {
            background-color: var(--color-gold-light);
            margin-top: var(--space-2xl);
        }
        @media (min-width: 1024px) {
            .why-choose-section {
                margin-top: var(--space-2xl);
            }
        }
        @media (min-width: 1024px) {
            .mainland-section {
                padding-top: var(--space-4xl);
                padding-bottom: var(--space-2xl);
            }
        }
        .mainland-intro-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: stretch;
            margin-bottom: 60px;
        }
        .mainland-intro-text h2 {
            margin-bottom: 20px;
        }
        .mainland-intro-image {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            overflow: hidden;
            background-color: #f1f5f9;
        }
        .mainland-intro-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .mainland-section h1,
        .legal-structure-section h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0b2a4a;
            margin-bottom: 30px;
            line-height: 1.2;
        }
        .mainland-section h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #0b2a4a;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .mainland-section h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        .mainland-section p {
            font-size: 1.125rem;
            line-height: 1.7;
            color: #475569;
            margin-bottom: var(--space-lg);
        }
        .mainland-section h1[style*="center"] + p {
            font-size: 1.125rem;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }
        .why-mainland-wrapper {
            background-color: var(--color-gold-light);
            padding: var(--space-3xl) var(--container-padding);
            margin: var(--space-3xl) calc(-1 * var(--container-padding)) 0;
        }
        @media (min-width: 1024px) {
            .why-mainland-wrapper {
                padding: var(--space-4xl) var(--container-padding);
                margin: var(--space-4xl) calc(-1 * var(--container-padding)) 0;
            }
        }
        .why-mainland-header {
            margin-bottom: 40px;
        }
        .benefits-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: stretch;
            margin-top: 40px;
        }
        .benefits-image {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            overflow: hidden;
            background-color: #f1f5f9;
        }
        .benefits-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .benefits-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .benefit-card {
            background: transparent;
            padding: 20px 0;
            border: none;
            border-bottom: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .benefit-card:last-child {
            border-bottom: none;
        }
        .benefit-card h4 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .benefit-card h4::before {
            content: '✓';
            width: 24px;
            height: 24px;
            background: #c9a14a;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .benefit-card p {
            font-size: 16px;
            line-height: 1.7;
            color: #475569;
            margin: 0;
            padding-left: 36px;
        }
        .legal-structure-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: stretch;
            margin-top: 30px;
        }
        .legal-structure-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .legal-card {
            background: transparent;
            padding: 15px 0;
            border: none;
            border-bottom: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
        }
        .legal-card:last-child {
            border-bottom: none;
        }
        .legal-card h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .legal-card h4::before {
            content: '✓';
            width: 24px;
            height: 24px;
            background: #c9a14a;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .legal-card p {
            font-size: 16px;
            line-height: 1.7;
            color: #475569;
            margin: 0;
            padding-left: 36px;
        }
        .legal-structure-image {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            overflow: hidden;
            background-color: #f1f5f9;
        }
        .legal-structure-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .process-section {
            background-color: var(--color-bg);
            padding: var(--space-4xl) 0;
            margin: 0;
            width: 100%;
        }
        .process-section .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        @media (min-width: 1024px) {
            .process-section {
                padding-top: var(--space-4xl);
                padding-bottom: var(--space-2xl);
            }
        }
        .process-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 40px;
        }
        .process-step {
            text-align: left;
            background: white;
            padding: 30px 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
        }
        .process-step:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
            border-color: rgba(201, 161, 74, 0.3);
        }
        .process-number {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #c9a14a, #a8853a);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .process-step h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 10px;
        }
        .process-step p {
            font-size: 0.9375rem;
            line-height: 1.6;
            color: #475569;
            margin: 0;
        }
        .cost-section-wrapper {
            background: linear-gradient(
                135deg,
                rgba(11, 42, 74, 0.95) 0%,
                rgba(11, 42, 74, 0.92) 50%,
                rgba(201, 161, 74, 0.90) 100%
            );
            padding: calc(var(--space-2xl) * 0.7) 0;
            margin: 0;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        .cost-section-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 30%, rgba(201, 161, 74, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(11, 42, 74, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        .cost-section-wrapper .content-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 1;
        }
        .cost-section-wrapper h1 {
            color: #ffffff;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: calc(var(--space-md) * 0.7);
            text-align: center;
            letter-spacing: -0.02em;
            line-height: 1.2;
        }
        .cost-section-wrapper p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 1.125rem;
            line-height: 1.7;
            text-align: center;
            max-width: 700px;
            margin: 0 auto;
            font-weight: 400;
            position: relative;
        }
        .cost-section-wrapper p::after {
            content: '';
            display: block;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(201, 161, 74, 0.6), transparent);
            margin: calc(var(--space-lg) * 0.7) auto 0;
        }
        @media (min-width: 1024px) {
            .cost-section-wrapper {
                padding-top: calc(var(--space-2xl) * 0.7);
                padding-bottom: calc(var(--space-2xl) * 0.7);
            }
            .cost-section-wrapper h1 {
                font-size: 3rem;
                margin-bottom: calc(var(--space-lg) * 0.7);
            }
            .cost-section-wrapper p {
                font-size: 1.25rem;
            }
        }
        .cost-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
            align-items: center;
        }
        .cost-info h4 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: var(--space-md);
        }
        .cost-info p {
            font-size: 1rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: var(--space-xl);
        }
        .cost-note {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #c9a14a;
            margin-top: 30px;
            backdrop-filter: blur(10px);
        }
        .cost-note p {
            font-size: 14px;
            margin: 0;
            color: rgba(255, 255, 255, 0.95);
        }
        .cost-note strong {
            color: #ffffff;
        }
        .disclaimer-section {
            padding-top: 0 !important;
            padding-bottom: var(--space-2xl);
        }
        .disclaimer-note {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #c9a14a;
            margin-top: 8px;
        }
        .disclaimer-note p {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0;
            max-width: 100%;
            width: 100%;
        }
        .disclaimer-note strong {
            color: #0b2a4a;
        }
        .why-choose-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            margin-top: 40px;
            margin-bottom: 0;
        }
        .why-choose-card {
            background: white;
            padding: 30px 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            text-align: left;
            transition: all 0.3s ease;
            position: relative;
        }
        .why-choose-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: rgba(201, 161, 74, 0.3);
        }
        .why-choose-icon {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .why-choose-icon svg {
            stroke: #c9a14a;
        }
        .why-choose-card h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 12px;
        }
        .why-choose-card p {
            font-size: 0.9375rem;
            line-height: 1.6;
            color: #475569;
            margin: 0;
        }
        .legal-structure-section {
            background-color: var(--color-gold-light);
            padding: var(--space-4xl) 0;
            margin: 0;
            border-radius: 0;
            width: 100%;
            margin-left: 0;
            margin-right: 0;
        }
        @media (min-width: 1024px) {
            .legal-structure-section {
                padding-top: var(--space-4xl);
                padding-bottom: var(--space-2xl);
            }
        }
        .legal-structure-section .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .consultation-section {
            background-color: var(--color-gold-light);
        }
        #consultation-form {
            background-color: var(--color-gold-light);
        }
        .faq-section {
            background-color: var(--color-bg);
        }
        @media (max-width: 1024px) {
            .mainland-hero h1 {
                font-size: 36px;
            }
            .mainland-hero p {
                font-size: 18px;
            }
            .mainland-intro-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .mainland-intro-image {
                height: 300px;
                min-height: 300px;
            }
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .benefits-image {
                height: 300px;
                min-height: 300px;
                order: 1;
            }
            .benefits-content {
                order: 2;
            }
            .legal-structure-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .legal-structure-image {
                height: 300px;
                min-height: 300px;
                order: 2;
            }
            .legal-structure-content {
                order: 1;
            }
            .license-grid,
            .why-choose-grid {
                grid-template-columns: 1fr;
            }
            .process-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .cost-section {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 768px) {
            .mainland-hero h1 {
                font-size: 36px;
            }
            .mainland-hero p {
                font-size: 18px;
            }
            .process-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
      <div>
        <section className="mainland-hero">
          <div className="content-wrapper">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <a href="/" className="breadcrumbs-link">Home</a>
                </li>
                <li className="breadcrumbs-item">
                  <a href="/" className="breadcrumbs-link">Company Formation</a>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Offshore Company Formation</span>
                </li>
              </ol>
            </nav>
            <h1>Offshore Company Formation in the UAE</h1>
            <p>For asset holding, international structuring, and non-local businesses.</p>
            <p style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '20px' }}>We review feasibility first. You approve before we proceed.</p>
            <a href="#consultation-form" className="btn">Request a Free Consultation</a>
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
                  <ClientImage
                    src="/assets/offshore-intro.jpg"
                    alt="Offshore Company Formation"
                  />
                </div>
              </div>

              <div className="why-mainland-wrapper">
                <div className="why-mainland-header">
                  <h2 style={{ textAlign: 'center' }}>Why Offshore?</h2>
                  <p style={{ textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>Offshore structures are typically used for ownership, protection, and international business purposes rather than active trading within the UAE.</p>
                </div>

                <div className="benefits-grid">
                  <div className="benefits-image">
                    <ClientImage
                      src="/assets/offshore-benefits.jpg"
                      alt="Offshore Company Benefits"
                    />
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
                <ClientImage
                  src="/assets/offshore-legal.jpg"
                  alt="Legal Structure"
                />
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
                <p>We prepare documentation and facilitate application submission to offshore registrars.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mainland-content">
          <div className="content-wrapper">
            <div className="mainland-section why-choose-section">
              <h2 style={{ textAlign: 'center' }}>Why Choose UBD for Offshore Company Formation?</h2>
              <p style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>Expertise in offshore structures and international business:</p>
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
                  <p>Documentation aligned to your ownership objectives and offshore jurisdiction requirements.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Regulatory Familiarity</h4>
                  <p>Understanding of offshore registrar procedures and structuring norms.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Transparent Communication</h4>
                  <p>Clear explanation of scope, case assessment, and next steps before proceeding.</p>
                </div>
                <div className="why-choose-card">
                  <div className="why-choose-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11L12 14L22 4" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#c9a14a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4>Comprehensive Documentation</h4>
                  <p>Preparation and coordination of all required offshore incorporation documents.</p>
                </div>
              </div>
            </div>

            <div className="mainland-section related-services-section">
              <h2>Related Services</h2>
              <div className="related-services-grid">
                <a href="/mainland" className="related-service-card">
                  <h3>Mainland Company Formation</h3>
                  <p>For businesses that require unrestricted access to the UAE market.</p>
                  <span className="related-service-link">Learn More →</span>
                </a>
                <a href="/freezone" className="related-service-card">
                  <h3>Free Zone Company Formation</h3>
                  <p>Suitable for international businesses and startups within designated free zones.</p>
                  <span className="related-service-link">Learn More →</span>
                </a>
              </div>
            </div>

            <div className="mainland-section disclaimer-section">
              <div className="disclaimer-note">
                <p><strong>Important:</strong> UBD provides documentation preparation and application facilitation services only. We do not guarantee company registration approvals. Approval decisions are made by offshore authorities based on their policies and client eligibility. All timelines are indicative estimates only.</p>
              </div>
            </div>
          </div>
        </section>

        <CompanyConsultationForm variant="offshore" />
        <CompanyFaq variant="offshore" />
      </div>
    </PublicLayout>
  );
}
