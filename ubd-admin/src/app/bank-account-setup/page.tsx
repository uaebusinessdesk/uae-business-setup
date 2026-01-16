import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import WebPageSchema from '@/components/SEO/WebPageSchema';
import BankAccountPrescreenForm from '@/components/BankAccountPrescreenForm';
import BankAccountFaq from '@/components/BankAccountFaq';

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
      <style>{`
        /* Premium Bank Account Setup Page Styles */
        .mainland-hero {
            background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 50%, #0b2a4a 100%);
            background-image: url('./assets/bank-account-hero-bg.jpg');
            background-size: cover;
            background-position: center 44%;
            background-blend-mode: overlay;
            padding: 154px 0 132px;
            text-align: left;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .mainland-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(11, 42, 74, 0.85) 0%, rgba(30, 58, 95, 0.75) 50%, rgba(11, 42, 74, 0.85) 100%);
            z-index: 1;
        }
        .mainland-hero::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(201, 161, 74, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            z-index: 1;
        }
        .mainland-hero .content-wrapper {
            position: relative;
            z-index: 2;
            text-align: left;
            max-width: 900px;
        }
        .mainland-hero h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 24px;
            color: white;
            line-height: 1.1;
            text-align: left;
            letter-spacing: -0.02em;
            font-family: var(--font-family-headings);
        }
        .mainland-hero p {
            font-size: 1.125rem;
            margin-bottom: 32px;
            color: rgba(255, 255, 255, 0.95);
            max-width: 800px;
            text-align: left;
            line-height: 1.6;
            font-weight: 400;
        }
        .mainland-hero p:last-of-type {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.85);
            margin-top: 16px;
            margin-bottom: 40px;
        }
        .mainland-hero .btn {
            display: inline-block;
            padding: 18px 48px;
            background: linear-gradient(135deg, #c9a14a 0%, #d4b05a 100%);
            color: #0b2a4a;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 17px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(201, 161, 74, 0.3);
            position: relative;
            overflow: hidden;
        }
        .mainland-hero .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        .mainland-hero .btn:hover {
            background: linear-gradient(135deg, #d4b05a 0%, #c9a14a 100%);
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(201, 161, 74, 0.4);
        }
        .mainland-hero .btn:hover::before {
            left: 100%;
        }
        .mainland-content {
            padding: 0;
            background: #ffffff;
        }
        .mainland-section {
            padding: calc(var(--space-4xl) * 0.161) var(--container-padding);
            margin-bottom: 0;
            background: #ffffff;
        }
        @media (min-width: 1024px) {
            .mainland-section {
                padding-top: calc(var(--space-4xl) * 0.161);
                padding-bottom: var(--space-2xl);
            }
        }
        .mainland-intro-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: stretch;
            margin-bottom: 80px;
        }
        .mainland-intro-text h1 {
            margin-bottom: 24px;
        }
        .mainland-intro-image {
            width: 100%;
            height: 100%;
            border-radius: 20px;
            overflow: hidden;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            box-shadow: 0 20px 60px rgba(11, 42, 74, 0.1);
            transition: transform 0.4s ease;
        }
        .mainland-intro-image:hover {
            transform: translateY(-5px);
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
            font-family: var(--font-family-headings);
        }
        .mainland-section h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #0b2a4a;
            margin-bottom: 20px;
            letter-spacing: -0.02em;
            line-height: 1.2;
            font-family: var(--font-family-headings);
        }
        @media (min-width: 1024px) {
            .mainland-section h2 {
                font-size: 2rem;
                margin-bottom: 28px;
            }
        }
        .mainland-section h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 16px;
            margin-top: 0;
            letter-spacing: -0.01em;
            line-height: 1.3;
        }
        .mainland-section p {
            font-size: 1.125rem;
            line-height: 1.75;
            color: #64748b;
            margin-bottom: 20px;
            max-width: 70ch;
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
            margin: 6px calc(-1 * var(--container-padding)) 0;
        }
        @media (min-width: 1024px) {
            .why-mainland-wrapper {
                padding: var(--space-4xl) var(--container-padding);
                margin: 6px calc(-1 * var(--container-padding)) 0;
            }
        }
        .why-mainland-header {
            text-align: center;
            margin-bottom: 50px;
        }
        .why-mainland-header h3 {
            text-align: center;
        }
        .why-mainland-header h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #0b2a4a;
            margin-bottom: var(--space-lg);
            margin-top: 0;
            letter-spacing: -0.02em;
            line-height: 1.05;
            text-align: center;
            font-family: var(--font-family-headings);
        }
        .why-mainland-header p {
            text-align: center;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            font-size: 1.125rem;
            color: #64748b;
        }
        .benefits-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: stretch;
            margin-top: 60px;
        }
        .benefits-image {
            width: 100%;
            height: 100%;
            border-radius: 24px;
            overflow: hidden;
            background: none;
            box-shadow: none;
            transition: transform 0.4s ease;
        }
        .benefits-image:hover {
            transform: translateY(-5px);
        }
        .benefits-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            filter: contrast(1.2) brightness(1.1);
        }
        .benefits-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .benefit-card {
            background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
            padding: 32px;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            position: relative;
            box-shadow: 0 2px 8px rgba(11, 42, 74, 0.04);
        }
        .benefit-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #c9a14a 0%, #d4b05a 100%);
            border-radius: 0 4px 4px 0;
            opacity: 0;
        }
        .benefit-card h4 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-family: var(--font-family-headings);
        }
        .benefit-card h4::before {
            content: '✓';
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #c9a14a 0%, #d4b05a 100%);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
        }
        .benefit-card p {
            font-size: 1rem;
            line-height: 1.7;
            color: #64748b;
            margin: 0;
            padding-left: 0;
        }
        .legal-structure-section {
            background-color: #ffffff;
            padding: 70px 0 0 0;
            margin: 0;
            border-radius: 0;
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            position: relative;
        }
        .legal-structure-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201, 161, 74, 0.2), transparent);
        }
        @media (min-width: 1024px) {
            .legal-structure-section {
                padding-top: 80px;
                padding-bottom: 0;
            }
        }
        .legal-structure-section .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--container-padding);
        }
        .legal-structure-section .content-wrapper > p {
            text-align: center !important;
        }
        .legal-structure-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: stretch;
            margin-top: 50px;
        }
        .legal-structure-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .legal-card {
            background: #ffffff;
            padding: 28px;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            position: relative;
            box-shadow: 0 2px 8px rgba(11, 42, 74, 0.04);
        }
        .legal-card h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0b2a4a;
            margin-bottom: 0;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .legal-card h4::before {
            content: '✓';
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #c9a14a 0%, #d4b05a 100%);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
        }
        .legal-card p {
            font-size: 1rem;
            line-height: 1.7;
            color: #64748b;
            margin: 0;
            padding-left: 0;
        }
        .legal-structure-image {
            width: 100%;
            height: 100%;
            border-radius: 24px;
            overflow: hidden;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            box-shadow: 0 20px 60px rgba(11, 42, 74, 0.1);
            transition: transform 0.4s ease;
        }
        .legal-structure-image:hover {
            transform: translateY(-5px);
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
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
            margin-top: 40px;
        }
        .process-section {
            background: linear-gradient(135deg, rgba(11, 42, 74, 0.05) 0%, rgba(201, 161, 74, 0.08) 50%, rgba(11, 42, 74, 0.05) 100%);
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
            width: 60px;
            height: 60px;
            background: #c9a14a;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
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
                rgba(11, 42, 74, 0.92) 0%,
                rgba(11, 42, 74, 0.90) 50%,
                rgba(201, 161, 74, 0.88) 100%
            );
            padding: var(--space-4xl) 0;
            margin: 0;
            width: 100%;
            position: relative;
        }
        .cost-section-wrapper .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 1;
        }
        .cost-section-wrapper h1 {
            color: #ffffff;
        }
        .cost-section-wrapper p {
            color: rgba(255, 255, 255, 0.9);
        }
        @media (min-width: 1024px) {
            .cost-section-wrapper {
                padding-top: var(--space-4xl);
                padding-bottom: var(--space-2xl);
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
        .prescreen-disclaimer {
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
            box-sizing: border-box;
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
            grid-template-columns: repeat(3, 1fr);
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
            .mainland-hero h1 {
                font-size: 42px;
            }
            .mainland-hero p {
                font-size: 18px;
            }
            .mainland-intro-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .mainland-intro-image {
                height: auto;
                min-height: 300px;
            }
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .benefits-image {
                height: 350px;
                order: 1;
            }
            .benefits-content {
                order: 2;
            }
            .legal-structure-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .legal-structure-image {
                height: 350px;
                order: 2;
            }
            .legal-structure-content {
                order: 1;
            }
            .mainland-section h1 {
                font-size: 2.5rem;
            }
            .mainland-section h2 {
                font-size: 2rem;
            }
        }
        @media (max-width: 768px) {
            .mainland-hero {
                padding: 110px 0 88px;
            }
            .mainland-hero h1 {
                font-size: 32px;
            }
            .mainland-hero p {
                font-size: 16px;
            }
            .mainland-hero .btn {
                padding: 16px 36px;
                font-size: 16px;
            }
            .mainland-section {
                padding: 60px var(--container-padding);
            }
            .mainland-section h1 {
                font-size: 2rem;
            }
            .mainland-section h2 {
                font-size: 1.75rem;
            }
            .benefit-card {
                padding: 24px;
            }
            .legal-card {
                padding: 24px;
            }
        }
        /* Remove white background from Citibank logo */
        .authority-logo-item img[alt="Citibank"] {
            mix-blend-mode: multiply;
            filter: contrast(1.3) brightness(1.05);
        }
        .authority-logo-item:hover img[alt="Citibank"] {
            mix-blend-mode: multiply;
            filter: contrast(1.4) brightness(1.1);
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
                  <img src="/assets/bank-account-intro.jpg" alt="UAE Bank Account Setup Support" />
                </div>
              </div>
            </div>

            <div className="why-mainland-wrapper">
              <div className="why-mainland-header">
                <h2 style={{ textAlign: 'center' }}>Two Options We Support</h2>
              </div>

              <div className="benefits-grid">
                <div className="benefits-image">
                  <img src="/assets/bank-account-benefits.jpg" alt="Bank Account Setup Options" />
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
                <img src="/assets/bank-account-service.jpg" alt="Bank Account Setup Benefits" />
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
              <img src="/assets/bank-account-included.jpg" alt="Bank Account Setup Inclusions" />
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
    </PublicLayout>
  );
}
