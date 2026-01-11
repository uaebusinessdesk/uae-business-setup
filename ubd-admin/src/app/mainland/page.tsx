import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/PublicLayout';

export const metadata: Metadata = {
  title: 'Mainland Company Formation in the UAE - UAE Business Desk',
  description: 'Professional documentation and facilitation services for UAE mainland company formation. We prepare incorporation paperwork; UAE authorities make approval decisions.',
};

export default function MainlandPage() {
  return (
    <PublicLayout>
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
