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
      <style>{`
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
                padding: var(--space-2xl) var(--container-padding);
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
          <p><a href="/contact" className="btn">Contact Us</a></p>
        </div>
      </div>
    </PublicLayout>
  );
}
