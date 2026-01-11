import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Get formatted "From" address with display name
 * Uses BRAND_NAME for display name, falls back gracefully if not set
 * If customFrom is provided, extracts email address from it (handles "Name <email>" format)
 * IMPORTANT: The email address MUST match SMTP_USER domain for proper deliverability
 */
function getFromAddress(customFrom?: string): string {
  const brandName = process.env.BRAND_NAME || 'UAE Business Desk';
  let emailAddress: string;
  
  if (customFrom) {
    // Extract email from "Name <email>" format if present
    const emailMatch = customFrom.match(/<(.+)>/);
    emailAddress = emailMatch ? emailMatch[1] : customFrom;
  } else {
    emailAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';
  }
  
  if (!emailAddress) {
    throw new Error('Email address not configured. Please set SMTP_USER or SMTP_FROM.');
  }
  
  // CRITICAL: For deliverability, ensure the From address domain matches SMTP_USER domain
  // If using Gmail SMTP, the From address must be the Gmail address
  // If using custom SMTP, ensure the From address matches the authenticated domain
  const smtpUser = process.env.SMTP_USER || '';
  if (smtpUser && !emailAddress.includes('@')) {
    // If emailAddress doesn't have @, it's invalid
    emailAddress = smtpUser;
  } else if (smtpUser && process.env.SMTP_HOST?.includes('gmail')) {
    // If using Gmail SMTP, force From address to match SMTP_USER for better deliverability
    // Gmail will reject or flag emails where From doesn't match authenticated user
    const smtpDomain = smtpUser.split('@')[1];
    const fromDomain = emailAddress.split('@')[1];
    if (smtpDomain !== fromDomain) {
      console.warn(`[Email] From address domain (${fromDomain}) doesn't match SMTP domain (${smtpDomain}). Using SMTP_USER for better deliverability.`);
      emailAddress = smtpUser;
    }
  }
  
  // Format as "Display Name <email@example.com>" for better branding
  // Always use BRAND_NAME as display name for consistency
  return `${brandName} <${emailAddress}>`;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    console.error('[Email]', error.message);
    throw error;
  }

  try {
    // Use custom from if provided, otherwise use branded from address
    const fromAddress = options.from ? getFromAddress(options.from) : getFromAddress();
    
    // Extract plain text from HTML for better deliverability
    const plainText = extractPlainText(options.html);
    
    const mailOptions: any = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: plainText, // Add plain text version
      // Add headers to improve deliverability and reduce spam flags
      headers: {
        'X-Mailer': 'UAE Business Desk',
        'X-Priority': '1',
        'Importance': 'normal', // Changed from 'high' to avoid spam filters
        'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        // Add Message-ID for better tracking (use domain from SMTP_USER)
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(7)}@${process.env.SMTP_USER?.split('@')[1] || 'uaebusinessdesk.com'}>`,
        // Add authentication results header (helps with deliverability)
        'Authentication-Results': `${process.env.SMTP_HOST || 'smtp.gmail.com'}; auth=pass`,
      },
      // Add reply-to for better deliverability
      replyTo: process.env.SMTP_USER || fromAddress,
    };

    // Add CC if provided
    if (options.cc) {
      mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent successfully to ${options.to}`, { messageId: result.messageId });
  } catch (error: any) {
    console.error('[Email] Send failed:', {
      to: options.to,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
}

/**
 * Extract plain text from HTML for email deliverability
 * Removes HTML tags and converts to readable text
 */
function extractPlainText(html: string): string {
  // Remove style and script tags
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Convert common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  
  return text.trim();
}

export function generateLeadRef(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `UBD-${year}${month}${day}-${hours}${minutes}-${random}`;
}

