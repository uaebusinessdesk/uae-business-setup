type CompanyConsultationVariant = 'mainland' | 'freezone' | 'offshore';

const variantConfig: Record<CompanyConsultationVariant, {
  heading: string;
  submitText: string;
  serviceDefault: string;
  includeBlankOption: boolean;
  emirateRequired: boolean;
  emirateLabel: string;
  emiratePlaceholder: string;
  emirateHelper: string;
}> = {
  mainland: {
    heading: 'Request a Free Consultation - Mainland Company',
    submitText: 'Request a Free Consultation',
    serviceDefault: 'mainland',
    includeBlankOption: false,
    emirateRequired: true,
    emirateLabel: 'Preferred Emirate *',
    emiratePlaceholder: 'Select emirate',
    emirateHelper: 'Select the emirate where you want to set up your mainland company.',
  },
  freezone: {
    heading: 'Request a Free Consultation - Free Zone Company',
    submitText: 'Submit Consultation Request',
    serviceDefault: 'freezone',
    includeBlankOption: true,
    emirateRequired: false,
    emirateLabel: 'Preferred Emirate',
    emiratePlaceholder: 'Select emirate (optional)',
    emirateHelper: 'Select the emirate where you want to set up your free zone company (optional).',
  },
  offshore: {
    heading: 'Request a Free Consultation - Offshore Company',
    submitText: 'Request a Free Consultation',
    serviceDefault: 'offshore',
    includeBlankOption: false,
    emirateRequired: false,
    emirateLabel: 'Preferred Emirate',
    emiratePlaceholder: 'Select emirate (optional)',
    emirateHelper: 'Select the emirate where you want to set up your offshore company (optional).',
  },
};

export default function CompanyConsultationForm({ variant }: { variant: CompanyConsultationVariant }) {
  const config = variantConfig[variant];

  return (
    <section className="section consultation-section" id="consultation-form" style={{ padding: 'var(--space-4xl) 0' }}>
      <div className="content-wrapper">
        <div className="ubd-form">
          <div className="form-card">
            <div className="form-header">
              <div className="form-header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 10H16M8 14H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 4V2M16 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>{config.heading}</h3>
              <p className="form-reassurance">Share your details. We&apos;ll conduct initial review and get back to you.</p>
            </div>
            <form className="form ubd-consultation-form" action="#" method="POST" autoComplete="on">
              <div className="ubd-form-grid">
                <div className="form-section-divider">
                  <span className="form-section-title">Contact Information</span>
                </div>

                <div className="form-group form-group-with-icon">
                  <label htmlFor="ubd-fullname">Full Name *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input type="text" id="ubd-fullname" name="fullName" placeholder="John Smith" autoComplete="name" required />
                  </div>
                </div>

                <div className="form-group form-group-with-icon">
                  <label htmlFor="ubd-whatsapp">WhatsApp Number *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.3524 21.4019C21.1475 21.5907 20.906 21.735 20.6441 21.8251C20.3821 21.9152 20.1055 21.9492 19.83 21.925C16.743 21.5857 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.115 4.18C2.09083 3.90447 2.12484 3.62793 2.21495 3.36598C2.30506 3.10403 2.44932 2.86252 2.63812 2.65764C2.82693 2.45276 3.05585 2.28915 3.31085 2.17755C3.56585 2.06596 3.84152 2.00895 4.12 2.01H7.12C7.68147 1.99422 8.22772 2.20279 8.64118 2.59281C9.05464 2.98284 9.30245 3.52405 9.33 4.09C9.39497 5.118 9.58039 6.136 9.88 7.12C10.0267 7.67343 10.0005 8.25894 9.80506 8.8003C9.60964 9.34166 9.25416 9.81351 8.79 10.15L7.09 11.85C9.51437 14.8337 12.6663 17.4856 15.65 19.91L17.35 18.21C17.6865 17.7458 18.1583 17.3904 18.6997 17.1949C19.2411 16.9995 19.8266 16.9733 20.38 17.12C21.364 17.4196 22.382 17.605 23.41 17.67C23.9759 17.6976 24.5171 17.9454 24.9072 18.3589C25.2972 18.7723 25.5058 19.3186 25.49 19.88L22.49 19.88Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input type="tel" id="ubd-whatsapp" name="whatsapp" placeholder="+971 50 123 4567" pattern="^\\+?[0-9\\s\\-\\(\\)]+$" autoComplete="tel-national" required />
                  </div>
                </div>

                <div className="form-group form-group-with-icon">
                  <label htmlFor="ubd-email">Email *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input type="email" id="ubd-email" name="email" placeholder="john.smith@example.com" autoComplete="email" required />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'none' }}>
                  <label htmlFor="serviceRequired">What do you need help with? *</label>
                  <select id="serviceRequired" name="helpWith" autoComplete="off" required defaultValue={config.serviceDefault}>
                    {config.includeBlankOption && <option value="">Select option</option>}
                    <option value="mainland">Mainland company setup</option>
                    <option value="freezone">Free zone company setup</option>
                    <option value="offshore">Offshore company setup</option>
                    <option value="existing-company">I already have a UAE company (bank account support)</option>
                    <option value="not-sure">Not sure / need advice</option>
                  </select>
                </div>

                <div className="form-group" id="emirateGroup">
                  <label htmlFor="ubd-emirate">{config.emirateLabel}</label>
                  <select id="ubd-emirate" name="emirate" autoComplete="off" required={config.emirateRequired}>
                    <option value="">{config.emiratePlaceholder}</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Not Sure">Not Sure</option>
                  </select>
                  <small style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {config.emirateHelper}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="ubd-activity">Business Activity *</label>
                  <input type="text" id="ubd-activity" name="activity" placeholder="e.g., Trading, IT Services" autoComplete="organization" required />
                </div>

                <div className="form-group">
                  <label htmlFor="ubd-nationality">Nationality *</label>
                  <input type="text" id="ubd-nationality" name="nationality" placeholder="e.g., Indian, British, Emirati" autoComplete="country" list="nationality-list" required />
                  <datalist id="nationality-list">
                    <option value="Indian"></option>
                    <option value="British"></option>
                    <option value="Emirati"></option>
                    <option value="Pakistani"></option>
                    <option value="Bangladeshi"></option>
                    <option value="Filipino"></option>
                    <option value="Egyptian"></option>
                    <option value="Lebanese"></option>
                    <option value="Jordanian"></option>
                    <option value="American"></option>
                    <option value="Canadian"></option>
                    <option value="Australian"></option>
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

                <div className="form-section-divider">
                  <span className="form-section-title">Service Information</span>
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

                <div className="form-conditional ubd-form-full-width" id="bankOnlyFields" style={{ display: 'none' }}>
                  <div className="form-group">
                    <label htmlFor="ubd-company-jurisdiction-only">Company Jurisdiction *</label>
                    <select id="ubd-company-jurisdiction-only" name="companyJurisdiction" autoComplete="off">
                      <option value="">Select</option>
                      <option value="mainland">Mainland</option>
                      <option value="freezone">Free Zone</option>
                      <option value="offshore">Offshore</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ubd-company-status-only">Company Status *</label>
                    <select id="ubd-company-status-only" name="companyStatus" autoComplete="off">
                      <option value="">Select</option>
                      <option value="newly-incorporated">Newly incorporated</option>
                      <option value="operating">Operating company</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ubd-turnover-only">Expected Monthly Turnover</label>
                    <select id="ubd-turnover-only" name="turnover" autoComplete="off">
                      <option value="">Select</option>
                      <option value="UNDER_100K">Under 100,000</option>
                      <option value="100K_500K">100,000 – 500,000</option>
                      <option value="500K_2M">500,000 – 2,000,000</option>
                      <option value="OVER_2M">Over 2,000,000</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ubd-existing-account-only">Any existing UAE bank account?</label>
                    <select id="ubd-existing-account-only" name="existingAccount" autoComplete="off">
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
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
                      <span className="privacy-checkbox-text">I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *</span>
                    </label>
                  </div>

                  <button type="submit" className="submit-button" aria-label="Submit consultation form">
                    <span className="button-text">{config.submitText}</span>
                    <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
            <p className="form-disclaimer">Approvals and timelines depend on third parties. We provide documentation and facilitation support.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
