'use client';

export default function HomePageClient() {
  return (
    <>
      
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-background"></div>
          <div className="hero-inner container">
            <div className="hero-grid">
              <div className="hero-copy">
                <h1>Start Your UAE Business with Clarity</h1>
                <p className="subheadline">We review feasibility first. You approve before anything moves forward.</p>
                <ul className="hero-bullets">
                  <li>
                    <svg className="icon icon-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    No hidden fees
                  </li>
                  <li>
                    <svg className="icon icon-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Clear, guided process
                  </li>
                  <li>
                    <svg className="icon icon-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Free consultation
                  </li>
                </ul>
                <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  <a href="#consultation-form" className="btn btn-primary">Request a Free Consultation</a>
                </div>
              </div>
              <div className="hero-right">
                <div className="hero-typed-static">We help with</div>
                <div className="hero-typed" aria-label="Services">
                  <div className="hero-typed__line">
                    <span id="heroTypedText" className="hero-typed__text"></span>
                    <span className="hero-typed__cursor" aria-hidden="true">•</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="content-wrapper">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Initial Review First</h3>
                <p>We assess your case before any documentation or applications begin.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Clear Communication</h3>
                <p>You always know what&apos;s happening and what comes next.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>No Upfront Commitments</h3>
                <p>Proceed only after you&apos;re comfortable with the case assessment and scope.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Structured Documentation</h3>
                <p>Prepared to meet UAE authority and bank requirements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Business Setup in 5 Steps */}
        <section className="steps-section">
          <div className="content-wrapper">
            <h2>How It Works</h2>
            <div className="steps-strip">
              <button className="step-item active" data-step="1" aria-label="Step 1: Share your requirements">
                <span className="step-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="step-number">1</span>
                <span className="step-title">Share your requirements</span>
              </button>
              <button className="step-item" data-step="2" aria-label="Step 2: We conduct initial review">
                <span className="step-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="step-number">2</span>
                <span className="step-title">We conduct initial review</span>
              </button>
              <button className="step-item" data-step="3" aria-label="Step 3: You approve before proceeding">
                <span className="step-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="step-number">3</span>
                <span className="step-title">You approve before proceeding</span>
              </button>
              <button className="step-item" data-step="4" aria-label="Step 4: Company setup and bank support">
                <span className="step-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="step-number">4</span>
                <span className="step-title">Company setup and bank support (if required)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="intro-section">
          <div className="content-wrapper">
            <div className="intro-section-inner">
              <div className="intro-section-text">
                <h2>Business Setup in the UAE</h2>
                <p>Starting a business in the UAE doesn&apos;t have to be complicated.</p>
                <p>We manage documentation and coordinate applications for company formation and bank account setup, so you can move forward with clarity.</p>
                <p>We conduct initial review first and proceed only with your approval — no surprises, no unnecessary commitments.</p>
                <p>From Mainland and Free Zone companies to Offshore structures, we support you from idea to execution with confidence.</p>
              </div>
              <div className="intro-images">
                <div className="intro-image-item">
                  <img
                    src="/assets/intro-1.jpg"
                    alt="UAE Business Setup Services"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
                <div className="intro-image-item">
                  <img
                    src="/assets/intro-2.jpg"
                    alt="UAE Company Incorporation"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
                <div className="intro-image-item">
                  <img
                    src="/assets/intro-3.jpg"
                    alt="UAE Business Documentation"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="emirates-coverage-card">
              <div className="emirates-card-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="emirates-icon">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                    fill="#c9a14a"
                  />
                </svg>
                <h3 className="emirates-card-title">Available Across All Seven Emirates</h3>
              </div>
              <p className="emirates-card-description">
                Our company formation services are available across all seven emirates. Each emirate has its own economic department, and we prepare documentation according to the relevant authority requirements.
              </p>
              <div className="emirates-list">
                <span className="emirate-badge">Dubai</span>
                <span className="emirate-badge">Abu Dhabi</span>
                <span className="emirate-badge">Sharjah</span>
                <span className="emirate-badge">Ajman</span>
                <span className="emirate-badge">Umm Al Quwain</span>
                <span className="emirate-badge">Ras Al Khaimah</span>
                <span className="emirate-badge">Fujairah</span>
              </div>
            </div>
          </div>
        </section>

        {/* Jurisdiction Section */}
        <section className="jurisdiction-section">
          <div className="content-wrapper">
            <h2>Choose Your Jurisdiction</h2>
            <div className="jurisdiction-grid">
              <a href="/mainland" className="jurisdiction-card">
                <div className="jurisdiction-image">
                  <img
                    src="/assets/jurisdiction-mainland.jpg"
                    alt="Mainland UAE"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                  <p className="jurisdiction-text-overlay">
                    Best for businesses serving the local UAE market and operating without geographic restrictions.
                  </p>
                </div>
                <div className="jurisdiction-content">
                  <h3>MAINLAND</h3>
                  <span className="jurisdiction-cta">Learn More →</span>
                </div>
              </a>
              <a href="/freezone" className="jurisdiction-card">
                <div className="jurisdiction-image">
                  <img
                    src="/assets/jurisdiction-freezone.jpg"
                    alt="Free Zone UAE"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                  <p className="jurisdiction-text-overlay">
                    Ideal for startups and international businesses looking for faster setup and simplified operations.
                  </p>
                </div>
                <div className="jurisdiction-content">
                  <h3>FREEZONE</h3>
                  <span className="jurisdiction-cta">Learn More →</span>
                </div>
              </a>
              <a href="/offshore" className="jurisdiction-card">
                <div className="jurisdiction-image">
                  <img
                    src="/assets/jurisdiction-offshore.jpg"
                    alt="Offshore UAE"
                    onError={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                  <p className="jurisdiction-text-overlay">
                    Suitable for asset holding, international structuring, and businesses without local operations.
                  </p>
                </div>
                <div className="jurisdiction-content">
                  <h3>OFFSHORE</h3>
                  <span className="jurisdiction-cta">Learn More →</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section" id="services">
          <div className="content-wrapper">
            <h2>Our Core Services</h2>
            <p className="section-intro">
              We provide documentation preparation and application facilitation for UAE company incorporation and bank account setup. Approval decisions are made by authorities and banks. Bank account support is introduced only after company incorporation is completed.
            </p>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Company Incorporation</h3>
                <ul className="service-features">
                  <li>Initial review first</li>
                  <li>Documentation preparation</li>
                  <li>Application submission and facilitation</li>
                </ul>
                <a href="#consultation-form" className="service-link">
                  Get Started →
                </a>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Bank Account Setup</h3>
                <ul className="service-features">
                  <li>Introduced after company incorporation is completed</li>
                  <li>Bank documentation preparation</li>
                  <li>Application submission coordination</li>
                </ul>
                <a href="/bank-account-setup" className="service-link">Read more →</a>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Combined Support</h3>
                <ul className="service-features">
                  <li>Initial review first</li>
                  <li>Company and bank documentation</li>
                  <li>Coordinated facilitation</li>
                </ul>
                <a href="#consultation-form" className="service-link">
                  Get Started →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Authorities Section */}
        <section className="anywhere-section">
          <div className="content-wrapper">
            <div className="authorities-wrapper">
              <div className="anywhere-content">
                <h2>Authorities We Work With</h2>
                <div className="authority-logos-scroll">
                  <div className="authority-logos-track">
                    {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, idx) => (
                      <div key={`${num}-${idx}`} className="authority-logo-item">
                        <img
                          src={`/assets/authority-logo-${num}.png`}
                          alt="Authority Logo"
                          onError={(event) => {
                            event.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                            event.currentTarget.style.display = 'block';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consultation Form Section */}
        <section className="section consultation-section" id="consultation-form" style={{ padding: 'var(--space-4xl) 0' }}>
          <div className="content-wrapper">
            <div className="ubd-form">
              <div className="form-card">
                <div className="form-header">
                  <div className="form-header-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 10H16M8 14H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M8 4V2M16 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Request a Free Consultation</h3>
                  <p className="form-reassurance">Share your details. We&apos;ll conduct initial review and get back to you.</p>
                </div>
                <form className="form ubd-consultation-form" autoComplete="on">
                  <div className="ubd-form-grid">
                    <div className="form-section-divider">
                      <span className="form-section-title">Contact Information</span>
                    </div>

                    <div className="form-group form-group-with-icon">
                      <label htmlFor="ubd-fullname">Full Name *</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input type="text" id="ubd-fullname" name="fullName" placeholder="John Smith" autoComplete="name" required />
                      </div>
                    </div>
                    <div className="form-group form-group-with-icon">
                      <label htmlFor="ubd-whatsapp">WhatsApp Number *</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.3524 21.4019C21.1475 21.5907 20.906 21.735 20.6441 21.8251C20.3821 21.9152 20.1055 21.9492 19.83 21.925C16.743 21.5857 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.115 4.18C2.09083 3.90447 2.12484 3.62793 2.21495 3.36598C2.30506 3.10403 2.44932 2.86252 2.63812 2.65764C2.82693 2.45276 3.05585 2.28915 3.31085 2.17755C3.56585 2.06596 3.84152 2.00895 4.12 2.01H7.12C7.68147 1.99422 8.22772 2.20279 8.64118 2.59281C9.05464 2.98284 9.30245 3.52405 9.33 4.09C9.39497 5.118 9.58039 6.136 9.88 7.12C10.0267 7.67343 10.0005 8.25894 9.80506 8.8003C9.60964 9.34166 9.25416 9.81351 8.79 10.15L7.09 11.85C9.51437 14.8337 12.6663 17.4856 15.65 19.91L17.35 18.21C17.6865 17.7458 18.1583 17.3904 18.6997 17.1949C19.2411 16.9995 19.8266 16.9733 20.38 17.12C21.364 17.4196 22.382 17.605 23.41 17.67C23.9759 17.6976 24.5171 17.9454 24.9072 18.3589C25.2972 18.7723 25.5058 19.3186 25.49 19.88L22.49 19.88Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input type="tel" id="ubd-whatsapp" name="whatsapp" placeholder="+97150xxxxxxx" autoComplete="tel-national" required />
                      </div>
                    </div>
                    <div className="form-group form-group-with-icon">
                      <label htmlFor="ubd-email">Email *</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input type="email" id="ubd-email" name="email" placeholder="john.smith@example.com" autoComplete="email" required />
                      </div>
                    </div>

                    <div className="form-section-divider">
                      <span className="form-section-title">Service Information</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="serviceRequired">What do you need help with? *</label>
                      <select id="serviceRequired" name="helpWith" autoComplete="off" required>
                        <option value="">Select option</option>
                        <option value="mainland">Mainland company setup</option>
                        <option value="freezone">Free zone company setup</option>
                        <option value="offshore">Offshore company setup</option>
                      </select>
                    </div>
                    <div className="form-group" id="emirateGroup" style={{ display: 'none' }}>
                      <label htmlFor="ubd-emirate">Preferred Emirate *</label>
                      <select id="ubd-emirate" name="emirate" autoComplete="off">
                        <option value="">Select emirate</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                        <option value="Not Sure">Not Sure</option>
                      </select>
                      <small>Select the emirate where you want to set up your company.</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ubd-activity">Business Activity *</label>
                      <input type="text" id="ubd-activity" name="activity" placeholder="e.g., Trading, IT Services" autoComplete="organization" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ubd-nationality">Nationality *</label>
                      <input type="text" id="ubd-nationality" name="nationality" placeholder="e.g., Indian, British, Emirati" autoComplete="country" list="nationality-list" required />
                      <datalist id="nationality-list">
                        <option value="Indian" />
                        <option value="British" />
                        <option value="Emirati" />
                        <option value="Pakistani" />
                        <option value="Bangladeshi" />
                        <option value="Filipino" />
                        <option value="Egyptian" />
                        <option value="Lebanese" />
                        <option value="Jordanian" />
                        <option value="American" />
                        <option value="Canadian" />
                        <option value="Australian" />
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ubd-residence">Country of Residence *</label>
                      <input type="text" id="ubd-residence" name="residence" placeholder="e.g., UAE, India, UK" autoComplete="country-name" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ubd-timeline">Preferred Timeline</label>
                      <select id="ubd-timeline" name="timeline" autoComplete="off">
                        <option value="">Select timeline</option>
                        <option value="immediately">Immediately</option>
                        <option value="within-1-month">Within 1 month</option>
                        <option value="1-3-months">1–3 months</option>
                        <option value="exploring">Exploring</option>
                      </select>
                    </div>

                    <div className="form-conditional ubd-form-full-width" id="companyFields" style={{ display: 'none' }}>
                      <div className="form-group">
                        <label htmlFor="ubd-shareholders">Number of Shareholders</label>
                        <select id="ubd-shareholders" name="shareholders" autoComplete="off">
                          <option value="">Select</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4+">4+</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="visasRequired">Visas Required?</label>
                        <select id="visasRequired" name="visasRequired" autoComplete="off">
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="form-group ubd-form-full-width" id="visaCountWrap" style={{ display: 'none' }}>
                        <label htmlFor="ubd-visas-count">How many visas?</label>
                        <select id="ubd-visas-count" name="visasCount" autoComplete="off">
                          <option value="">Select</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4+">4+</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group ubd-form-full-width">
                      <label htmlFor="ubd-notes">Notes</label>
                      <textarea id="ubd-notes" name="notes" rows={3} placeholder="Any additional information..." autoComplete="off"></textarea>
                    </div>
                    <div className="form-group ubd-form-full-width form-submit-section">
                      <div className="privacy-checkbox-group">
                        <label className="privacy-checkbox-label">
                          <input type="checkbox" name="privacyAccepted" required />
                          <span className="privacy-checkbox-custom"></span>
                          <span className="privacy-checkbox-text">
                            I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
                          </span>
                        </label>
                      </div>

                      <button type="submit" className="submit-button">
                        <span className="button-text">Request a Free Consultation</span>
                        <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
                <p className="form-disclaimer">Approvals and timelines depend on third parties. We provide documentation and application facilitation only.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="content-wrapper">
            <div className="faq-content">
              <h2>Frequently Asked Questions</h2>
              <div className="faq">
                <details>
                  <summary>How does your process work?</summary>
                  <p>We review your requirements and conduct initial assessment first. Once you approve, we proceed with documentation preparation and application facilitation.</p>
                </details>
                <details>
                  <summary>Do you guarantee approvals?</summary>
                  <p>No. We prepare documentation and facilitate applications, but final approval decisions are made by authorities and banks.</p>
                </details>
                <details>
                  <summary>What services do you provide?</summary>
                  <p>We provide documentation preparation and application facilitation for UAE company incorporation and bank account setup. Approval decisions are made by authorities and banks.</p>
                </details>
                <details>
                  <summary>How long does the process take?</summary>
                  <p>Initial review typically takes a few business days. Timelines vary depending on authorities and banks.</p>
                </details>
                <details>
                  <summary>Do I need to pay upfront?</summary>
                  <p>No. We conduct initial review first and proceed only after your approval.</p>
                </details>
                <details>
                  <summary>When does bank account setup begin?</summary>
                  <p>Bank account support is introduced only after company incorporation is completed.</p>
                </details>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
