/**
 * Email templates for quote emails (copy-to-clipboard only)
 */

import { toSetupTypeLabel, normalizeSetupType } from '@/lib/setupType';

// Lead type for email templates
interface Lead {
  fullName: string;
  setupType?: string | null;
  notes?: string | null;
  quotedAmountAed?: number | null;
  bankQuotedAmountAed?: number | null;
  companyInvoiceNumber?: string | null;
  companyInvoiceLink?: string | null;
  companyPaymentLink?: string | null;
  bankInvoiceNumber?: string | null;
}

/**
 * Extract lead reference from notes
 */
function extractLeadRef(notes: string | null): string {
  if (!notes) return 'N/A';
  const match = notes.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Build shared email footer
 * Used by quote and payment link emails for consistent branding
 * Footer includes company name, support email, and disclaimer
 */
function buildEmailFooter(): string {
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';
  
  // Footer as a separate section with separator and disclaimer
  let footer = `\n\n---\n\n`;
  footer += `${brandName}\n`;
  footer += `${supportEmail}\n`;
  footer += `+971 50 420 9110\n\n`;
  footer += `If you didn't request this, you can ignore this email.`;
  
  return footer;
}

/**
 * Build shared HTML email header
 * Returns HTML header with logo, UBD text, tagline, and title - all properly centered
 */
export function buildHtmlEmailHeader(title: string): string {
  const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.uaebusinessdesk.com/assets/header-logo.png';
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const tagline = 'Clarity before commitment';
  
  return `
      <div class="email-header" style="background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%) !important; padding: 40px 40px 30px; text-align: center; color-scheme: light only;">
        <div style="margin-bottom: 20px;">
          <img src="${logoUrl}" alt="${brandName}" width="40" height="auto" style="max-width: 40px; height: auto; display: block; border: 0; outline: none; text-decoration: none; margin: 0 auto 8px auto; filter: brightness(1.2) contrast(1.1);" />
          <p style="font-style: italic; color: #ffffff !important; margin: 0; font-size: 14px; letter-spacing: 0.02em; text-align: center; opacity: 1 !important;">${tagline}</p>
        </div>
        <h1 style="color: #ffffff !important; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">${title}</h1>
      </div>
  `;
}

/**
 * Build shared HTML email footer
 * Returns HTML footer with brand info and disclaimer
 */
export function buildHtmlEmailFooter(): string {
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';
  
  return `
    <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #f1f5f9;">
      <div style="text-align: center; margin-bottom: 16px;">
        <p style="margin: 4px 0; font-size: 15px; font-weight: 600; color: #0b2a4a;">${brandName}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #64748b;">
          <a href="mailto:${supportEmail}" style="color: #c9a14a; text-decoration: none;">${supportEmail}</a>
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #64748b;">+971 50 420 9110</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        If you didn't request this, you can ignore this email.
      </p>
    </div>
  `;
}

/**
 * Build shared HTML email wrapper styles
 * Returns complete CSS styles for email templates
 */
export function buildEmailStyles(): string {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
      background-color: #faf8f3;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      background-color: #faf8f3;
      padding: 20px;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%) !important;
      padding: 32px 40px;
      text-align: center;
      color-scheme: light only;
    }
    .email-header h1 {
      color: #ffffff !important;
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .email-header p {
      color: #ffffff !important;
      opacity: 1 !important;
    }
    .email-header img {
      filter: brightness(1.2) contrast(1.1);
    }
    @media (prefers-color-scheme: dark) {
      .email-header {
        background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%) !important;
      }
      .email-header h1,
      .email-header p {
        color: #ffffff !important;
      }
    }
    .email-content {
      padding: 40px;
    }
    .email-content p {
      margin: 0 0 16px 0;
      line-height: 1.7;
      color: #334155;
      font-size: 15px;
    }
    .email-content p:last-child {
      margin-bottom: 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border: 2px solid #c9a14a;
      border-radius: 10px;
      padding: 24px;
      margin: 28px 0;
    }
    .info-box {
      background-color: #f8fafc;
      border-left: 4px solid #c9a14a;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-box strong {
      color: #0b2a4a;
      font-weight: 600;
    }
    .warning-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .warning-box p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
      line-height: 1.6;
    }
    .warning-box strong {
      color: #78350f;
      font-weight: 600;
    }
    .button-primary {
      display: inline-block;
      background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%);
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 8px 0;
      box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35);
      transition: all 0.2s ease;
    }
    .button-secondary {
      display: inline-block;
      background-color: #0b2a4a;
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 4px;
      transition: all 0.2s ease;
    }
    .button-center {
      text-align: center;
      margin: 32px 0;
    }
    .list-item {
      margin: 10px 0;
      padding-left: 8px;
      line-height: 1.7;
      color: #475569;
    }
    .section-title {
      color: #0b2a4a;
      font-size: 18px;
      font-weight: 700;
      margin: 32px 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f5f9;
    }
    .amount-display {
      font-size: 28px;
      font-weight: 700;
      color: #0b2a4a;
      margin: 8px 0;
    }
    @media only screen and (max-width: 800px) {
      .email-wrapper {
        padding: 0;
      }
      .email-content {
        padding: 28px 24px;
      }
      .email-header {
        padding: 28px 24px;
      }
      .email-header h1 {
        font-size: 22px;
      }
      .highlight-box, .info-box, .warning-box {
        padding: 20px;
        margin: 20px 0;
      }
    }
  `;
}

/**
 * Build company quote email template
 * ⚠️ QUOTE EMAIL - FINALIZED & APPROVED ⚠️
 * This quote email template has been reviewed and approved.
 * - Simplified structure: Removed quote details container and section
 * - "View Quote & Decide" button placed after Required Documents section
 * - Added disclaimer about professional fee vs government charges
 * - Government charges can be paid online, vouchers received from authorities
 * - Clear flow: Customer reads email and documents before viewing quote
 * Please do not modify without careful review and approval.
 */
export function buildCompanyQuoteEmail(lead: Lead, approvalUrl?: string, isRevisedQuote?: boolean): { subject: string; body: string; htmlBody?: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build email template');
  }
  
  if (!lead.quotedAmountAed) {
    throw new Error('Lead quotedAmountAed is required to build quote email');
  }
  
  const leadRef = extractLeadRef(lead.notes);
  const normalizedSetupType = normalizeSetupType(lead.setupType);
  const isBankLead = normalizedSetupType === 'bank';
  const serviceLabel = toSetupTypeLabel(lead.setupType);

  const formattedAmount = lead.quotedAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  // Shorter, more specific subject
  const subject = `Quote: ${serviceLabel} (${formattedAmount})`;

  // Plain text body (for fallback)
  let body = `Dear ${lead.fullName},\n\n`;
  if (isRevisedQuote) {
    body += `This is a revised quote based on your latest request.\n\n`;
  }
  
  if (isBankLead) {
    body += `Thank you for your interest in opening a UAE bank account.\n\n`;
    body += `No payment is required at this stage.\n\n`;
    body += `We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account application process.\n\n`;
    body += `**Quote Details:**\n\n`;
    body += `Service: ${serviceLabel}\n`;
    body += `Amount: ${formattedAmount}\n\n`;
    body += `**Next Steps:**\n\n`;
    body += `Please review the quote details and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.\n\n`;
    
    if (approvalUrl) {
      body += `[VIEW QUOTE] ${approvalUrl}\n\n`;
    }
    
    body += `**Required Documents:**\n`;
    body += `We'll request documents only after you confirm you wish to proceed.\n\n`;
    body += `Please prepare the following documents and information:\n\n`;
    body += `• Trade License (original and copy)\n`;
    body += `• Memorandum of Association (MOA)\n`;
    body += `• Shareholder passport copies (all shareholders)\n`;
    body += `• Proof of address (utility bill or bank statement)\n`;
    body += `• Business profile or company description\n`;
    body += `• Invoices or contracts (if available)\n`;
    body += `• Any additional documents required by the selected bank\n\n`;
  } else {
    // Company setup (mainland, freezone, offshore)
    const setupTypeLabel = normalizedSetupType === 'mainland' ? 'Mainland' : 
                           normalizedSetupType === 'freezone' ? 'Free Zone' : 
                           normalizedSetupType === 'offshore' ? 'Offshore' : 
                           'Company';
    
    body += `Thank you for your interest in setting up a ${setupTypeLabel} company in the UAE.\n\n`;
    body += `No payment is required at this stage.\n\n`;
    body += `We are pleased to confirm that we can proceed with your ${setupTypeLabel} company setup. Our service includes documentation preparation and facilitation support to help you complete the incorporation process.\n\n`;
    body += `**Quote Details:**\n\n`;
    body += `Service: ${serviceLabel}\n`;
    body += `Amount: ${formattedAmount}\n\n`;
    body += `**Next Steps:**\n\n`;
    body += `Please review the quote details and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.\n\n`;
    
    if (approvalUrl) {
      body += `[VIEW QUOTE] ${approvalUrl}\n\n`;
    }
    
    body += `**Required Documents:**\n`;
    body += `We'll request documents only after you confirm you wish to proceed.\n\n`;
    body += `Please prepare the following documents and information:\n\n`;
    body += `• Valid passport copy (all shareholders)\n`;
    body += `• Visa/residency copy (if applicable)\n`;
    body += `• Business activity description\n`;
    body += `• Shareholder details (names, nationalities, shareholding percentages)\n`;
    body += `• Proof of address (utility bill or bank statement)\n`;
    body += `• Any additional documents specific to your business activity\n\n`;
    
    body += `**Important Notice:**\n\n`;
    body += `This quote is only for ${setupTypeLabel} company setup. It does not include bank account setup. Bank account setup is available as a separate standalone service.\n\n`;
  }
  
  body += `Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();

  // HTML body - using standardized header/footer
  const setupTypeLabel = normalizedSetupType === 'mainland' ? 'Mainland' : 
                         normalizedSetupType === 'freezone' ? 'Free Zone' : 
                         normalizedSetupType === 'offshore' ? 'Offshore' : 
                         'Company';
  
  const requiredDocuments = isBankLead ? [
    'Trade License (original and copy)',
    'Memorandum of Association (MOA)',
    'Shareholder passport copies (all shareholders)',
    'Proof of address (utility bill or bank statement)',
    'Business profile or company description',
    'Invoices or contracts (if available)',
    'Any additional documents required by the selected bank'
  ] : [
    'Valid passport copy (all shareholders)',
    'Visa/residency copy (if applicable)',
    'Business activity description',
    'Shareholder details (names, nationalities, shareholding percentages)',
    'Proof of address (utility bill or bank statement)',
    'Any additional documents specific to your business activity'
  ];

  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Your Quote')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedQuote ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised quote based on your latest request.</p>` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">${isBankLead ? 'Thank you for your interest in opening a UAE bank account.' : `Thank you for your interest in setting up a ${setupTypeLabel} company in the UAE.`}</p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">${isBankLead ? 'We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account application process.' : `We are pleased to confirm that we can proceed with your ${setupTypeLabel} company setup. Our service includes documentation preparation and facilitation support to help you complete the incorporation process.`}</p>
        
        ${!isBankLead ? `
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Important:</strong> The quoted amount (${formattedAmount}) is our professional fee for documentation preparation and facilitation services only. This does not include government charges, license fees, or other fees payable directly to UAE authorities for company incorporation. Government charges are separate and can be paid online. Vouchers for these payments will be received directly from the authorities.</p>
        </div>
        ` : ''}
        
        <p class="section-title" style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Required Documents</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">We'll request documents only after you confirm you wish to proceed.</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">Please prepare the following documents and information:</p>
        <div style="margin: 16px 0;">
          ${requiredDocuments.map(doc => `
          <div class="list-item" style="display: flex; align-items: flex-start; margin: 10px 0; padding-left: 8px; line-height: 1.7; color: #475569;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">${doc}</p>
          </div>
          `).join('')}
        </div>
        
        ${!isBankLead ? `
        <div class="warning-box" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">This quote is only for ${setupTypeLabel} company setup. It does not include bank account setup. Bank account setup is available as a separate standalone service.</p>
        </div>
        ` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 32px; margin-bottom: 24px;">Please review the information above and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.</p>
        
        ${approvalUrl ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          <a href="${approvalUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 0; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">View Quote & Decide</a>
        </div>
        ` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 24px;">Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build Bank Deal quote email template
 * ⚠️ BANK DEAL QUOTE EMAIL - FINALIZED & APPROVED ⚠️
 * This Bank Deal quote email template has been reviewed and approved.
 * Bank Deal quotes are sent after Company Deal completion.
 * Please do not modify without careful review and approval.
 */
export function buildBankDealQuoteEmail(lead: Lead, approvalUrl?: string, isRevisedQuote?: boolean): { subject: string; body: string; htmlBody?: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build email template');
  }
  
  if (!(lead as any).bankDealQuotedAmountAed) {
    throw new Error('Lead bankDealQuotedAmountAed is required to build Bank Deal quote email');
  }
  
  const leadRef = extractLeadRef(lead.notes);
  const serviceLabel = 'Bank Account Setup';

  const formattedAmount = (lead as any).bankDealQuotedAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  const subject = `Quote: Bank Account Setup (${formattedAmount})`;

  // Plain text body (for fallback)
  let body = `Dear ${lead.fullName},\n\n`;
  if (isRevisedQuote) {
    body += `This is a revised quote based on your latest request.\n\n`;
  }
  
  body += `Thank you for your interest in opening a UAE bank account.\n\n`;
  body += `We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account application process.\n\n`;
  
  body += `**Required Documents:**\n`;
  body += `We'll request documents only after you confirm you wish to proceed.\n\n`;
  body += `Please prepare the following documents and information:\n\n`;
  body += `• Trade License (original and copy)\n`;
  body += `• Memorandum of Association (MOA)\n`;
  body += `• Shareholder passport copies (all shareholders)\n`;
  body += `• Proof of address (utility bill or bank statement)\n`;
  body += `• Business profile or company description\n`;
  body += `• Invoices or contracts (if available)\n`;
  body += `• Any additional documents required by the selected bank\n\n`;
  
  body += `Please review the information above and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.\n\n`;
  
  if (approvalUrl) {
    body += `[VIEW QUOTE] ${approvalUrl}\n\n`;
  }
  
  body += `Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.\n\n`;
  
  // Add shared footer
  body += buildEmailFooter();

  // HTML body
  const requiredDocuments = [
    'Trade License (original and copy)',
    'Memorandum of Association (MOA)',
    'Shareholder passport copies (all shareholders)',
    'Proof of address (utility bill or bank statement)',
    'Business profile or company description',
    'Invoices or contracts (if available)',
    'Any additional documents required by the selected bank'
  ];

  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Your Bank Account Setup Quote')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedQuote ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised quote based on your latest request.</p>` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Thank you for your interest in opening a UAE bank account.</p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account application process.</p>
        
        <p class="section-title" style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Required Documents</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">We'll request documents only after you confirm you wish to proceed.</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">Please prepare the following documents and information:</p>
        <div style="margin: 16px 0;">
          ${requiredDocuments.map(doc => `
          <div class="list-item" style="display: flex; align-items: flex-start; margin: 10px 0; padding-left: 8px; line-height: 1.7; color: #475569;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">${doc}</p>
          </div>
          `).join('')}
        </div>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 32px; margin-bottom: 24px;">Please review the information above and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.</p>
        
        ${approvalUrl ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          <a href="${approvalUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 0; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">View Quote & Decide</a>
        </div>
        ` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 24px;">Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build bank quote email template
 */
/**
 * Build bank quote email template
 * ⚠️ BANK QUOTE EMAIL - FINALIZED & APPROVED ⚠️
 * This bank quote email template has been reviewed and approved.
 * Please do not modify without careful review and approval.
 */
export function buildBankQuoteEmail(lead: Lead, approvalUrl?: string, isRevisedQuote?: boolean): { subject: string; body: string; htmlBody?: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build email template');
  }
  
  if (!lead.bankQuotedAmountAed) {
    throw new Error('Lead bankQuotedAmountAed is required to build bank quote email');
  }

  const formattedAmount = lead.bankQuotedAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  // Match company quote format for consistency
  const subject = `Quote: Bank Account Setup (${formattedAmount})`;

  // Plain text body (for fallback)
  let body = `Dear ${lead.fullName},\n\n`;
  
  if (isRevisedQuote) {
    body += `This is a revised quote based on your latest request.\n\n`;
  }
  
  body += `Thank you for your interest in opening a UAE bank account.\n\n`;
  body += `No payment is required at this stage.\n\n`;
  body += `We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account opening process.\n\n`;
  body += `**Quote Details:**\n\n`;
  body += `Service: Bank Account Documentation Support\n`;
  body += `Amount: ${formattedAmount}\n\n`;
  body += `**Next Steps:**\n\n`;
  body += `Please review the quote details and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.\n\n`;
  
  if (approvalUrl) {
    body += `[VIEW QUOTE] ${approvalUrl}\n\n`;
  }
  
  body += `**Required Documents:**\n`;
  body += `We'll request documents only after you confirm you wish to proceed.\n\n`;
  body += `Please prepare the following documents and information:\n\n`;
  body += `• Trade License (original and copy)\n`;
  body += `• Memorandum of Association (MOA)\n`;
  body += `• Shareholder passport copies (all shareholders)\n`;
  body += `• Proof of address (utility bill or bank statement)\n`;
  body += `• Business profile or company description\n`;
  body += `• Invoices or contracts (if available)\n`;
  body += `• Any additional documents required by the selected bank\n\n`;
  body += `Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();

  // HTML body - using standardized header/footer
  const requiredDocuments = [
    'Trade License (original and copy)',
    'Memorandum of Association (MOA)',
    'Shareholder passport copies (all shareholders)',
    'Proof of address (utility bill or bank statement)',
    'Business profile or company description',
    'Invoices or contracts (if available)',
    'Any additional documents required by the selected bank'
  ];

  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Your Quote')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedQuote ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised quote based on your latest request.</p>` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Thank you for your interest in opening a UAE bank account.</p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">We are pleased to confirm that we can proceed with your bank account setup. Our service includes documentation preparation and facilitation support to help you complete the bank account application process.</p>
        
        <p class="section-title" style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Required Documents</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">We'll request documents only after you confirm you wish to proceed.</p>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 16px;">Please prepare the following documents and information:</p>
        <div style="margin: 16px 0;">
          ${requiredDocuments.map(doc => `
          <div class="list-item" style="display: flex; align-items: flex-start; margin: 10px 0; padding-left: 8px; line-height: 1.7; color: #475569;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">${doc}</p>
          </div>
          `).join('')}
        </div>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 32px; margin-bottom: 24px;">Please review the information above and decide whether you would like to proceed. Once you confirm you wish to proceed, we will share the secure payment link for you to complete the payment.</p>
        
        ${approvalUrl ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          <a href="${approvalUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 0; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">View Quote & Decide</a>
        </div>
        ` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-top: 24px;">Once you confirm you wish to proceed and payment is received, we will begin the documentation process and keep you updated on the progress.</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build welcome email template
 */
export function buildWelcomeEmail(lead: Lead): { subject: string; body: string; htmlBody?: string } {
  const leadRef = extractLeadRef(lead.notes);
  const subject = `Welcome to UAE Business Desk`;
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';
  const tagline = 'Clarity before commitment';
  
  let body = `\n`;
  body += `${brandName.toUpperCase()}\n`;
  body += `${tagline}\n`;
  body += `\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  body += `Dear ${lead.fullName},\n\n`;
  body += `Thank you for your interest in ${brandName}. We're excited to help you with your UAE company setup journey.\n\n`;
  body += `WHAT'S NEXT?\n`;
  body += `We have received your enquiry and our team will review your requirements. You can expect to hear from us within the next business day.\n\n`;
  body += `HAVE QUESTIONS?\n`;
  body += `We're here to help! Feel free to reach out to us:\n\n`;
  body += `Email: ${supportEmail}\n`;
  body += `WhatsApp: +971 50 420 9110\n\n`;
  body += `We look forward to assisting you with your UAE business setup.\n\n`;
  body += `Best regards,\n`;
  body += `The ${brandName} Team\n\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += buildEmailFooter();

  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader(`Welcome to ${brandName}`)}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Thank you for your interest. We've received your enquiry and will review your requirements. You can expect to hear from us within the next business day.</p>
        
        <div class="highlight-box" style="background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%); border: 2px solid #c9a14a; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
            <strong style="color: #0b2a4a;">Need help?</strong> Contact us at{' '}
            <a href="mailto:${supportEmail}" style="color: #c9a14a; text-decoration: none; font-weight: 600;">${supportEmail}</a>
            {' '}or{' '}
            <a href="https://wa.me/971504209110" style="color: #c9a14a; text-decoration: none; font-weight: 600;">+971 50 420 9110</a>
          </p>
        </div>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build company invoice email template (includes payment link)
 * ⚠️ COMPANY INVOICE EMAIL - FINALIZED & APPROVED ⚠️
 * This invoice email template has been reviewed and approved.
 * - Simplified structure: Removed "Complete Your Payment" box
 * - Added "View Invoice" button alongside "Pay Now" button
 * - Removed duplicate "View Invoice: View Invoice Online" text link
 * - Clean layout with invoice details and action buttons
 * Please do not modify without careful review and approval.
 */
export function buildCompanyInvoiceEmail(lead: Lead, paymentLink?: string, isRevisedInvoice?: boolean, invoiceViewUrl?: string): { subject: string; body: string; htmlBody?: string } {
  const leadRef = extractLeadRef(lead.notes);
  const normalizedSetupType = normalizeSetupType(lead.setupType);
  const isBankLead = normalizedSetupType === 'bank';
  const setupTypeLabel = normalizedSetupType === 'mainland' ? 'Mainland' : 
                         normalizedSetupType === 'freezone' ? 'Free Zone' : 
                         normalizedSetupType === 'offshore' ? 'Offshore' : 'Company';
  
  const invoiceNumber = lead.companyInvoiceNumber || 'N/A';
  const invoiceLink = lead.companyInvoiceLink || '';
  const finalPaymentLink = paymentLink || lead.companyPaymentLink || '';

  const formattedAmount = lead.quotedAmountAed?.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }) || 'N/A';

  // Shorter, more specific subject
  const subject = isRevisedInvoice 
    ? `Revised Invoice: Company Setup (${formattedAmount})`
    : `Invoice: Company Setup (${formattedAmount})`;

  // Plain text body
  let body = `Dear ${lead.fullName},\n\n`;
  if (isRevisedInvoice) {
    body += `This is a revised invoice for your ${setupTypeLabel} company setup.\n\n`;
  } else {
    body += `Thank you for approving the quote for your ${setupTypeLabel} company setup.\n\n`;
  }
  body += `Please find the invoice details below:\n\n`;
  body += `Invoice Number: ${invoiceNumber}\n`;
  if (invoiceViewUrl) {
    body += `View Invoice: ${invoiceViewUrl}\n`;
  }
  body += `Amount: ${formattedAmount}\n\n`;
  
  // Add disclaimer for company setup (not bank account setup)
  if (!isBankLead) {
    body += `**Important Notice:**\n\n`;
    body += `This invoice is only for ${setupTypeLabel} company setup. It does not include bank account setup. Bank account setup is available as a separate standalone service.\n\n`;
  }
  
  if (finalPaymentLink) {
    body += `Payment Link: ${finalPaymentLink}\n\n`;
    body += `Please complete the payment using the link above. Once payment is received, we will begin the documentation process.\n\n`;
  } else {
    body += `Payment instructions will be sent separately.\n\n`;
  }
  
  body += `If you have any questions about the invoice or payment, please don't hesitate to contact us.\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();
  
  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Invoice for UAE Company Setup')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedInvoice 
          ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised invoice for your ${setupTypeLabel} company setup.</p>`
          : `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Thank you for approving the quote. Please find your invoice details below.</p>`}
        
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 24px; margin: 32px 0; border-radius: 8px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Amount:</strong> <span class="amount-display" style="font-size: 28px; font-weight: 700; color: #0b2a4a; margin: 0;">${formattedAmount}</span></p>
          ${leadRef !== 'N/A' ? `<p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Reference:</strong> ${leadRef}</p>` : ''}
        </div>
        
        ${!isBankLead ? `
        <div class="warning-box" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">This invoice is only for ${setupTypeLabel} company setup. It does not include bank account setup. Bank account setup is available as a separate standalone service.</p>
        </div>
        ` : ''}
        
        ${finalPaymentLink ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          ${invoiceViewUrl ? `
          <a href="${invoiceViewUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(11, 42, 74, 0.35); transition: all 0.2s ease;">View Invoice</a>
          ` : ''}
          <a href="${finalPaymentLink}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">Pay Now</a>
        </div>
        ` : ''}
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build Bank Deal invoice email template (includes payment link)
 * ⚠️ BANK DEAL INVOICE EMAIL - FINALIZED & APPROVED ⚠️
 * This Bank Deal invoice email template has been reviewed and approved.
 * - Simplified structure: Removed "Complete Your Payment" box
 * - Added "View Invoice" button alongside "Pay Now" button
 * - Clean layout with invoice details and action buttons
 * - Includes invoice view URL for easy access
 * Please do not modify without careful review and approval.
 */
export function buildBankDealInvoiceEmail(lead: Lead, paymentLink?: string, isRevisedInvoice?: boolean, invoiceViewUrl?: string): { subject: string; body: string; htmlBody?: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build email template');
  }
  
  if (!(lead as any).bankDealInvoiceNumber) {
    throw new Error('Lead bankDealInvoiceNumber is required to build Bank Deal invoice email');
  }
  
  if (!(lead as any).bankDealInvoiceAmountAed) {
    throw new Error('Lead bankDealInvoiceAmountAed is required to build Bank Deal invoice email');
  }

  const invoiceNumber = (lead as any).bankDealInvoiceNumber;
  const formattedAmount = (lead as any).bankDealInvoiceAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  const subject = isRevisedInvoice
    ? `Revised Invoice: ${invoiceNumber}`
    : `Invoice: ${invoiceNumber}`;

  // Plain text body
  let body = `Dear ${lead.fullName},\n\n`;
  if (isRevisedInvoice) {
    body += `This is a revised invoice based on your latest request.\n\n`;
  }
  body += `Please find your invoice for Bank Account Setup services below.\n\n`;
  body += `**Invoice Details:**\n\n`;
  body += `Invoice Number: ${invoiceNumber}\n`;
  body += `Service: Bank Account Setup\n`;
  body += `Amount: ${formattedAmount}\n\n`;
  if (invoiceViewUrl) {
    body += `View Invoice: ${invoiceViewUrl}\n\n`;
  }
  if (paymentLink) {
    body += `Payment Link: ${paymentLink}\n\n`;
  }
  body += `Please complete your payment at your earliest convenience. Once payment is received, we will begin the documentation process and keep you updated on the progress.\n\n`;
  
  // Add shared footer
  body += buildEmailFooter();

  // HTML body
  const finalPaymentLink = paymentLink || (lead as any).bankDealPaymentLink;

  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Your Invoice')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedInvoice ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised invoice based on your latest request.</p>` : ''}
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Please find your invoice for Bank Account Setup services below.</p>
        
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 24px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 12px 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Service:</strong> Bank Account Setup</p>
          <p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Amount:</strong> <span class="amount-display" style="font-size: 28px; font-weight: 700; color: #0b2a4a; margin: 0;">${formattedAmount}</span></p>
        </div>
        
        ${finalPaymentLink ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          ${invoiceViewUrl ? `
          <a href="${invoiceViewUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(11, 42, 74, 0.35); transition: all 0.2s ease;">View Invoice</a>
          ` : ''}
          <a href="${finalPaymentLink}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">Pay Now</a>
        </div>
        ` : ''}
        
        <p style="margin-top: 24px; font-size: 16px; line-height: 1.8; color: #334155;">Once payment is received, we will begin the documentation process and keep you updated on the progress.</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build payment reminder email template
 * ⚠️ PAYMENT REMINDER EMAIL - FINALIZED & APPROVED ⚠️
 * This payment reminder email template has been reviewed and approved.
 * - Simplified structure: Removed "Complete Your Payment" box
 * - Added "View Invoice" button alongside "Pay Now" button
 * - Clean layout with invoice details and action buttons
 * - Includes invoice view URL for easy access
 * Please do not modify without careful review and approval.
 */
export function buildPaymentReminderEmail(params: {
  customerName: string;
  invoiceNumber: string;
  amountAed: number;
  paymentLink: string;
  invoiceViewUrl?: string;
}): { subject: string; body: string; htmlBody?: string } {
  const { customerName, invoiceNumber, amountAed, paymentLink, invoiceViewUrl } = params;

  const formattedAmount = amountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  const subject = `Payment Reminder: Invoice ${invoiceNumber}`;

  // Plain text body
  let body = `Dear ${customerName},\n\n`;
  body += `This is a friendly reminder that payment for your invoice is still pending.\n\n`;
  body += `**Invoice Details:**\n\n`;
  body += `Invoice Number: ${invoiceNumber}\n`;
  body += `Amount: ${formattedAmount}\n\n`;
  if (invoiceViewUrl) {
    body += `View Invoice: ${invoiceViewUrl}\n\n`;
  }
  body += `Payment Link: ${paymentLink}\n\n`;
  body += `Please complete your payment at your earliest convenience. If you have already made the payment, please ignore this reminder.\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();

  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Payment Reminder')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${customerName},</p>
        
        <p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a friendly reminder that payment for your invoice is still pending.</p>
        
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 24px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Amount:</strong> <span class="amount-display" style="font-size: 28px; font-weight: 700; color: #0b2a4a; margin: 0;">${formattedAmount}</span></p>
        </div>
        
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          ${invoiceViewUrl ? `
          <a href="${invoiceViewUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(11, 42, 74, 0.35); transition: all 0.2s ease;">View Invoice</a>
          ` : ''}
          <a href="${paymentLink}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">Pay Now</a>
        </div>
        
        <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If you have already made the payment, please ignore this reminder.</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build bank invoice email template (includes payment link and view URL)
 */
/**
 * Build bank invoice email template (includes payment link)
 * ⚠️ BANK INVOICE EMAIL - FINALIZED & APPROVED ⚠️
 * This bank invoice email template has been reviewed and approved.
 * - Simplified structure: Removed "Complete Your Payment" box
 * - Added "View Invoice" button alongside "Pay Now" button
 * - Removed duplicate "View Invoice: View Invoice Online" text link
 * - Clean layout with invoice details and action buttons
 * Please do not modify without careful review and approval.
 */
export function buildBankInvoiceEmail(lead: Lead, paymentLink?: string, isRevisedInvoice?: boolean, invoiceViewUrl?: string): { subject: string; body: string; htmlBody?: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build bank invoice email');
  }
  
  const leadRef = extractLeadRef(lead.notes);
  const invoiceNumber = lead.bankInvoiceNumber || 'N/A';
  const finalPaymentLink = paymentLink || lead.bankPaymentLink || '';
  
  const formattedAmount = lead.bankQuotedAmountAed?.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }) || 'N/A';

  // Match company invoice format for consistency
  const subject = isRevisedInvoice 
    ? `Revised Invoice: Bank Account Setup (${formattedAmount})`
    : `Invoice: Bank Account Setup (${formattedAmount})`;

  // Plain text body
  let body = `Dear ${lead.fullName},\n\n`;
  if (isRevisedInvoice) {
    body += `This is a revised invoice for your bank account setup.\n\n`;
  } else {
    body += `Thank you for approving the quote for your bank account setup.\n\n`;
  }
  body += `Please find the invoice details below:\n\n`;
  body += `Invoice Number: ${invoiceNumber}\n`;
  if (invoiceViewUrl) {
    body += `View Invoice: ${invoiceViewUrl}\n`;
  }
  body += `Amount: ${formattedAmount}\n\n`;
  
  if (finalPaymentLink) {
    body += `Payment Link: ${finalPaymentLink}\n\n`;
    body += `Please complete the payment using the link above. Once payment is received, we will begin the bank account application process.\n\n`;
  } else {
    body += `Payment instructions will be sent separately.\n\n`;
  }
  
  body += `If you have any questions about the invoice or payment, please don't hesitate to contact us.\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();
  
  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Invoice for UAE Bank Account Setup')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        ${isRevisedInvoice 
          ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised invoice for your bank account setup.</p>`
          : `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">Thank you for approving the quote. Please find your invoice details below.</p>`}
        
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 24px; margin: 32px 0; border-radius: 8px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Amount:</strong> <span class="amount-display" style="font-size: 28px; font-weight: 700; color: #0b2a4a; margin: 0;">${formattedAmount}</span></p>
          ${leadRef !== 'N/A' ? `<p style="margin: 12px 0 0 0; font-size: 15px; line-height: 1.7; color: #475569;"><strong style="color: #0b2a4a; font-weight: 600;">Reference:</strong> ${leadRef}</p>` : ''}
        </div>
        
        ${finalPaymentLink ? `
        <div class="button-center" style="text-align: center; margin: 32px 0;">
          ${invoiceViewUrl ? `
          <a href="${invoiceViewUrl}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(11, 42, 74, 0.35); transition: all 0.2s ease;">View Invoice</a>
          ` : ''}
          <a href="${finalPaymentLink}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 12px; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">Pay Now</a>
        </div>
        ` : ''}
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build payment link email template
 * @deprecated This function is deprecated. Payment links are now included in invoice emails.
 * Use buildCompanyInvoiceEmail() instead, which includes the payment link.
 * 
 * This function is kept for backward compatibility but should not be used in new code.
 */
export function buildPaymentLinkEmail(lead: Lead): { subject: string; body: string } {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build payment link email');
  }
  
  if (!lead.quotedAmountAed) {
    throw new Error('Lead quotedAmountAed is required to build payment link email');
  }
  
  if (!lead.companyPaymentLink) {
    throw new Error('Lead companyPaymentLink is required to build payment link email');
  }
  
  const leadRef = extractLeadRef(lead.notes);
  const formattedAmount = lead.quotedAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  const subject = `Payment Link - UAE Business Desk (Ref: ${leadRef})`;

  let body = `Dear ${lead.fullName},\n\n`;
  body += `Thank you for approving the quote for your UAE company setup.\n\n`;
  body += `**Payment Details:**\n\n`;
  body += `Amount: ${formattedAmount}\n`;
  body += `Payment Link: ${lead.companyPaymentLink}\n\n`;
  body += `**Next Steps:**\n\n`;
  body += `Please complete your payment using the secure link above. Once payment is received, we will begin the documentation process and keep you updated on the progress.\n\n`;
  body += `**Important:**\n`;
  body += `• Payment must be completed within 7 days to secure your quote\n`;
  body += `• The payment link is secure and encrypted\n`;
  body += `• You will receive a payment confirmation email once payment is processed\n\n`;
  body += `If you have any questions about the payment or need assistance, please don't hesitate to contact us.\n\n`;
  body += `Best regards,\n\n`;
  body += `${process.env.BRAND_NAME || 'UAE Business Desk'}\n`;
  body += `${process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com'}\n`;
  body += `+971 50 420 9110`;
  
  // Add shared footer
  body += buildEmailFooter();

  return { subject, body };
}

/**
 * Build payment confirmation email template
 */
export function buildPaymentConfirmationEmail(lead: Lead): { subject: string; body: string; htmlBody?: string } {
  const leadRef = extractLeadRef(lead.notes);
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';
  const subject = `Payment Received`;

  let body = `Dear ${lead.fullName},\n\n`;
  body += `We have received your payment. Thank you for choosing ${brandName}.\n\n`;
  body += `Next Steps:\n\n`;
  body += `1. We will begin preparing your documentation\n`;
  body += `2. You will receive a document checklist via email within 2 business days\n`;
  body += `3. Please prepare and submit the required documents as per the checklist\n`;
  body += `4. We will keep you updated on the progress throughout the process\n\n`;
  body += `If you have any questions, please feel free to contact us:\n\n`;
  body += `Email: ${supportEmail}\n`;
  body += `WhatsApp: +971 50 420 9110\n\n`;
  body += `We look forward to completing your UAE business setup.\n\n`;
  body += `Best regards,\n\n`;
  body += `The ${brandName} Team\n`;
  body += `${supportEmail}\n`;
  body += `+971 50 420 9110`;
  
  // Add shared footer
  body += buildEmailFooter();

  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Payment Received ✅')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        <div class="highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
          <p style="color: #065f46; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Thank You!</p>
          <p style="color: #047857; margin: 0; font-size: 16px; line-height: 1.7;">We have received your payment. Thank you for choosing ${brandName}.</p>
        </div>
        
        <p style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Next Steps</p>
        <div style="margin: 24px 0;">
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">We will begin preparing your documentation</p>
          </div>
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">You will receive a document checklist via email within 2 business days</p>
          </div>
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">Please prepare and submit the required documents as per the checklist</p>
          </div>
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">We will keep you updated on the progress throughout the process</p>
          </div>
        </div>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Build completion email template (with Google review if first completion)
 * ⚠️ PROJECT COMPLETION EMAIL - FINALIZED & APPROVED ⚠️
 * This project completion email template has been reviewed and approved.
 * - Includes completion details and next steps
 * - Includes Google review request for first completion
 * - Clean layout with project completion information
 * Please do not modify without careful review and approval.
 */
export function buildCompletionEmail(lead: Lead, isFirstCompletion: boolean): { subject: string; body: string; htmlBody?: string } {
  const leadRef = extractLeadRef(lead.notes);
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';
  const subject = `Project Completed`;

  let body = `Dear ${lead.fullName},\n\n`;
  body += `We are pleased to inform you that your UAE business setup project has been completed successfully.\n\n`;
  
  // List what was completed with actual service names
  const completedItems: string[] = [];
  if (lead.companyCompletedAt) {
    const serviceLabel = toSetupTypeLabel(lead.setupType);
    // Extract just the company service name (remove "+ Bank Account" if present)
    const companyService = serviceLabel.includes(' + Bank Account') 
      ? serviceLabel.replace(' + Bank Account', '')
      : serviceLabel === 'Bank Account Setup' 
        ? 'Company Setup' // Fallback if somehow only bank is set
        : serviceLabel;
    completedItems.push(`• ${companyService} completed`);
  }
  if (lead.bankCompletedAt) {
    completedItems.push(`• Bank Account Setup completed`);
  }
  
  if (completedItems.length > 0) {
    body += `Completed Services:\n`;
    completedItems.forEach(item => body += `${item}\n`);
    body += `\n`;
  }
  
  body += `Next Steps for You:\n\n`;
  body += `• Review all documents and deliverables\n`;
  body += `• Ensure compliance with ongoing requirements\n`;
  body += `• Keep all documents in a safe place\n`;
  body += `• Contact us if you need any assistance in the future\n\n`;
  
  // Always include Google review request
  const googleReviewLink = process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/YOUR_GOOGLE_MY_BUSINESS_ID/review';
  body += `We would greatly appreciate your feedback! If you're satisfied with our service, please consider leaving us a review on Google:\n\n`;
  body += `Google Review: ${googleReviewLink}\n\n`;
  body += `Your feedback helps us improve and helps other businesses make informed decisions.\n\n`;
  
  body += `Thank you for choosing ${brandName}. We wish you success with your business in the UAE!\n\n`;
  
  // Add shared footer (includes signature)
  body += buildEmailFooter();

  // List what was completed for HTML with actual service names
  const completedItemsHtml: string[] = [];
  if (lead.companyCompletedAt) {
    const serviceLabel = toSetupTypeLabel(lead.setupType);
    // Extract just the company service name (remove "+ Bank Account" if present)
    const companyService = serviceLabel.includes(' + Bank Account') 
      ? serviceLabel.replace(' + Bank Account', '')
      : serviceLabel === 'Bank Account Setup' 
        ? 'Company Setup' // Fallback if somehow only bank is set
        : serviceLabel;
    completedItemsHtml.push(`${companyService} completed`);
  }
  if (lead.bankCompletedAt) {
    completedItemsHtml.push('Bank Account Setup completed');
  }

  // HTML body - simplified and using shared header
  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${buildEmailStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      ${buildHtmlEmailHeader('Project Completed! 🎉')}
      
      <div class="email-content" style="padding: 40px 40px 30px;">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        
        <div class="highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
          <p style="color: #065f46; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Congratulations!</p>
          <p style="color: #047857; margin: 0; font-size: 16px; line-height: 1.7;">Your UAE business setup project has been completed successfully.</p>
        </div>
        
        ${completedItemsHtml.length > 0 ? `
        <p style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Completed Services</p>
        <div class="info-box" style="background-color: #f8fafc; border-left: 4px solid #c9a14a; padding: 20px; margin: 24px 0; border-radius: 8px;">
          ${completedItemsHtml.map(item => `
            <div style="display: flex; align-items: center; margin: 12px 0;">
              <span style="display: inline-block; width: 8px; height: 8px; background: #c9a14a; border-radius: 50%; margin-right: 12px;"></span>
              <p style="margin: 0; color: #475569; font-size: 15px;">${item}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <p style="color: #0b2a4a; font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Next Steps</p>
        <div style="margin: 24px 0;">
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">Review all documents and deliverables</p>
          </div>
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">Ensure compliance with ongoing requirements</p>
          </div>
          <div style="display: flex; align-items: flex-start; margin: 12px 0;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #c9a14a; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></span>
            <p style="margin: 0; flex: 1; line-height: 1.7; color: #475569;">Keep all documents in a safe place</p>
          </div>
        </div>
        
        <div class="highlight-box" style="background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%); border: 2px solid #c9a14a; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
          <h2 style="color: #0b2a4a; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">Share Your Experience</h2>
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.7;">We would greatly appreciate your feedback! If you're satisfied with our service, please consider leaving us a review on Google. Your feedback helps us improve and helps other businesses make informed decisions.</p>
          <div class="button-center" style="text-align: center; margin: 24px 0;">
            <a href="${process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/YOUR_GOOGLE_MY_BUSINESS_ID/review'}" class="button-primary" style="display: inline-block; background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px 0; box-shadow: 0 4px 14px rgba(201, 161, 74, 0.35); transition: all 0.2s ease;">Leave a Review on Google</a>
          </div>
        </div>
        
        <p style="margin-top: 32px; font-size: 15px; line-height: 1.7; color: #334155;">Thank you for choosing ${brandName}. We wish you success with your business in the UAE!</p>
      </div>
      
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

