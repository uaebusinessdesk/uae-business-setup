import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { buildPaymentLinkEmail } from '@/lib/emailTemplates';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';

export const dynamic = 'force-dynamic';

/**
 * Convert plain text payment link email to HTML with styled button
 */
function convertPaymentLinkEmailToHtml(textBody: string, paymentLink: string): string {
  const buttonHtml = `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentLink}" style="display: inline-block; padding: 14px 32px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Pay Now</a>
    </div>
  `;
  
  let html = textBody
    .replace(new RegExp(paymentLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), buttonHtml)
    .replace(/\n\n/g, '</p><p style="margin: 16px 0; line-height: 1.6;">')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '&bull;')
    .replace(/\n/g, '<br>');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px;">
        <p style="margin: 16px 0; line-height: 1.6;">${html}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * POST /api/leads/[id]/email/payment-link
 * @deprecated This endpoint is deprecated. Payment links are now included in invoice emails.
 * Use /api/leads/[id]/email/invoice/company instead.
 * 
 * This endpoint returns 410 Gone to indicate the resource is no longer available.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Return 410 Gone - Resource is deprecated
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated',
      message: 'Payment link emails are now included in invoice emails. Use /api/leads/[id]/email/invoice/company instead.',
      deprecated: true
    },
    { status: 410 }
  );

  // Legacy code below (unreachable but kept for reference)
  /* eslint-disable */
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // TypeScript guard: lead is not null after the check above
    const leadData = lead!;
    if (!leadData.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    if (!leadData.quoteApprovedAt) {
      return NextResponse.json({ error: 'Quote must be approved before sending payment link' }, { status: 400 });
    }

    if (!leadData.companyPaymentLink) {
      return NextResponse.json({ error: 'Payment link not set. Please enter the Ziina payment link first.' }, { status: 400 });
    }

    // Validate payment link is HTTPS
    try {
      const url = new URL(leadData.companyPaymentLink!);
      if (url.protocol !== 'https:') {
        return NextResponse.json({ error: 'Payment link must use HTTPS' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid payment link URL format' }, { status: 400 });
    }

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.' },
        { status: 500 }
      );
    }

    // Build email
    let subject: string;
    let body: string;
    try {
      const emailData = buildPaymentLinkEmail(leadData);
      subject = emailData.subject;
      body = emailData.body;
    } catch (templateError: any) {
      console.error('[API/Leads/Email/PaymentLink] Template build error:', templateError);
      return NextResponse.json(
        { 
          error: 'Failed to build email template', 
          details: templateError.message || 'Unknown template error'
        },
        { status: 500 }
      );
    }

    // Convert to HTML with proper button styling
    const htmlBody = convertPaymentLinkEmailToHtml(body, leadData.companyPaymentLink!);

    // Send email
    try {
      await sendCustomerEmail({
        to: leadData.email!,
        subject,
        html: htmlBody,
      }, 'payment-link');
    } catch (emailError: any) {
      console.error('[API/Leads/Email/PaymentLink] Email send error:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response,
      });
      
      let errorMessage = 'Failed to send email';
      if (emailError.code === 'EAUTH') {
        errorMessage = 'SMTP authentication failed. Please check SMTP_USER and SMTP_PASS.';
      } else if (emailError.code === 'ECONNECTION') {
        errorMessage = 'Could not connect to SMTP server. Please check SMTP_HOST and SMTP_PORT.';
      } else if (emailError.message) {
        errorMessage = `Email send failed: ${emailError.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: emailError.message || 'Unknown email error',
          code: emailError.code,
        },
        { status: 500 }
      );
    }

    // Update paymentLinkSentAt
    const now = new Date();
    await db.lead.update({
      where: { id },
      data: { paymentLinkSentAt: now },
    });
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: 'Payment link email sent',
      },
    });

    return NextResponse.json({ success: true, message: 'Payment link email sent' });
  } catch (error: any) {
    console.error('[API/Leads/Email/PaymentLink] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send payment link email', details: error.message },
      { status: 500 }
    );
  }
  /* eslint-enable */
}

