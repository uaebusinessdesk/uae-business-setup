import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildBankDealQuoteEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';
import { createApprovalToken } from '@/lib/quote-approval-token';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/quote/bank-deal
 * Send Bank Deal quote email to lead
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find lead
    let lead = await db.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    if (!lead.bankDealQuotedAmountAed) {
      return NextResponse.json({ error: 'Bank Deal quote amount not set' }, { status: 400 });
    }

    // Guard: Prevent sending quote if invoice already sent (unless payment received)
    if (lead.bankDealInvoiceSentAt && !lead.bankDealPaymentReceivedAt) {
      return NextResponse.json(
        { ok: false, error: 'Bank Deal invoice already sent. Reset Quote Workflow before sending a new quote.' },
        { status: 400 }
      );
    }

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.' },
        { status: 500 }
      );
    }

    // Generate approval token and URL (project='bank-deal')
    const approvalToken = await createApprovalToken(id, 'Lead', 'bank-deal');
    
    // Get base URL with production validation
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = 
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3001';
    
    // Validate HTTPS in production
    if (isProduction) {
      try {
        const url = new URL(baseUrl);
        if (url.protocol !== 'https:') {
          throw new Error(
            `Base URL must use HTTPS in production. Current value: ${baseUrl}. ` +
            `Please set NEXT_PUBLIC_BASE_URL or ADMIN_BASE_URL to an HTTPS URL (e.g., https://yourdomain.com).`
          );
        }
      } catch (urlError: any) {
        if (urlError.message.includes('HTTPS')) {
          throw urlError;
        }
        throw new Error(
          `Invalid base URL format: ${baseUrl}. ` +
          `Please set NEXT_PUBLIC_BASE_URL or ADMIN_BASE_URL to a valid HTTPS URL in production.`
        );
      }
    }
    
    const approvalUrl = `${baseUrl}/quote/approve?token=${approvalToken}`;

    // Determine if this is a revised quote
    const isRevisedQuote = !!lead.bankDealQuoteSentAt;

    // Build email
    const { subject, body, htmlBody } = buildBankDealQuoteEmail(lead, approvalUrl, isRevisedQuote);

    // Send email
    await sendCustomerEmail({
      to: lead.email,
      subject,
      html: htmlBody || body.replace(/\n/g, '<br>'),
    }, 'quote');

    // Update lead: set bankDealQuoteSentAt timestamp
    const now = new Date();
    await db.lead.update({
      where: { id },
      data: {
        bankDealQuoteSentAt: now,
      },
    });

    // Log activity
    const { logActivity } = await import('@/lib/activity');
    await logActivity(id, 'bank_deal_quote_sent', `Bank Deal quote sent to ${lead.email}`);

    // Send WhatsApp notification if phone number available
    if (lead.whatsapp) {
      try {
        const message = `Hi ${lead.fullName},\n\nWe have sent you a Bank Deal quote via email. Please check your inbox and review the quote.\n\nThank you!`;
        await sendWhatsAppMessage(lead.whatsapp, message);
      } catch (waError) {
        console.error('Failed to send WhatsApp notification for Bank Deal quote:', waError);
        // Don't fail the request if WhatsApp fails
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Bank Deal quote email sent successfully',
      sentAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error sending Bank Deal quote email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send Bank Deal quote email' },
      { status: 500 }
    );
  }
}

