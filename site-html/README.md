# UAE Business Desk - Website HTML Files

This directory contains the HTML files for the UAE Business Desk website.

## Files

- **index.html** - Homepage with hero section, services overview, and key information
- **services.html** - Detailed services page with all three service packages
- **process.html** - Step-by-step process page explaining the service delivery
- **contact.html** - Contact page with enquiry form and contact methods
- **styles.css** - Main stylesheet for all pages
- **README.md** - This file

## Setup Instructions

1. **Update Contact Information:**
   - Replace `YOUR_WHATSAPP_NUMBER` with your actual WhatsApp number (format: country code + number, e.g., 971501234567)
   - Replace `YOUR_EMAIL@example.com` with your actual email address
   - Update these in all HTML files where they appear

2. **Configure Contact Form:**
   - The contact form in `contact.html` currently has `action="#"` and `method="POST"`
   - You'll need to set up a form handler (backend script) to process form submissions
   - Alternatively, you can use a service like Formspree, Netlify Forms, or similar

3. **Customize Styling:**
   - Edit `styles.css` to match your brand colors and preferences
   - Current primary color: #0066cc (blue)
   - All colors and spacing can be adjusted in the CSS file

4. **Deploy:**
   - These are static HTML files that can be hosted on any web server
   - Options include: GitHub Pages, Netlify, Vercel, or traditional web hosting

## Notes

- All pages include proper disclaimers about service scope and limitations
- No guarantees or promises are made in the content
- All content is compliant with the service model (documentation and facilitation only)
- The website is mobile-responsive

## Content Updates

All content is based on the markdown files in the parent directory:
- Homepage content: `uae-business-desk-homepage.md`
- Services content: `uae-business-desk-services-page.md`
- Process content: `process-page-content.md`
- Contact content: `uae-business-desk-contact-page.md`

To update content, edit the HTML files directly or update the markdown files and regenerate the HTML.

