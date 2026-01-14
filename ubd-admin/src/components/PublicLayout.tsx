'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();
  const showCookieConsent = [
    '/',
    '/mainland',
    '/freezone',
    '/offshore',
    '/bank-account-setup',
    '/contact',
  ].includes(pathname ?? '');

  return (
    <>
      <header>
        <nav className="nav">
          <Link href="/" className="brand">
            <Image src="/assets/header-logo.png" alt="UBD - UAE Business Desk" width={120} height={40} className="logo-img" priority />
            <span style={{ display: 'none' }}>UBD</span>
          </Link>
          <button
            id="navToggle"
            className="nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul id="navLinks" className={`nav-links ${isNavOpen ? 'active' : ''}`}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li className="has-dropdown">
              <a href="#" className="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                Company Formation
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link href="/mainland">Mainland Company Formation</Link>
                </li>
                <li>
                  <Link href="/freezone">Free Zone Company Formation</Link>
                </li>
                <li>
                  <Link href="/offshore">Offshore Company Formation</Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/bank-account-setup">Bank Account Setup</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' }}>
                <Image src="/assets/header-logo.png" alt="UAE Business Desk" width={40} height={40} className="footer-logo" />
                <span style={{ fontSize: '40px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', fontFamily: 'var(--font-family-headings)', letterSpacing: '0.05em', lineHeight: 1 }}>
                  UBD
                </span>
              </Link>
              <p className="footer-description" style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '12px' }}>
                Clarity before commitment
              </p>
              <p className="footer-description">Documentation preparation and application facilitation services.</p>
              <div className="footer-social">
                <a href="https://www.facebook.com/uaebusinessdeskuae" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/uaebusinessdesk/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/uaebusinessdesk/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company Formation</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/mainland">Mainland Company Formation</Link>
                </li>
                <li>
                  <Link href="/freezone">Free Zone Company Formation</Link>
                </li>
                <li>
                  <Link href="/offshore">Offshore Company Formation</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/bank-account-setup">Bank Account Setup</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/disclaimer">Disclaimer</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Business Center, Sharjah Publishing City, Sharjah, United Arab Emirates</span>
                </li>
                <li>
                  <button
                    id="requestCallbackBtn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      padding: 0,
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.3524 21.4019C21.1475 21.5907 20.906 21.735 20.6441 21.8251C20.3821 21.9152 20.1055 21.9492 19.83 21.925C16.743 21.5857 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.115 4.18C2.09083 3.90447 2.12484 3.62793 2.21495 3.36598C2.30506 3.10403 2.44932 2.86252 2.63812 2.65764C2.82693 2.45276 3.05585 2.28915 3.31085 2.17755C3.56585 2.06596 3.84152 2.00895 4.12 2.01H7.12C7.68147 1.99422 8.22772 2.20279 8.64118 2.59281C9.05464 2.98284 9.30245 3.52405 9.33 4.09C9.39497 5.118 9.58039 6.136 9.88 7.12C10.0267 7.67343 10.0005 8.25894 9.80506 8.8003C9.60964 9.34166 9.25416 9.81351 8.79 10.15L7.09 11.85C9.51437 14.8337 12.6663 17.4856 15.65 19.91L17.35 18.21C17.6865 17.7458 18.1583 17.3904 18.6997 17.1949C19.2411 16.9995 19.8266 16.9733 20.38 17.12C21.364 17.4196 22.382 17.605 23.41 17.67C23.9759 17.6976 24.5171 17.9454 24.9072 18.3589C25.2972 18.7723 25.5058 19.3186 25.49 19.88L22.49 19.88Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Request a Call Back</span>
                  </button>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>support@uaebusinessdesk.com</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Office Hours: Sunday to Thursday, 9:00 AM – 6:00 PM (UAE Time)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">&copy; 2024 UAE Business Desk. All rights reserved.</p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', marginBottom: 0 }}>
                UBD is a service offering of Capo Fin FZE, UAE.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {showCookieConsent && (
        <div id="cookieConsent" className="cookie-consent">
          <div className="cookie-consent-content">
            <div className="cookie-consent-text">
              <p>
                We use cookies to enhance your browsing experience and analyze site traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
                <a href="/privacy" target="_blank" rel="noopener noreferrer"> Learn more</a>
              </p>
            </div>
            <div className="cookie-consent-buttons">
              <button
                className="cookie-consent-btn cookie-consent-btn-accept"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const cookieWindow = window as Window & { acceptCookies?: () => void };
                    if (typeof cookieWindow.acceptCookies === 'function') {
                      cookieWindow.acceptCookies();
                    }
                  }
                }}
              >
                Accept
              </button>
              <button
                className="cookie-consent-btn cookie-consent-btn-decline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const cookieWindow = window as Window & { declineCookies?: () => void };
                    if (typeof cookieWindow.declineCookies === 'function') {
                      cookieWindow.declineCookies();
                    }
                  }
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      <div id="callbackModal" className="callback-modal" style={{ display: 'none' }}>
        <div className="callback-modal-overlay"></div>
        <div className="callback-modal-content">
          <button className="callback-modal-close" id="callbackModalClose" aria-label="Close modal">&times;</button>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--color-navy)' }}>Request a Call Back</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Enter your mobile number and we&apos;ll call you back at your convenience.
          </p>
          <form id="callbackForm" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="callbackPhone" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)' }}>Mobile Number *</label>
              <input
                type="tel"
                id="callbackPhone"
                name="phone"
                placeholder="+971 50 123 4567"
                required
                style={{ padding: '12px 16px', border: '2px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
              />
              <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Include country code (e.g., +971)</small>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="callbackName" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)' }}>Your Name *</label>
              <input
                type="text"
                id="callbackName"
                name="name"
                placeholder="John Smith"
                required
                style={{ padding: '12px 16px', border: '2px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
              />
            </div>
            <div id="callbackMessage" style={{ display: 'none', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginTop: '8px' }}></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                id="callbackSubmitBtn"
                style={{ flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)', color: 'var(--color-navy)', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                aria-label="Send callback request"
              >
                Send Request
              </button>
              <button
                type="button"
                id="callbackCancelBtn"
                style={{ padding: '14px 24px', background: 'var(--color-bg)', color: 'var(--color-text)', border: '2px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Script src="/assets/site.js" strategy="afterInteractive" />
    </>
  );
}
