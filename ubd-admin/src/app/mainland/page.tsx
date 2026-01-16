import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';
import CompanyConsultationForm from '@/components/CompanyConsultationForm';
import CompanyFaq from '@/components/CompanyFaq';

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
      <style>{`
        /* Richman-style Mainland Page Specific Styles */
        .mainland-hero {
            background-color: var(--color-navy);
            background-image: url('./assets/mainland-hero-bg.jpg');
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
        .emirates-section-spacing {
            margin-top: var(--space-3xl);
        }
        @media (min-width: 1024px) {
            .emirates-section-spacing {
                margin-top: var(--space-4xl);
            }
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
            margin-bottom: var(--space-lg);
            margin-top: 0;
            letter-spacing: -0.02em;
            line-height: 1.05;
            text-align: left;
        }
        .mainland-section h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #0b2a4a;
            margin-bottom: var(--space-lg);
            letter-spacing: -0.02em;
            line-height: 1.2;
        }
        @media (min-width: 1024px) {
            .mainland-section h2 {
                font-size: 2rem;
                margin-bottom: var(--space-xl);
            }
        }
        .mainland-section h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: var(--space-md);
            margin-top: 0;
            letter-spacing: -0.01em;
            line-height: 1.3;
        }
        .mainland-section p {
            font-size: 1.125rem;
            line-height: 1.7;
            color: #475569;
            margin-bottom: var(--space-md);
            max-width: 65ch;
        }
        .disclaimer-note p {
            max-width: 100% !important;
        }
        .mainland-section h1[style*="center"] + p {
            text-align: center !important;
            margin-left: auto;
            margin-right: auto;
            display: block;
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
            text-align: center;
            margin-bottom: 50px;
        }
        .why-mainland-header h3 {
            text-align: center;
        }
        .why-mainland-header p {
            text-align: center;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
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
            gap: 12px;
        }
        .benefit-card {
            background: transparent;
            padding: 15px 0;
            border: none;
            border-bottom: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
        }
        .benefit-card:last-child {
            border-bottom: none;
        }
        .benefit-card h4 {
            font-size: 1.125rem;
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
        .license-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 30px;
        }
        .license-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .license-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
            border-color: rgba(201, 161, 74, 0.3);
        }
        .license-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #c9a14a, #a8853a);
        }
        .license-icon {
            width: 80px;
            height: 80px;
            background-color: rgba(201, 161, 74, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }
        .license-icon svg {
            width: 48px;
            height: 48px;
        }
        .license-card h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: var(--space-sm);
        }
        .license-card p {
            font-size: 1rem;
            line-height: 1.6;
            color: #475569;
            margin-bottom: var(--space-md);
        }
        .license-card a {
            color: #c9a14a;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
        }
        .process-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 40px;
        }
        .process-section {
            background-color: var(--color-bg);
            padding: var(--space-4xl) 0;
            margin: 0;
            width: 100%;
            margin-left: 0;
            margin-right: 0;
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
        .process-step {
            text-align: left;
            background: white;
            padding: 30px 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .process-step:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
            border-color: rgba(201, 161, 74, 0.3);
        }
        .process-number {
            width: 48px;
            height: 48px;
            background: #c9a14a;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
        }
        .process-step h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: var(--space-sm);
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
            display: block;
            width: 100%;
            box-sizing: border-box;
        }
        .disclaimer-note {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #c9a14a;
            margin-top: 8px;
            display: block;
            width: 100%;
            box-sizing: border-box;
        }
        .disclaimer-note p {
            font-size: 14px;
            margin: 0;
            color: #475569;
            line-height: 1.4;
            display: block;
            word-spacing: normal;
            letter-spacing: normal;
            max-width: 100%;
            width: 100%;
        }
        .disclaimer-note strong {
            color: #0b2a4a;
        }
        .pricing-card {
            background: #ffffff;
            color: #0b2a4a;
            padding: 30px 24px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            border: 1px solid #e2e8f0;
        }
        .pricing-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: var(--space-md);
        }
        .pricing-amount {
            font-size: 42px;
            font-weight: 700;
            color: #c9a14a;
            margin-bottom: 20px;
        }
        .pricing-features {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
            text-align: left;
        }
        .pricing-features li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.9375rem;
            line-height: 1.6;
            color: #475569;
        }
        .pricing-features li:last-child {
            border-bottom: none;
        }
        .pricing-card .btn {
            width: 100%;
            padding: 14px;
            background-color: #c9a14a;
            color: #0b2a4a;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            display: block;
            text-align: center;
            transition: all 0.3s ease;
            margin-top: auto;
        }
        .pricing-card .btn:hover {
            background-color: #a8853a;
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
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .why-choose-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
            border-color: rgba(201, 161, 74, 0.3);
        }
        .why-choose-icon {
            width: 80px;
            height: 80px;
            background-color: rgba(201, 161, 74, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .why-choose-icon svg {
            width: 48px;
            height: 48px;
        }
        .why-choose-card h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: var(--space-sm);
        }
        .why-choose-card p {
            font-size: 1rem;
            line-height: 1.6;
            color: #475569;
            margin: 0;
            text-align: left;
        }
        .mainland-faq {
            margin-top: 40px;
        }
        .mainland-faq details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border: 1px solid #e2e8f0;
        }
        .mainland-faq summary {
            font-size: 18px;
            font-weight: 600;
            color: #0b2a4a;
            cursor: pointer;
            list-style: none;
        }
        .mainland-faq summary::-webkit-details-marker {
            display: none;
        }
        .mainland-faq p {
            font-size: 16px;
            line-height: 1.7;
            color: #475569;
            margin-top: 15px;
            margin-bottom: 0;
        }
        @media (max-width: 1024px) {
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
                <h2>Business Setup Services in UAE Mainland</h2>
                <p>UAE Mainland offers direct local market access, strategic East-West positioning, and 100% foreign ownership in most sectors. Low taxes and a business-friendly environment support unrestricted market access.</p>
                <p>We provide documentation preparation and application facilitation for mainland company formation. We conduct initial review first and proceed only with your approval. Approval decisions are made by UAE authorities (local economic departments).</p>
              </div>
              <div className="mainland-intro-image">
                <img src="/assets/mainland-intro.jpg" alt="UAE Mainland" />
              </div>
            </div>

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

            <div className="why-mainland-wrapper">
              <div className="why-mainland-header">
                <h2 style={{ textAlign: 'center' }}>Why Mainland?</h2>
                <p style={{ textAlign: 'center' }}>Unrestricted market access, government contract eligibility, and operational freedom:</p>
              </div>
              <div className="benefits-grid">
                <div className="benefits-image">
                  <img src="/assets/mainland-benefits.jpg" alt="UAE Mainland Benefits" />
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
          <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Legal Structure</h2>
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
              <img src="/assets/mainland-legal.jpg" alt="Legal Structure" />
            </div>
          </div>
        </div>
      </div>

      <div className="process-section">
        <div className="content-wrapper">
          <h2 style={{ textAlign: 'center' }}>Mainland Company Formation Process</h2>
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

          <div className="mainland-section related-services-section">
            <h2>Related Services</h2>
            <div className="related-services-grid">
              <a href="/freezone" className="related-service-card">
                <h3>Free Zone Company Formation</h3>
                <p>Suitable for international businesses and startups within designated free zones.</p>
                <span className="related-service-link">Learn More →</span>
              </a>
              <a href="/offshore" className="related-service-card">
                <h3>Offshore Company Formation</h3>
                <p>For asset holding, international structuring, and non-local businesses.</p>
                <span className="related-service-link">Learn More →</span>
              </a>
            </div>
          </div>

          <div className="mainland-section disclaimer-section">
            <div className="disclaimer-note">
              <p><strong>Important:</strong> UBD provides documentation preparation and application facilitation services only. We do not guarantee company registration approvals. Approval decisions are made by UAE authorities based on their policies and client eligibility. All timelines are indicative estimates only, not commitments.</p>
            </div>
          </div>
        </div>
      </section>

      <CompanyConsultationForm variant="mainland" />
      <CompanyFaq variant="mainland" />
    </PublicLayout>
  );
}
