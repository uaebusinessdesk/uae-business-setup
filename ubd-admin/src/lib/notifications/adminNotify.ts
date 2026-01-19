import { sendEmail } from '@/lib/email';

/**
 * Send internal admin notification email for workflow events
 * 
 * @param params - Notification parameters
 * @param params.event - Event type (e.g. "quote_viewed", "quote_proceeded", "quote_declined", "invoice_viewed")
 * @param params.leadId - Lead ID
 * @param params.project - Project type ("company" or "bank")
 * @param params.subject - Email subject line
 * @param params.lines - Array of text lines to include in the email body
 */
export async function notifyAdmin(params: {
  event: string;
  leadId: string;
  project: 'company' | 'bank';
  subject: string;
  lines: string[];
}): Promise<void> {
  const { event, leadId, project, subject, lines } = params;

  const recipients = ['support@uaebusinessdesk.com'];

  // Build admin link
  const adminBaseUrl = process.env.ADMIN_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const adminLink = `${adminBaseUrl}/admin/leads/${leadId}`;

  // Build HTML email body with improved styling
  const htmlLines = lines.map(line => {
    // Check if line is a label (ends with colon or contains strong formatting)
    if (line.includes(':')) {
      const parts = line.split(':');
      if (parts.length === 2) {
        return `<p style="margin: 0 0 8px 0; line-height: 1.7;"><strong style="color: #0b2a4a; font-weight: 600;">${parts[0]}:</strong> <span style="color: #475569;">${parts[1]}</span></p>`;
      }
    }
    return `<p style="margin: 0 0 12px 0; line-height: 1.7; color: #334155; font-size: 15px;">${line.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1e293b;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f8fafc;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      background-color: #f8fafc;
      padding: 20px;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .email-content {
      padding: 40px;
    }
    .info-box {
      background-color: #f8fafc;
      border-left: 4px solid #c9a14a;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .button-primary {
      display: inline-block;
      background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%);
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 0;
      transition: all 0.2s ease;
    }
    .button-center {
      text-align: center;
      margin: 32px 0;
    }
    .metadata {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #f1f5f9;
      font-size: 12px;
      color: #94a3b8;
    }
    .metadata p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 600px) {
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
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>Admin Notification</h1>
      </div>
      
      <div class="email-content">
        <div class="info-box">
          ${htmlLines}
        </div>
        
        <div class="button-center">
          <a href="${adminLink}" class="button-primary">View Lead in Admin Portal</a>
        </div>
        
        <div class="metadata">
          <p><strong>Event:</strong> ${event}</p>
          <p><strong>Project:</strong> ${project === 'bank' ? 'Bank' : 'Company'}</p>
          <p><strong>Lead ID:</strong> ${leadId}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Send email to all recipients (comma-separated)
  await sendEmail({
    to: recipients.join(', '),
    subject,
    html,
  });
}

