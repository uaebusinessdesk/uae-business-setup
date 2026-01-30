type Lead = {
  fullName: string;
  setupType?: string | null;
  notes?: string | null;
  quotedAmountAed?: number | null;
  companyInvoiceNumber?: string | null;
  companyInvoiceLink?: string | null;
  companyPaymentLink?: string | null;
  [key: string]: any;
};

type SetupType = 'mainland' | 'freezone' | 'offshore' | 'bank';

const SETUP_TYPES: SetupType[] = ['mainland', 'freezone', 'offshore', 'bank'];

const SETUP_TYPE_LABEL: Record<SetupType, string> = {
  mainland: 'Mainland Company Setup',
  freezone: 'Free Zone Company Setup',
  offshore: 'Offshore Company Setup',
  bank: 'Bank Account Setup',
};

function normalizeSetupType(input: string | null | undefined): SetupType {
  if (!input || input.trim() === '') {
    return 'mainland';
  }

  const normalized = input.trim().toLowerCase();

  if (normalized.includes('+ bank account')) {
    const baseType = normalized.split('+')[0].trim();
    if (baseType === 'mainland') return 'mainland';
    if (baseType === 'freezone') return 'freezone';
    if (baseType === 'offshore') return 'offshore';
  }

  if (normalized === 'company') {
    return 'mainland';
  }

  if (SETUP_TYPES.includes(normalized as SetupType)) {
    return normalized as SetupType;
  }

  const legacyMap: Record<string, SetupType> = {
    'existing-company': 'bank',
    not_sure: 'mainland',
    'mainland company setup': 'mainland',
    'free zone company setup': 'freezone',
    'offshore company setup': 'offshore',
    'bank account setup': 'bank',
  };

  if (legacyMap[normalized]) {
    return legacyMap[normalized];
  }

  return 'mainland';
}

function toSetupTypeLabel(input: string | null | undefined): string {
  if (!input || input.trim() === '') {
    return SETUP_TYPE_LABEL['mainland'];
  }

  const normalizedType = normalizeSetupType(input);
  return SETUP_TYPE_LABEL[normalizedType];
}

function extractLeadRef(notes: string | null): string {
  if (!notes) return 'N/A';
  const match = notes.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
  return match ? match[1] : 'N/A';
}

function buildEmailFooter(): string {
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com';

  let footer = `\n\n---\n\n`;
  footer += `${brandName}\n`;
  footer += `${supportEmail}\n`;
  footer += `+971 50 420 9110\n\n`;
  footer += `If you didn't request this, you can ignore this email.`;

  return footer;
}

function buildHtmlEmailHeader(title: string): string {
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

function buildHtmlEmailFooter(): string {
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

function buildEmailStyles(): string {
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
    .email-content {
      padding: 40px;
    }
    .email-content p {
      margin: 0 0 16px 0;
      line-height: 1.7;
      color: #334155;
      font-size: 15px;
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
    .warning-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
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
    .button-center {
      text-align: center;
      margin: 32px 0;
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

export function buildCompanyQuoteEmail(lead: Lead, approvalUrl?: string, isRevisedQuote?: boolean) {
  if (!lead.fullName) {
    throw new Error('Lead fullName is required to build email template');
  }

  if (!lead.quotedAmountAed) {
    throw new Error('Lead quotedAmountAed is required to build quote email');
  }

  const leadRef = extractLeadRef(lead.notes ?? null);
  const normalizedSetupType = normalizeSetupType(lead.setupType);
  const isBankLead = normalizedSetupType === 'bank';
  const serviceLabel = toSetupTypeLabel(lead.setupType);

  const formattedAmount = lead.quotedAmountAed.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  });

  const subject = `Quote: ${serviceLabel} (${formattedAmount})`;

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
  body += buildEmailFooter();

  const setupTypeLabel = normalizedSetupType === 'mainland' ? 'Mainland' :
                         normalizedSetupType === 'freezone' ? 'Free Zone' :
                         normalizedSetupType === 'offshore' ? 'Offshore' :
                         'Company';

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
      ${buildHtmlEmailHeader('Quote for UAE Company Setup')}
      <div class="email-content">
        <p style="font-size: 17px; margin-bottom: 24px; color: #1e293b; line-height: 1.7;">Dear ${lead.fullName},</p>
        ${isRevisedQuote
          ? `<p style="font-size: 16px; line-height: 1.8; color: #334155; margin-bottom: 24px;">This is a revised quote based on your latest request.</p>`
          : ''}
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b;">Quote Summary</p>
          <p style="margin: 0; font-size: 16px; color: #0b2a4a;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #0b2a4a;"><strong>Amount:</strong> <span class="amount-display">${formattedAmount}</span></p>
          ${leadRef !== 'N/A' ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">Reference: ${leadRef}</p>` : ''}
        </div>
        <p style="font-size: 16px; line-height: 1.8; color: #334155;">We are pleased to confirm that we can proceed with your ${setupTypeLabel} company setup.</p>
        <p style="font-size: 16px; line-height: 1.8; color: #334155;">No payment is required at this stage.</p>
        ${approvalUrl ? `
        <div class="button-center">
          <a href="${approvalUrl}" class="button-primary">View Quote & Decide</a>
        </div>` : ''}
        <h3 class="section-title">Required Documents</h3>
        <p style="font-size: 15px; line-height: 1.7; color: #334155;">We'll request documents only after you confirm you wish to proceed.</p>
      </div>
      ${buildHtmlEmailFooter()}
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

export function buildCompanyInvoiceEmail(lead: Lead, paymentLink?: string, isRevisedInvoice?: boolean, invoiceViewUrl?: string) {
  const leadRef = extractLeadRef(lead.notes ?? null);
  const normalizedSetupType = normalizeSetupType(lead.setupType);
  const isBankLead = normalizedSetupType === 'bank';
  const setupTypeLabel = normalizedSetupType === 'mainland' ? 'Mainland' :
                         normalizedSetupType === 'freezone' ? 'Free Zone' :
                         normalizedSetupType === 'offshore' ? 'Offshore' :
                         'Company';

  const invoiceNumber = lead.companyInvoiceNumber || 'N/A';
  const finalPaymentLink = paymentLink || lead.companyPaymentLink || '';

  const formattedAmount = lead.quotedAmountAed?.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }) || 'N/A';

  const subject = isRevisedInvoice
    ? `Revised Invoice: Company Setup (${formattedAmount})`
    : `Invoice: Company Setup (${formattedAmount})`;

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
  body += buildEmailFooter();

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
