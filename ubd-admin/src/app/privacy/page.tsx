import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';

export const metadata: Metadata = {
  title: 'Privacy Policy - UAE Business Desk',
  description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information when you use our company setup and bank account services.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/privacy',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/privacy',
    title: 'Privacy Policy - UAE Business Desk',
    description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/header-logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - UAE Business Desk',
    description: 'Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information.',
    images: ['https://uaebusinessdesk.com/assets/header-logo.png'],
  },
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <WebPageSchema
        name="Privacy Policy - UAE Business Desk"
        description="Privacy policy for UAE Business Desk. Learn how we collect, use, and protect your personal information."
        url="https://www.uaebusinessdesk.com/privacy"
      />
      <style>{`
        /* Simple Legal Page Styles */
        .legal-page-hero {
            background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-dark) 50%, var(--color-navy) 100%);
            padding: 120px 0 100px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .legal-page-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(201, 161, 74, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(201, 161, 74, 0.06) 0%, transparent 50%),
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 3px,
                    rgba(201, 161, 74, 0.02) 3px,
                    rgba(201, 161, 74, 0.02) 6px
                );
            pointer-events: none;
        }
        .legal-page-hero::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
                to right,
                transparent,
                rgba(201, 161, 74, 0.3) 20%,
                rgba(201, 161, 74, 0.5) 50%,
                rgba(201, 161, 74, 0.3) 80%,
                transparent
            );
        }
        .legal-page-hero .content-wrapper {
            position: relative;
            z-index: 1;
        }
        .legal-page-hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: var(--space-xl);
            color: white;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            position: relative;
            display: inline-block;
        }
        .legal-page-hero h1::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
            border-radius: 2px;
        }
        .legal-page-hero p {
            font-size: 1.375rem;
            color: rgba(255, 255, 255, 0.95);
            max-width: 750px;
            margin: 0 auto;
            line-height: 1.7;
            font-weight: 400;
            text-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
        }
        .legal-content {
            max-width: var(--container-max-width, 1280px);
            margin: 0 auto;
            padding: var(--space-4xl) var(--container-padding);
            width: 100%;
        }
        .legal-section {
            margin-bottom: var(--space-3xl);
        }
        .legal-section h2 {
            font-size: 1.75rem;
            font-weight: 600;
            color: var(--color-navy);
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-sm);
            border-bottom: 2px solid var(--color-gold);
        }
        .legal-section p {
            font-size: 1rem;
            line-height: 1.7;
            color: var(--color-text-light);
            margin-bottom: var(--space-md);
            width: 100%;
            max-width: 100%;
        }
        .legal-section ul {
            margin-left: var(--space-lg);
            margin-bottom: var(--space-md);
            width: 100%;
            max-width: 100%;
        }
        .legal-section li {
            font-size: 1rem;
            line-height: 1.7;
            color: var(--color-text-light);
            margin-bottom: var(--space-sm);
        }
        .legal-cta {
            background-color: var(--color-bg-light);
            padding: var(--space-xl);
            border-radius: 8px;
            border-left: 4px solid var(--color-gold);
            margin-top: var(--space-2xl);
            width: 100%;
            max-width: 100%;
        }
        .legal-cta p {
            margin-bottom: var(--space-sm);
        }
        .legal-cta .btn {
            background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
            color: var(--color-navy);
            padding: 14px 32px;
            font-weight: 600;
            border-radius: 8px;
            display: inline-block;
            margin-top: 8px;
        }
        .legal-cta .btn:hover {
            background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
        }
        @media (max-width: 768px) {
            .legal-page-hero {
                padding: 80px 0 60px;
            }
            .legal-page-hero h1 {
                font-size: 2.25rem;
            }
            .legal-page-hero h1::after {
                width: 60px;
                height: 3px;
            }
            .legal-page-hero p {
                font-size: 1.125rem;
            }
            .legal-content {
                padding: var(--space-3xl) var(--container-padding);
            }
            .legal-section h2 {
                font-size: 1.5rem;
            }
            .legal-cta {
                padding: var(--space-lg);
            }
            .legal-cta .btn {
                width: 100%;
                text-align: center;
            }
        }
      `}</style>
      <section className="legal-page-hero">
        <div className="content-wrapper">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
              <li className="breadcrumbs-item">
                <Link href="/" className="breadcrumbs-link">Home</Link>
              </li>
              <li className="breadcrumbs-item">
                <span className="breadcrumbs-current">Privacy Policy</span>
              </li>
            </ol>
          </nav>
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your personal information.</p>
        </div>
      </section>

      <div className="legal-content">
        <div className="legal-section">
          <h2>Information We Collect</h2>
          <p>We collect information that you provide directly to us through:</p>
          <ul>
            <li>Contact forms on our website</li>
            <li>Email communications</li>
            <li>Phone or WhatsApp conversations</li>
            <li>Service enquiry messages</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number or WhatsApp contact</li>
            <li>Enquiry details and business requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>How We Use Information</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Respond to your enquiries and provide information about our services</li>
            <li>Deliver documentation preparation and application facilitation services</li>
            <li>Follow up on service delivery and provide updates</li>
            <li>Communicate with you regarding your business setup requirements</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Cookies and Analytics</h2>
          <p>We may use basic cookies for site functionality and to improve your browsing experience. We do not sell your data to third parties.</p>
        </div>

        <div className="legal-section">
          <h2>Sharing of Information</h2>
          <p>We may share your information only with service providers as needed to deliver our services (such as document processing or communication tools). We do not sell your personal information to third parties.</p>
        </div>

        <div className="legal-section">
          <h2>Data Retention</h2>
          <p>We retain your information as long as needed for business purposes and compliance requirements. You may request deletion of your data where applicable, and we will comply with reasonable requests subject to legal and business obligations.</p>
        </div>
        <div className="legal-section">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information (subject to legal and business requirements)</li>
          </ul>
        </div>
      <div className="legal-cta">
        <p><strong>Questions About Privacy?</strong></p>
        <p>For privacy-related enquiries or to exercise your rights, please contact us.</p>
        <p><a href="/contact" className="btn">Contact Us</a></p>
      </div>
      </div>
    </PublicLayout>
  );
}
