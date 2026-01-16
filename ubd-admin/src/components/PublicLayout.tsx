'use client';

import Link from 'next/link';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import PublicFooter from './PublicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
            <img
              src="/assets/header-logo.png"
              alt="UBD - UAE Business Desk"
              className="logo-img"
              onError={(event) => {
                const target = event.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) {
                  fallback.style.display = 'inline';
                }
              }}
            />
            <span style={{ display: 'none' }}>UBD</span>
          </Link>
          <button
            id="navToggle"
            className="nav-toggle"
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul id="navLinks" className="nav-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li className="has-dropdown">
              <a
                href="#"
                className="dropdown-toggle"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={(event) => event.preventDefault()}
              >
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

      <PublicFooter />
      {showCookieConsent && (
        <div id="cookieConsent" className="cookie-consent">
          <div className="cookie-consent-content">
            <div className="cookie-consent-text">
              <p>
                We use cookies to enhance your browsing experience and analyze site traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.{' '}
                <a href="/privacy" target="_blank">Learn more</a>
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
