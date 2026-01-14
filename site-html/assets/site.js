// UAE Business Desk - Mobile Navigation Toggle

// Callback Request Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const callbackModal = document.getElementById('callbackModal');
    const requestCallbackBtn = document.getElementById('requestCallbackBtn');
    const callbackModalClose = document.getElementById('callbackModalClose');
    const callbackCancelBtn = document.getElementById('callbackCancelBtn');
    const callbackForm = document.getElementById('callbackForm');
    const callbackMessage = document.getElementById('callbackMessage');
    const callbackSubmitBtn = document.getElementById('callbackSubmitBtn');

    // Open modal
    if (requestCallbackBtn) {
        requestCallbackBtn.addEventListener('click', function() {
            if (callbackModal) {
                callbackModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Close modal functions
    function closeModal() {
        if (callbackModal) {
            callbackModal.style.display = 'none';
            document.body.style.overflow = '';
            callbackForm.reset();
            callbackMessage.style.display = 'none';
            callbackMessage.className = '';
        }
    }

    if (callbackModalClose) {
        callbackModalClose.addEventListener('click', closeModal);
    }

    if (callbackCancelBtn) {
        callbackCancelBtn.addEventListener('click', closeModal);
    }

    // Close on overlay click
    if (callbackModal) {
        const overlay = callbackModal.querySelector('.callback-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && callbackModal && callbackModal.style.display !== 'none') {
            closeModal();
        }
    });

    // Handle form submission
    if (callbackForm) {
        callbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('callbackPhone').value.trim();
            const name = document.getElementById('callbackName').value.trim();

            if (!phone) {
                showCallbackMessage('Please enter your mobile number.', 'error');
                return;
            }

            if (!name) {
                showCallbackMessage('Please enter your name.', 'error');
                return;
            }

            // Disable submit button
            callbackSubmitBtn.disabled = true;
            callbackSubmitBtn.textContent = 'Sending...';

            try {
                // Use dedicated callback API endpoint
                const callbackApiUrl = LEAD_API_URL.replace('/api/leads/capture', '/api/callback/request');
                const response = await fetch(callbackApiUrl, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "X-UBD-LEAD-KEY": LEAD_API_KEY
                    },
                    body: JSON.stringify({
                        name: name || null,
                        phone: phone
                    })
                });

                if (response.ok) {
                    showCallbackMessage('Thank you! We\'ll call you back soon.', 'success');
                    callbackForm.reset();
                    setTimeout(() => {
                        closeModal();
                    }, 2000);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Callback API error:', errorData);
                    const errorMsg = errorData.error || errorData.details || 'Something went wrong. Please try again or WhatsApp us.';
                    showCallbackMessage(errorMsg, 'error');
                }
            } catch (error) {
                console.error('Callback request error:', error);
                showCallbackMessage('Unable to send request. Please check your connection and try again, or WhatsApp us for immediate assistance.', 'error');
            } finally {
                callbackSubmitBtn.disabled = false;
                callbackSubmitBtn.textContent = 'Send Request';
            }
        });
    }

    function showCallbackMessage(message, type) {
        callbackMessage.textContent = message;
        callbackMessage.className = type;
        callbackMessage.style.display = 'block';
    }
});

// Lead Capture API Configuration
const LEAD_API_KEY = "cfd09a32e8a42dac3a34f8231f5e868d23f83c14408ed58ff918ef008eed9c03";
// Use the same hostname as the current page for API calls (works on both desktop and mobile)
const getApiUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol; // http: or https:
    
    // Check if opened as file:// (local file)
    if (protocol === 'file:' || !hostname) {
        console.warn('Website opened as local file. API calls will not work. Please serve via HTTP server.');
        // Return a placeholder URL that will fail gracefully
        return 'http://localhost:3001/api/leads/capture';
    }
    
    // Always use localhost:3001 for local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return `http://localhost:3001/api/leads/capture`;
    } 
    // For production domains (uaebusinessdesk.com), use the same domain with API path
    else if (hostname.includes('uaebusinessdesk.com')) {
        // Use HTTPS for production
        return `https://${hostname}/api/leads/capture`;
    } 
    // For other production domains, use the same domain
    else {
        const apiProtocol = protocol === 'https:' ? 'https:' : 'http:';
        return `${apiProtocol}//${hostname}/api/leads/capture`;
    }
};
const LEAD_API_URL = getApiUrl();

// Log API configuration for debugging
console.log('API Configuration:', {
    url: LEAD_API_URL,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    fullUrl: window.location.href
});

document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;

    if (navToggle && navLinks) {
        // Toggle menu on button click
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });

        // Handle dropdown toggles on mobile
        const dropdownToggles = navLinks.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = toggle.closest('.has-dropdown');
                if (parent) {
                    parent.classList.toggle('dropdown-open');
                    const isExpanded = parent.classList.contains('dropdown-open');
                    toggle.setAttribute('aria-expanded', isExpanded);
                }
            });
        });

        // Close menu when any actual nav link (not dropdown toggle) is clicked
        const links = navLinks.querySelectorAll('a:not(.dropdown-toggle)');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                body.classList.remove('nav-open');
                // Close all dropdowns when menu closes
                const dropdowns = navLinks.querySelectorAll('.has-dropdown');
                dropdowns.forEach(function (dropdown) {
                    dropdown.classList.remove('dropdown-open');
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        });
    }

    // Consultation Form Conditional Logic Handler
    function initConsultationForm() {
        // Find the form by section ID or form class
        const formSection = document.getElementById('consultation-form');
        const form = formSection ? formSection.querySelector('.ubd-consultation-form') : document.querySelector('.ubd-consultation-form');

        if (!form) return;

        // Find all required elements by their IDs
        const serviceRequired = document.getElementById('serviceRequired');
        const companyFields = document.getElementById('companyFields');
        const visasRequired = document.getElementById('visasRequired');
        const visaCountWrap = document.getElementById('visaCountWrap');
        const emirateGroup = document.getElementById('emirateGroup');
        const emirateSelect = document.getElementById('ubd-emirate');

        // Get inputs for clearing when sections are hidden
        const visaCountInput = document.getElementById('ubd-visas-count');

        // Remove required attributes from all fields in a section
        function removeRequiredFromSection(section) {
            if (!section) return;
            const fields = section.querySelectorAll('input[required], select[required], textarea[required]');
            fields.forEach(field => {
                field.removeAttribute('required');
            });
        }

        // Add required attributes to specific fields
        function setRequiredFields(fieldIds, required) {
            fieldIds.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    if (required) {
                        field.setAttribute('required', 'required');
                    } else {
                        field.removeAttribute('required');
                    }
                }
            });
        }

        // Toggle service-based fields
        function toggleServiceFields() {
            if (!serviceRequired) return;

            const serviceValue = serviceRequired.value;

            // Remove required from all conditional sections first (before hiding)
            removeRequiredFromSection(companyFields);

            // Hide all conditional sections first
            if (companyFields) {
                companyFields.style.display = 'none';
                companyFields.classList.remove('form-conditional-visible');
            }
            if (visaCountWrap) visaCountWrap.style.display = 'none';
            if (emirateGroup) emirateGroup.style.display = 'none';
            if (emirateSelect) {
                emirateSelect.removeAttribute('required');
                emirateSelect.value = '';
            }

            // If serviceRequired is mainland/freezone/offshore
            if (serviceValue === 'mainland' || serviceValue === 'freezone' || serviceValue === 'offshore') {
                // Show companyFields (no required fields in companyFields - all optional)
                if (companyFields) {
                    companyFields.style.display = 'grid';
                    companyFields.classList.add('form-conditional-visible');
                }
                // Show emirate selector
                if (emirateGroup) {
                    emirateGroup.style.display = 'block';
                    if (emirateSelect) {
                        emirateSelect.setAttribute('required', 'required');
                    }
                }
            }
            // Empty or unknown service - all hidden (already done above)
        }



        // Toggle visa count field
        function toggleVisaCount() {
            if (!visasRequired || !visaCountWrap) return;

            if (visasRequired.value === 'yes') {
                visaCountWrap.style.display = 'block';
            } else {
                visaCountWrap.style.display = 'none';
                // Clear visa count input when hidden
                if (visaCountInput) visaCountInput.value = '';
            }
        }


        // Initialize on page load
        toggleServiceFields();
        toggleVisaCount();

        // Add event listeners
        if (serviceRequired) {
            serviceRequired.addEventListener('change', toggleServiceFields);
        }
        if (visasRequired) {
            visasRequired.addEventListener('change', toggleVisaCount);
        }

        // Bank Account Prescreen conditional field handlers
        const uaeSetupType = document.getElementById('ubd-uae-setup-type');
        const primaryActivityCategory = document.getElementById('ubd-primary-activity-category');
        const primaryActivityDetailsGroup = document.getElementById('primaryActivityDetailsGroup');
        const primaryActivityDetails = document.getElementById('ubd-primary-activity-details');
        const paymentGeographiesCheckboxes = document.querySelectorAll('input[name="paymentGeographies"]');
        const paymentGeographiesOtherGroup = document.getElementById('paymentGeographiesOtherGroup');
        const paymentGeographiesOther = document.getElementById('ubd-payment-geographies-other');

        // Toggle primary activity details field
        function togglePrimaryActivityDetails() {
            if (!primaryActivityCategory || !primaryActivityDetailsGroup || !primaryActivityDetails) return;
            const category = primaryActivityCategory.value;
            if (category === 'TRADING_SPECIFIC_GOODS' || category === 'OTHER') {
                primaryActivityDetailsGroup.style.display = 'block';
                primaryActivityDetails.setAttribute('required', 'required');
            } else {
                primaryActivityDetailsGroup.style.display = 'none';
                primaryActivityDetails.removeAttribute('required');
                primaryActivityDetails.value = '';
            }
        }

        // Toggle payment geographies other field
        function togglePaymentGeographiesOther() {
            if (!paymentGeographiesOtherGroup || !paymentGeographiesOther) return;
            const hasOther = Array.from(paymentGeographiesCheckboxes).some(cb => cb.value === 'OTHER' && cb.checked);
            if (hasOther) {
                paymentGeographiesOtherGroup.style.display = 'block';
                paymentGeographiesOther.setAttribute('required', 'required');
            } else {
                paymentGeographiesOtherGroup.style.display = 'none';
                paymentGeographiesOther.removeAttribute('required');
                paymentGeographiesOther.value = '';
            }
        }

        // Initialize bank prescreen fields
        if (primaryActivityCategory) {
            togglePrimaryActivityDetails();
            primaryActivityCategory.addEventListener('change', togglePrimaryActivityDetails);
        }
        if (paymentGeographiesCheckboxes.length > 0) {
            togglePaymentGeographiesOther();
            paymentGeographiesCheckboxes.forEach(cb => {
                cb.addEventListener('change', function() {
                    togglePaymentGeographiesOther();
                    // Update parent label class for checked state styling (browser compatibility)
                    const parentLabel = this.closest('.payment-geography-option');
                    if (parentLabel) {
                        if (this.checked) {
                            parentLabel.classList.add('checked');
                        } else {
                            parentLabel.classList.remove('checked');
                        }
                    }
                });
                // Initialize checked state on page load
                const parentLabel = cb.closest('.payment-geography-option');
                if (parentLabel && cb.checked) {
                    parentLabel.classList.add('checked');
                }
            });
        }

        // Phone normalization and validation utilities
        // E.164 phone validation regex: must start with +, then 8-15 digits
        const E164_REGEX = /^\+[1-9]\d{7,14}$/;
        
        /**
         * Normalize phone number
         * - Trims whitespace
         * - Removes internal spaces
         * - Converts "00" prefix to "+"
         */
        function normalizePhone(input) {
            // Trim whitespace
            let normalized = input.trim();
            
            // Remove internal spaces
            normalized = normalized.replace(/\s+/g, '');
            
            // If starts with "00", replace with "+"
            if (normalized.startsWith('00')) {
                normalized = '+' + normalized.substring(2);
            }
            
            return normalized;
        }
        
        /**
         * Validate E.164 phone format
         */
        function isValidE164(phone) {
            return E164_REGEX.test(phone.trim());
        }
        
        // Restrict WhatsApp field to only + and numbers
        const whatsappInput = document.getElementById('ubd-whatsapp');
        if (whatsappInput) {
            whatsappInput.addEventListener('input', function (e) {
                // Remove any characters that are not + or digits
                let cleaned = this.value.replace(/[^+\d]/g, '');
                
                // Normalize: trim spaces and replace leading "00" with "+"
                const normalized = normalizePhone(cleaned);
                
                // Set normalized value back into input
                this.value = normalized;
                
                // Clear error on input (no validation while typing)
                this.style.borderColor = '';
                const errorMsg = this.parentNode.querySelector('.phone-error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });

            // Prevent paste of invalid characters
            whatsappInput.addEventListener('paste', function (e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const cleanedText = pastedText.replace(/[^+\d]/g, '');
                
                // Normalize: trim spaces and replace leading "00" with "+"
                const normalized = normalizePhone(cleanedText);
                this.value = normalized;
                
                // Clear error on paste
                this.style.borderColor = '';
                const errorMsg = this.parentNode.querySelector('.phone-error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });

            // Validate and normalize on blur (when user leaves the field)
            whatsappInput.addEventListener('blur', function (e) {
                const phoneValue = this.value;
                
                // Normalize the phone number
                const normalized = normalizePhone(phoneValue);
                
                // Set normalized value back into input
                this.value = normalized;
                
                // Validate normalized value
                if (normalized && !isValidE164(normalized)) {
                    this.style.borderColor = '#ef4444';
                    // Show inline error message
                    let errorMsg = this.parentNode.querySelector('.phone-error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('span');
                        errorMsg.className = 'phone-error-message';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 4px; display: block;';
                        this.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = 'Please enter phone with country code, e.g. +97150xxxxxxx';
                } else {
                    this.style.borderColor = '';
                    // Remove error message
                    const errorMsg = this.parentNode.querySelector('.phone-error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        }

        // Real-time email validation
        const emailInput = document.getElementById('ubd-email');
        if (emailInput) {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            emailInput.addEventListener('blur', function (e) {
                const emailValue = this.value.trim();
                if (emailValue && !emailPattern.test(emailValue)) {
                    this.style.borderColor = '#ef4444';
                    // Show error message
                    let errorMsg = this.parentNode.querySelector('.email-error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('span');
                        errorMsg.className = 'email-error-message';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 4px; display: block;';
                        errorMsg.textContent = 'Please enter a valid email address';
                        this.parentNode.appendChild(errorMsg);
                    }
                } else {
                    this.style.borderColor = '';
                    // Remove error message
                    const errorMsg = this.parentNode.querySelector('.email-error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });

            emailInput.addEventListener('input', function (e) {
                const emailValue = this.value.trim();
                // If field is empty, clear error
                if (!emailValue) {
                    this.style.borderColor = '';
                    const errorMsg = this.parentNode.querySelector('.email-error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                } else if (emailPattern.test(emailValue)) {
                    // Valid email - clear error
                    this.style.borderColor = '';
                    const errorMsg = this.parentNode.querySelector('.email-error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        }

        // Form submission handler
        const submitButton = form.querySelector('button[type="submit"]');
        let isSubmitting = false;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Prevent double submission
            if (isSubmitting) return;

            // Get all required fields
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            // Validate required fields
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '';
                }
            });

            // Validate WhatsApp field (E.164 format required)
            const whatsappField = form.querySelector('#ubd-whatsapp');
            if (whatsappField && whatsappField.value.trim()) {
                // Normalize the phone number
                const normalized = normalizePhone(whatsappField.value);
                
                // Set normalized value back into input
                whatsappField.value = normalized;
                
                // Validate normalized value
                if (!isValidE164(normalized)) {
                    isValid = false;
                    whatsappField.style.borderColor = '#ef4444';
                    // Show inline error if not already shown
                    let errorMsg = whatsappField.parentNode.querySelector('.phone-error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('span');
                        errorMsg.className = 'phone-error-message';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 4px; display: block;';
                        whatsappField.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = 'Please enter phone with country code, e.g. +97150xxxxxxx';
                } else {
                    whatsappField.style.borderColor = '';
                    // Remove error message
                    const errorMsg = whatsappField.parentNode.querySelector('.phone-error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            }

            // Validate email field (if provided)
            const emailField = form.querySelector('#ubd-email');
            if (emailField && emailField.value.trim()) {
                const emailValue = emailField.value.trim();
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailPattern.test(emailValue)) {
                    isValid = false;
                    emailField.style.borderColor = '#ef4444';
                } else {
                    emailField.style.borderColor = '';
                }
            }

            if (!isValid) {
                // Show validation error
                showFormMessage('error', 'Please fill in all required fields correctly.');
                return;
            }
            
            // Honeypot check - only for contact form (enquiry form)
            // Check if this is a contact form by looking for the contact-form class
            if (form.classList.contains('contact-form')) {
                const honeypotField = form.querySelector('input[name="website"]');
                if (honeypotField && honeypotField.value.trim() !== '') {
                    console.warn('Honeypot field filled - potential bot');
                    showFormMessage('error', 'Invalid submission detected.');
                    return;
                }
            }
            
            // Privacy policy checkbox check
            const privacyCheckbox = form.querySelector('input[name="privacyAccepted"]');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                showFormMessage('error', 'Please accept the Privacy Policy to continue.');
                privacyCheckbox.focus();
                return;
            }

            // Disable submit button and show loading state
            isSubmitting = true;
            const buttonText = submitButton.querySelector('.button-text');
            const originalButtonText = buttonText ? buttonText.textContent : submitButton.textContent;
            submitButton.disabled = true;
            if (buttonText) {
                buttonText.textContent = 'Submitting…';
            } else {
                submitButton.textContent = 'Submitting…';
            }

            // Remove existing messages
            removeFormMessages();

            try {
                // Build JSON payload from form data
                const formData = new FormData(form);
                const serviceValue = formData.get('helpWith');

                const payload = {
                    fullName: formData.get('fullName')?.trim() || '',
                    whatsapp: formData.get('whatsapp')?.trim() || '',
                    serviceRequired: (serviceValue || '').toLowerCase(),
                    nationality: formData.get('nationality')?.trim() || null,
                    residenceCountry: formData.get('residence')?.trim() || null,
                    emirate: formData.get('emirate')?.trim() || null,
                    notes: formData.get('notes')?.trim() || null,
                };

                // Add email only if provided
                const emailValue = formData.get('email')?.trim();
                if (emailValue) {
                    payload.email = emailValue;
                }

                // Handle bank account prescreen data
                if (serviceValue === 'bank' || serviceValue === 'existing-company') {
                    // Collect prescreen fields
                    const prescreenData = {
                        uaeSetupType: formData.get('uaeSetupType') || null,
                        primaryActivityCategory: formData.get('primaryActivityCategory') || null,
                        ownerUaeResident: formData.get('ownerUaeResident') || null,
                        uboNationality: formData.get('uboNationality') || null,
                        expectedMonthlyTurnoverAed: formData.get('expectedMonthlyTurnoverAed') || null,
                        involvesCrypto: formData.get('involvesCrypto') || null,
                        cashIntensive: formData.get('cashIntensive') || null,
                        sanctionedHighRiskCountries: formData.get('sanctionedHighRiskCountries') || null,
                        kycDocsReady: formData.get('kycDocsReady') || null,
                    };

                    const primaryActivityCategory = prescreenData.primaryActivityCategory;
                    if (primaryActivityCategory === 'TRADING_SPECIFIC_GOODS' || primaryActivityCategory === 'OTHER') {
                        prescreenData.primaryActivityDetails = formData.get('primaryActivityDetails')?.trim() || null;
                    }

                    // Payment geographies (multi-select)
                    const paymentGeographies = formData.getAll('paymentGeographies');
                    if (paymentGeographies.length > 0) {
                        prescreenData.paymentGeographies = paymentGeographies;
                        if (paymentGeographies.includes('OTHER')) {
                            prescreenData.paymentGeographiesOther = formData.get('paymentGeographiesOther')?.trim() || null;
                        }
                    }

                    // Store in serviceDetails
                    payload.serviceDetails = {
                        bankAccountPrescreen: prescreenData
                    };
                } else {
                    // Company setup fields (mainland/freezone/offshore)
                    const activityValue = formData.get('activity')?.trim();
                    if (activityValue) {
                        payload.activity = activityValue;
                    }

                    const timelineValue = formData.get('timeline')?.trim();
                    if (timelineValue) {
                        payload.timeline = timelineValue;
                    }

                    // Add company setup fields if relevant
                    if (serviceValue === 'mainland' || serviceValue === 'freezone' || serviceValue === 'offshore') {
                        const shareholdersValue = formData.get('shareholders');
                        if (shareholdersValue) {
                            payload.shareholdersCount = shareholdersValue;
                        }

                        const visasRequiredValue = formData.get('visasRequired');
                        if (visasRequiredValue) {
                            payload.visasRequired = visasRequiredValue === 'yes' ? 'yes' : 'no';
                        }

                        const visasCountValue = formData.get('visasCount');
                        if (visasCountValue && visasRequiredValue === 'yes') {
                            payload.visasCount = visasCountValue;
                        }
                    }

                    // Add bank fields if relevant (for bank account setup service only)
                    if (serviceValue === 'bank' || serviceValue === 'existing-company') {
                        const turnoverValue = formData.get('turnover') || formData.get('turnoverLater');
                        if (turnoverValue) {
                            payload.monthlyTurnover = turnoverValue;
                        }

                        const existingAccountValue = formData.get('existingAccount') || formData.get('existingAccountLater');
                        if (existingAccountValue) {
                            payload.existingUaeBankAccount = existingAccountValue === 'yes' ? 'yes' : 'no';
                        }
                    }
                }

                // Remove null/undefined values
                Object.keys(payload).forEach(key => {
                    if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
                        delete payload[key];
                    }
                });

                // Log payload before submission
                console.log("Submitting to API", payload);

                // POST to API
                let response;
                try {
                    console.log('Attempting to connect to:', LEAD_API_URL);
                    console.log('Current hostname:', window.location.hostname);
                    console.log('Current protocol:', window.location.protocol);
                    
                    // Add timeout to fetch request
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                    
                    response = await fetch(LEAD_API_URL, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "X-UBD-LEAD-KEY": LEAD_API_KEY
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                } catch (networkError) {
                    // Network error - server unreachable
                    console.error('Network error:', networkError);
                    console.error('API URL attempted:', LEAD_API_URL);
                    console.error('Error name:', networkError.name);
                    console.error('Error message:', networkError.message);
                    
                    // Provide more helpful error message
                    let errorMsg = 'Unable to connect to server. ';
                    
                    if (networkError.name === 'AbortError') {
                        errorMsg += 'The request timed out. ';
                    } else if (networkError.name === 'TypeError' && networkError.message.includes('Failed to fetch')) {
                        // Check if it's a CORS error
                        if (networkError.message.includes('CORS') || networkError.message.includes('cross-origin')) {
                            errorMsg += 'CORS error detected. Please contact support. ';
                        } else {
                            errorMsg += 'Please check your internet connection. ';
                        }
                    } else if (networkError.name === 'NetworkError' || networkError.name === 'Network request failed') {
                        errorMsg += 'Network request failed. ';
                    }
                    
                    errorMsg += 'Please contact us via WhatsApp for immediate assistance.';
                    
                    // Show error with WhatsApp link
                    const whatsappLink = `https://wa.me/971504209110?text=${encodeURIComponent('I encountered an error submitting the form. Please help.')}`;
                    showFormMessage('error', errorMsg + `<br><br><a href="${whatsappLink}" target="_blank" style="color: #c9a14a; text-decoration: underline;">Contact us via WhatsApp</a>`);
                    return;
                }

                // Read response body safely
                let data = {};
                let responseText = '';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        responseText = await response.text();
                        try {
                            data = JSON.parse(responseText);
                        } catch (e) {
                            // Not JSON
                        }
                    }
                } catch (parseError) {
                    // Failed to read response
                    console.error('Failed to read response:', parseError);
                    if (responseText) {
                        data = { error: responseText };
                    } else {
                        data = { error: 'Failed to read server response' };
                    }
                }

                if (response.ok && (data.ok === true || data.success === true)) {
                    // Success
                    showFormMessage('success', `Thank you — we received your request. Reference: ${data.leadRef || 'N/A'}. We will contact you shortly.`);

                    // Reset form
                    form.reset();
                    toggleServiceFields();
                    toggleVisaCount();
                    // toggleBankLaterFields() is called within toggleServiceFields() when needed
                    // toggleBankFields() is called within toggleServiceFields() when needed
                } else {
                    // Error response
                    console.error('API Error - Status:', response.status, 'Response:', data);
                    
                    let errorMessage = data.error || 'Failed to submit request';
                    
                    // Handle specific error codes
                    if (response.status === 401) {
                        errorMessage = 'Authentication failed. Please refresh the page and try again.';
                    } else if (response.status === 403) {
                        errorMessage = 'Access denied. Please contact support.';
                    } else if (response.status === 404) {
                        errorMessage = 'API endpoint not found. Please contact support.';
                    } else if (response.status === 500) {
                        errorMessage = 'Server error. Please try again later or contact support.';
                    } else if (response.status === 0) {
                        // CORS or network error
                        errorMessage = 'Unable to connect to server. This may be a CORS or network issue. Please contact support.';
                    }
                    
                    // Display field errors inline if provided
                    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
                        Object.keys(data.fieldErrors).forEach(fieldName => {
                            const field = form.querySelector(`[name="${fieldName}"], #ubd-${fieldName}`);
                            if (field) {
                                field.style.borderColor = '#ef4444';
                                // Show inline error message
                                let errorMsg = field.parentNode.querySelector('.field-error-message');
                                if (!errorMsg) {
                                    errorMsg = document.createElement('span');
                                    errorMsg.className = 'field-error-message';
                                    errorMsg.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 4px; display: block;';
                                    field.parentNode.appendChild(errorMsg);
                                }
                                errorMsg.textContent = data.fieldErrors[fieldName];
                            }
                        });
                    }
                    
                    // Show general error message with WhatsApp link for critical errors
                    if (response.status === 0 || response.status >= 500) {
                        const whatsappLink = `https://wa.me/971504209110?text=${encodeURIComponent('I encountered an error submitting the form. Please help.')}`;
                        showFormMessage('error', errorMessage + `<br><br><a href="${whatsappLink}" target="_blank" style="color: #c9a14a; text-decoration: underline;">Contact us via WhatsApp</a>`);
                    } else {
                        showFormMessage('error', errorMessage);
                    }
                }
            } catch (error) {
                // Only show generic message for unexpected errors (network already handled above)
                console.error('Form submission error:', error);
                showFormMessage('error', 'Something went wrong. Please contact us via WhatsApp for immediate assistance.');
            } finally {
                // Re-enable submit button
                isSubmitting = false;
                submitButton.disabled = false;
                const buttonText = submitButton.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = originalButtonText;
                } else {
                    submitButton.textContent = originalButtonText;
                }
            }
        });

        // Helper function to show form messages
        function showFormMessage(type, message) {
            // Remove existing messages
            removeFormMessages();

            const messageDiv = document.createElement('div');
            messageDiv.className = `form-${type}-message`;

            if (type === 'success') {
                messageDiv.style.cssText = 'background-color: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.95rem; width: 100%; max-width: 100%; box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word;';
            } else {
                messageDiv.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem; width: 100%; max-width: 100%; box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word;';
            }

            messageDiv.textContent = message;

            // Insert message after submit button's parent (form-group) within the grid
            const submitButtonGroup = submitButton.closest('.form-group');
            if (submitButtonGroup && submitButtonGroup.parentNode) {
                // Ensure message is part of the grid and spans full width
                messageDiv.style.gridColumn = '1 / -1';
                submitButtonGroup.parentNode.insertBefore(messageDiv, submitButtonGroup.nextSibling);
            } else {
                // Fallback: insert after form
                form.parentNode.insertBefore(messageDiv, form.nextSibling);
            }

            // No scroll - message appears right after submit button, already visible
        }

        // Helper function to remove form messages
        function removeFormMessages() {
            const existingMessages = form.parentNode.querySelectorAll('.form-success-message, .form-error-message');
            existingMessages.forEach(msg => msg.remove());
        }
    }

    // Generate WhatsApp message from form data
    function generateWhatsAppMessage(formData) {
        let message = 'Hello! I would like to request a consultation:\n\n';

        // Universal fields
        message += `*Full Name:* ${formData.get('fullName') || 'N/A'}\n`;
        message += `*WhatsApp:* ${formData.get('whatsapp') || 'N/A'}\n`;
        if (formData.get('email')) {
            message += `*Email:* ${formData.get('email')}\n`;
        }

        const helpWith = formData.get('helpWith');
        const helpWithLabels = {
            'mainland': 'Mainland Company Setup',
            'freezone': 'Free Zone Company Setup',
            'offshore': 'Offshore Company Setup',
            'bank': 'Bank Account Setup'
        };
        message += `*Service Needed:* ${helpWithLabels[helpWith] || helpWith || 'N/A'}\n`;

        if (formData.get('activity')) {
            message += `*Business Activity:* ${formData.get('activity')}\n`;
        }
        if (formData.get('nationality')) {
            message += `*Nationality:* ${formData.get('nationality')}\n`;
        }
        if (formData.get('residence')) {
            message += `*Country of Residence:* ${formData.get('residence')}\n`;
        }
        if (formData.get('timeline')) {
            const timelineLabels = {
                'immediately': 'Immediately',
                'within-1-month': 'Within 1 month',
                '1-3-months': '1–3 months',
                'exploring': 'Exploring'
            };
            message += `*Timeline:* ${timelineLabels[formData.get('timeline')] || formData.get('timeline')}\n`;
        }

        // Company setup fields
        if (helpWith === 'mainland' || helpWith === 'freezone' || helpWith === 'offshore') {
            message += '\n*Company Setup Details:*\n';
            if (formData.get('shareholders')) {
                message += `- Shareholders: ${formData.get('shareholders')}\n`;
            }
            if (formData.get('visasRequired')) {
                message += `- Visas Required: ${formData.get('visasRequired') === 'yes' ? 'Yes' : 'No'}\n`;
                if (formData.get('visasRequired') === 'yes' && formData.get('visasCount')) {
                    message += `- Number of Visas: ${formData.get('visasCount')}\n`;
                }
            }
        }

        // Bank setup fields
        if (helpWith === 'bank') {
            message += '\n*Bank Account Setup Details:*\n';
            if (formData.get('hasCompany')) {
                message += `- Has UAE Company: ${formData.get('hasCompany') === 'yes' ? 'Yes' : 'No'}\n`;
                if (formData.get('hasCompany') === 'yes') {
                    if (formData.get('companyJurisdiction')) {
                        const jurisdictionLabels = {
                            'mainland': 'Mainland',
                            'freezone': 'Free Zone',
                            'offshore': 'Offshore'
                        };
                        message += `- Company Jurisdiction: ${jurisdictionLabels[formData.get('companyJurisdiction')] || formData.get('companyJurisdiction')}\n`;
                    }
                    if (formData.get('companyStatus')) {
                        const statusLabels = {
                            'newly-incorporated': 'Newly incorporated',
                            'operating': 'Operating company'
                        };
                        message += `- Company Status: ${statusLabels[formData.get('companyStatus')] || formData.get('companyStatus')}\n`;
                    }
                }
            }
            if (formData.get('turnover')) {
                const turnoverLabels = {
                    'UNDER_100K': 'Under 100,000',
                    '100K_500K': '100,000 – 500,000',
                    '500K_2M': '500,000 – 2,000,000',
                    'OVER_2M': 'Over 2,000,000'
                };
                message += `- Expected Monthly Turnover: ${turnoverLabels[formData.get('turnover')] || formData.get('turnover')}\n`;
            }
            if (formData.get('existingAccount')) {
                message += `- Existing UAE Bank Account: ${formData.get('existingAccount') === 'yes' ? 'Yes' : 'No'}\n`;
            }
        }

        if (formData.get('notes')) {
            message += `\n*Additional Notes:*\n${formData.get('notes')}\n`;
        }

        return message;
    }

    // Initialize consultation form conditional logic
    initConsultationForm();

    // Legacy form handlers (for other forms that may exist)
    function handleFormSubmit(form, formType) {
        if (form.classList.contains('ubd-consultation-form')) {
            return; // Already handled by initUBDConsultationForm
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get all required fields
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            // Validate required fields
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '';
                }

                // Email validation
                if (field.type === 'email' && field.value.trim() && !field.value.includes('@')) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                }
            });

            if (!isValid) {
                // Show validation error
                const errorMsg = document.createElement('div');
                errorMsg.className = 'form-error-message';
                errorMsg.textContent = 'Please fill in all required fields correctly.';
                errorMsg.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem;';

                // Remove existing error message if any
                const existingError = form.parentNode.querySelector('.form-error-message');
                if (existingError) {
                    existingError.remove();
                }

                // Remove existing success message if any
                const existingSuccess = form.parentNode.querySelector('.form-success-message');
                if (existingSuccess) {
                    existingSuccess.remove();
                }

                // Insert error message after form
                form.parentNode.insertBefore(errorMsg, form.nextSibling);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.remove();
                    }
                }, 5000);
                return;
            }

            // Honeypot check - only for contact form (enquiry form)
            if (form.classList.contains('contact-form')) {
                const honeypotField = form.querySelector('input[name="website"]');
                if (honeypotField && honeypotField.value.trim() !== '') {
                    console.warn('Honeypot field filled - potential bot');
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'form-error-message';
                    errorMsg.textContent = 'Invalid submission detected.';
                    errorMsg.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem;';
                    form.parentNode.insertBefore(errorMsg, form.nextSibling);
                    return;
                }
                
                // Math captcha validation
                const captchaAnswer = form.querySelector('#captchaAnswer');
                const captchaCorrectAnswer = form.querySelector('#captchaCorrectAnswer');
                if (captchaAnswer && captchaCorrectAnswer) {
                    const userAnswer = parseInt(captchaAnswer.value);
                    const correctAnswer = parseInt(captchaCorrectAnswer.value);
                    if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'form-error-message';
                        errorMsg.textContent = 'Incorrect security check answer. Please try again.';
                        errorMsg.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem;';
                        form.parentNode.insertBefore(errorMsg, form.nextSibling);
                        // Generate new captcha
                        initMathCaptcha();
                        captchaAnswer.value = '';
                        captchaAnswer.focus();
                        return;
                    }
                }
            }
            
            // Privacy policy checkbox check
            const privacyCheckbox = form.querySelector('input[name="privacyAccepted"]');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'form-error-message';
                errorMsg.textContent = 'Please accept the Privacy Policy to continue.';
                errorMsg.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem;';
                form.parentNode.insertBefore(errorMsg, form.nextSibling);
                privacyCheckbox.focus();
                return;
            }
            
            // Disable submit button and show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            let originalButtonText = '';
            if (submitButton) {
                submitButton.disabled = true;
                const buttonText = submitButton.querySelector('.button-text');
                originalButtonText = buttonText ? buttonText.textContent : submitButton.textContent;
                if (buttonText) {
                    buttonText.textContent = 'Sending...';
                } else {
                    submitButton.textContent = 'Sending...';
                }
            }

            // Remove existing messages
            const existingError = form.parentNode.querySelector('.form-error-message');
            if (existingError) existingError.remove();
            const existingSuccess = form.parentNode.querySelector('.form-success-message');
            if (existingSuccess) existingSuccess.remove();

            try {
                // Build JSON payload from form data
                const formData = new FormData(form);
                
                // For contact form, map fields to API payload
                const payload = {
                    fullName: formData.get('name')?.trim() || '',
                    email: formData.get('email')?.trim() || '',
                    whatsapp: formData.get('whatsapp')?.trim() || '',
                    serviceRequired: 'not-sure', // Contact form is general enquiry
                    notes: formData.get('message')?.trim() || '',
                };

                // Send to API
                const response = await fetch(LEAD_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-UBD-LEAD-KEY': LEAD_API_KEY
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `Server error: ${response.status}`);
                }

                // Success - show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success-message';
                successMsg.innerHTML = '<strong>Thank you!</strong> We\'ve received your enquiry and will contact you within 1 business day.';
                successMsg.style.cssText = 'background-color: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.95rem;';

                // Insert success message before form
                form.parentNode.insertBefore(successMsg, form);

                // Hide form
                form.style.display = 'none';

                // Reset form
                form.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'form-error-message';
                errorMsg.textContent = 'Sorry, there was an error submitting your enquiry. Please try again or contact us directly.';
                errorMsg.style.cssText = 'background-color: #ef4444; color: white; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; text-align: center; font-size: 0.9rem;';

                // Insert error message after form
                form.parentNode.insertBefore(errorMsg, form.nextSibling);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.remove();
                    }
                }, 5000);
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    const buttonText = submitButton.querySelector('.button-text');
                    if (buttonText) {
                        buttonText.textContent = originalButtonText || 'Send Your Enquiry';
                    } else {
                        submitButton.textContent = originalButtonText || 'Send Your Enquiry';
                    }
                }
            }
        });
    }

    // Handle other forms (if any)
    const quoteForm = document.getElementById('quote-form');
    const contactForm = document.querySelector('.contact-form');

    if (quoteForm) {
        handleFormSubmit(quoteForm, 'quote');
    }

    if (contactForm) {
        handleFormSubmit(contactForm, 'contact');
    }

    // Smooth scroll for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Cookie Consent Management
    function initCookieConsent() {
        const cookieConsent = document.getElementById('cookieConsent');
        if (!cookieConsent) return;
        
        // Check if user has already made a choice
        const cookieChoice = localStorage.getItem('cookieConsent');
        
        if (!cookieChoice) {
            // Show banner after a short delay
            setTimeout(() => {
                cookieConsent.classList.add('show');
            }, 1000);
        }
    }
    
    // Accept cookies
    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'accepted');
        const cookieConsent = document.getElementById('cookieConsent');
        if (cookieConsent) {
            cookieConsent.classList.remove('show');
        }
    };
    
    // Decline cookies
    window.declineCookies = function() {
        localStorage.setItem('cookieConsent', 'declined');
        const cookieConsent = document.getElementById('cookieConsent');
        if (cookieConsent) {
            cookieConsent.classList.remove('show');
        }
    };
    
    // Initialize cookie consent
    initCookieConsent();
    
    // Initialize Math Captcha for contact form
    function initMathCaptcha() {
        const captchaQuestion = document.getElementById('captchaQuestion');
        const captchaCorrectAnswer = document.getElementById('captchaCorrectAnswer');
        
        if (captchaQuestion && captchaCorrectAnswer) {
            // Generate two random numbers between 1 and 10
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const answer = num1 + num2;
            
            // Display the question
            captchaQuestion.textContent = `${num1} + ${num2} = ?`;
            
            // Store the correct answer
            captchaCorrectAnswer.value = answer;
        }
    }
    
    // Initialize captcha when page loads
    initMathCaptcha();
    
    // Hero Typed Text Animation
    const heroTypedText = document.getElementById('heroTypedText');
    if (heroTypedText) {
        // Timing values (editable)
        const TYPE_SPEED = 80;
        const DELETE_SPEED = 50;
        const PAUSE_MS = 1800;

        // Service titles to cycle through (will be displayed in uppercase)
        const titles = [
            "Mainland Company Formation",
            "Free Zone Company Formation",
            "Offshore Company Formation",
            "Bank Account Setup Support",
            "Business Setup Guidance"
        ];

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Show first title without animation
            heroTypedText.textContent = titles[0];
        } else {
            let currentTitleIndex = 0;
            let currentCharIndex = 0;
            let isDeleting = false;
            let currentText = '';

            function typeText() {
                const currentTitle = titles[currentTitleIndex];

                if (!isDeleting && currentCharIndex < currentTitle.length) {
                    // Typing
                    currentText = currentTitle.substring(0, currentCharIndex + 1);
                    heroTypedText.textContent = currentText;
                    currentCharIndex++;
                    setTimeout(typeText, TYPE_SPEED);
                } else if (!isDeleting && currentCharIndex === currentTitle.length) {
                    // Pause when completed
                    setTimeout(typeText, PAUSE_MS);
                    isDeleting = true;
                } else if (isDeleting && currentCharIndex > 0) {
                    // Deleting
                    currentText = currentTitle.substring(0, currentCharIndex - 1);
                    heroTypedText.textContent = currentText;
                    currentCharIndex--;
                    setTimeout(typeText, DELETE_SPEED);
                } else {
                    // Move to next title
                    isDeleting = false;
                    currentTitleIndex = (currentTitleIndex + 1) % titles.length;
                    currentCharIndex = 0;
                    heroTypedText.textContent = '';
                    setTimeout(typeText, 100);
                }
            }

            // Start animation
            typeText();
        }
    }

    // WhatsApp Link Handler - Hide number from URL
    const whatsappNumber = '971504209110';
    const whatsappMessage = 'Hi%20UAE%20Business%20Desk,%20I%20would%20like%20to%20send%20an%20enquiry.';
    
    document.addEventListener('click', function(e) {
        const whatsappLink = e.target.closest('a[data-whatsapp]');
        if (whatsappLink) {
            e.preventDefault();
            const message = whatsappLink.getAttribute('data-message') || whatsappMessage;
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
        }
    });

    // Step Details Functionality
    const stepItems = document.querySelectorAll('.step-item');

    if (stepItems.length > 0) {
        stepItems.forEach(item => {
            item.addEventListener('click', function () {
                // Remove active class from all items
                stepItems.forEach(i => i.classList.remove('active'));

                // Add active class to clicked item
                this.classList.add('active');
            });
        });
    }
});

// Image Protection: Prevent copying and dragging
(function() {
    'use strict';
    
    // Prevent right-click context menu on images
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    // Prevent drag and drop on images
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    // Prevent keyboard shortcuts (Ctrl+C, Ctrl+A, etc.) when image is selected
    document.addEventListener('keydown', function(e) {
        // Prevent Ctrl+C (copy), Ctrl+A (select all), Ctrl+S (save), Ctrl+P (print)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                // Check if selection contains an image
                const range = selection.getRangeAt(0);
                const img = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
                    ? range.commonAncestorContainer.querySelector('img')
                    : range.commonAncestorContainer.parentElement?.querySelector('img');
                
                if (img || (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE && range.commonAncestorContainer.tagName === 'IMG')) {
                    e.preventDefault();
                    return false;
                }
            }
        }
        
        // Prevent F12 (Developer Tools) - optional, can be removed if needed
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    // Prevent image selection via mouse
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, false);
    
    // Add draggable="false" attribute to all images
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img');
        images.forEach(function(img) {
            img.setAttribute('draggable', 'false');
            img.style.pointerEvents = 'auto';
        });
    });
    
    // Also handle dynamically added images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG') {
                        node.setAttribute('draggable', 'false');
                        node.style.pointerEvents = 'auto';
                    } else {
                        const images = node.querySelectorAll && node.querySelectorAll('img');
                        if (images) {
                            images.forEach(function(img) {
                                img.setAttribute('draggable', 'false');
                                img.style.pointerEvents = 'auto';
                            });
                        }
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
