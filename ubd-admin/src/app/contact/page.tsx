import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import ContactPageSchema from '@/components/SEO/ContactPageSchema';

export const metadata: Metadata = {
  title: 'Contact Us - UAE Business Desk',
  description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://uaebusinessdesk.com/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://uaebusinessdesk.com/contact',
    title: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
    images: [{ url: 'https://uaebusinessdesk.com/assets/contact-hero.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
    images: ['https://uaebusinessdesk.com/assets/contact-hero.jpg'],
  },
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <ContactPageSchema />
      <section className="hero" style={{ backgroundImage: "linear-gradient(rgba(11, 42, 74, 0.3), rgba(11, 42, 74, 0.4)), url('/assets/contact-hero.jpg')" }}>
        <div className="hero-inner container">
          <div className="hero-copy" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                  <Link href="/" className="breadcrumbs-link">Home</Link>
                </li>
                <li className="breadcrumbs-item">
                  <span className="breadcrumbs-current">Contact</span>
                </li>
              </ol>
            </nav>
            <h1>Get in Touch</h1>
            <p className="subheadline" style={{ textAlign: 'left' }}>Contact us to discuss your requirements and receive structured guidance on UAE company formation and bank account setup.</p>
            <a href="#consultation-form" className="btn btn-primary" style={{ marginTop: 'var(--space-xl)' }}>Send Your Enquiry</a>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 'var(--space-xl)' }}>
        <div className="content-wrapper">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>Contact Us</h2>
          <div className="contact-methods">
            <a
              href="https://wa.me/971504209110"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-method"
              style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
              data-whatsapp="true"
            >
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-gold)', marginBottom: 'var(--space-sm)' }}>
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.133-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3>WhatsApp</h3>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 'var(--space-sm) 0', color: 'var(--color-navy)' }}>Click to message us</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Send us a message for initial enquiries. We typically respond within one business day.
              </p>
            </a>
            <a
              href="mailto:support@uaebusinessdesk.com"
              className="contact-method"
              style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
            >
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-gold)', marginBottom: 'var(--space-sm)' }}>
                  <path
                    d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Email</h3>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 'var(--space-sm) 0', color: 'var(--color-navy)' }}>
                support@uaebusinessdesk.com
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Send us an email with your enquiry details. Our team will respond within one business day.
              </p>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Business+Center+Sharjah+Publishing+City+Sharjah+United+Arab+Emirates"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-method"
              style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
            >
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-gold)', marginBottom: 'var(--space-sm)' }}>
                  <path
                    d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Office Location</h3>
              <p style={{ fontSize: '1rem', fontWeight: 500, margin: 'var(--space-sm) 0', color: 'var(--color-text-dark)' }}>
                Capo Fin FZE
                <br />
                Business Center, Sharjah Publishing City
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0 }}>Sharjah, United Arab Emirates</p>
            </a>
          </div>
        </div>
      </section>

      <section id="consultation-form" className="section" style={{ backgroundColor: 'var(--color-gold-light)' }}>
        <div className="content-wrapper">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>Submit Your Enquiry</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2xl)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Share a brief overview of your requirements. This helps us review your case and respond accurately.
            </p>

            <div className="checklist-box" style={{ marginBottom: 'var(--space-2xl)' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-sm)', color: 'var(--color-navy)' }}>Helpful details (optional):</h3>
              <ul style={{ margin: 'var(--space-sm) 0', paddingLeft: 'var(--space-lg)', fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
                <li>Business activity</li>
                <li>Service required (company setup or bank support)</li>
                <li>Preferred timeline</li>
                <li>Company structure (if known)</li>
                <li>Any specific questions</li>
              </ul>
            </div>

            <div className="form-card" style={{ maxWidth: '100%' }}>
              <form className="contact-form" action="#" method="POST" autoComplete="on">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" name="name" placeholder="John Smith" autoComplete="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" placeholder="john.smith@example.com" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="whatsapp">WhatsApp Number *</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    placeholder="+971 50 123 4567"
                    pattern="^\\+?[0-9\\s\\-\\(\\)]+$"
                    autoComplete="tel-national"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Your Enquiry *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Briefly describe your business activity, the service you're looking for, and any timelines or questions you have."
                    autoComplete="off"
                  />
                </div>

                <div className="form-group" id="captchaGroup">
                  <label htmlFor="captchaAnswer">
                    Security Check * <span id="captchaQuestion" style={{ fontWeight: 600, color: 'var(--color-navy)' }}></span>
                  </label>
                  <input
                    type="text"
                    id="captchaAnswer"
                    name="captchaAnswer"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter your answer"
                    required
                    style={{ maxWidth: '200px' }}
                  />
                  <input type="hidden" id="captchaCorrectAnswer" name="captchaCorrectAnswer" />
                </div>

                <input type="text" name="website" className="honeypot-field" tabIndex={-1} autoComplete="off" />

                <div className="form-group privacy-checkbox-group">
                  <label>
                    <input type="checkbox" name="privacyAccepted" required />
                    <span>
                      I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
                    </span>
                  </label>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 'var(--space-md) var(--space-xl)', fontSize: '1.0625rem' }}
                    aria-label="Send enquiry form"
                  >
                    Send Your Enquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}>
        <div className="content-wrapper" style={{ maxWidth: '100%', width: '100%' }}>
          <div className="disclaimer-box" style={{ width: '100%', maxWidth: '100%', backgroundColor: 'var(--color-gold-light)' }}>
            <h2>Important Reminder</h2>
            <p style={{ width: '100%', maxWidth: '100%' }}>
              We provide documentation preparation and application facilitation services only. All approvals and timelines are determined by UAE authorities and banks.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
