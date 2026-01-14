'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

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
      <Script src="/assets/site.js" strategy="afterInteractive" />
    </>
  );
}
