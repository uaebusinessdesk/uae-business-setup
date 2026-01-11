import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildBankQuoteEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';
import { createApprovalToken } from '@/lib/quote-approval-token';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/quote/bank
 * Send bank quote email to lead
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Try to find lead in both tables (select fields needed for validation)
    let lead = await db.lead.findUnique({ 
      where: { id },
      select: {
        id: true,
        email: true,
        bankQuotedAmountAed: true,
        bankQuoteSentAt: true,
        bankInvoiceSentAt: true,
        bankPaymentReceivedAt: true,
        fullName: true,
        whatsapp: true,
        bankPaymentLink: true,
        bankApprovalRequestedAt: true,
        bankApproved: true,
        hasBankProject: true,
        bankStage: true,
      }
    });

    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Validate bank project is enabled
    // Only standalone bank projects are supported (hasBankProject must be true)
    if (lead.hasBankProject !== true) {
      return NextResponse.json({ ok: false, error: 'Bank project is not enabled for this lead' }, { status: 400 });
    }

    if (!lead.email) {
      return NextResponse.json({ ok: false, error: 'Lead has no email address' }, { status: 400 });
    }

    // Guard: Cannot send new bank quote if invoice already sent and not paid
    if (lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt) {
      return NextResponse.json(
        { ok: false, error: 'Bank invoice already sent. Reset Bank Workflow before sending a new quote.' },
        { status: 400 }
      );
    }

    // Validate bank quote amount exists
    if (!lead.bankQuotedAmountAed) {
      return NextResponse.json({ ok: false, error: 'Bank quote amount not set' }, { status: 400 });
    }

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { ok: false, error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.' },
        { status: 500 }
      );
    }

    // Clear stale bank decision fields BEFORE generating token/email (safety net)
    const now = new Date();
    const clearData: any = {
      bankQuoteViewedAt: null,
      bankProceedConfirmedAt: null,
      bankQuoteApprovedAt: null,
      bankApproved: null,
      bankQuoteDeclinedAt: null,
      bankQuoteDeclineReason: null,
    };
    
    await db.lead.update({
      where: { id },
      data: clearData,
    });

    // Generate approval token with project="bank"
    const approvalToken = await createApprovalToken(id, 'Lead', 'bank');
    
    // Get base URL
    const baseUrl = 
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3001';
    
    // Build approval URL
    const approvalUrl = `${baseUrl}/quote/approve?token=${approvalToken}`;

    // Determine if this is a revised quote (check BEFORE updating bankQuoteSentAt)
    const isRevisedQuote = !!lead.bankQuoteSentAt;

    // Build email
    let subject: string;
    let body: string;
    let htmlBody: string | undefined;
    try {
      const emailData = buildBankQuoteEmail(lead, approvalUrl, isRevisedQuote);
      subject = emailData.subject;
      body = emailData.body;
      htmlBody = emailData.htmlBody;
    } catch (templateError: any) {
      console.error('[API/Leads/Email/Quote/Bank] Template build error:', templateError);
      return NextResponse.json(
        { 
          ok: false,
          error: 'Failed to build email template', 
          details: templateError.message || 'Unknown template error'
        },
        { status: 500 }
      );
    }

    if (!htmlBody) {
      return NextResponse.json(
        { ok: false, error: 'HTML email body not generated' },
        { status: 500 }
      );
    }

    // Send email
    try {
      await sendCustomerEmail({
        to: lead.email,
        subject,
        html: htmlBody,
      }, 'quote');
    } catch (emailError: any) {
      console.error('[API/Leads/Email/Quote/Bank] Email send error:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response,
        stack: emailError.stack,
      });
      
      // Provide more specific error message
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
          ok: false,
          error: errorMessage,
          details: emailError.message || 'Unknown email error',
          code: emailError.code,
          smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
          smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        },
        { status: 500 }
      );
    }

    // Update bankQuoteSentAt (decision fields already cleared above)
    await db.lead.update({
      where: { id },
      data: { 
        bankQuoteSentAt: now,
        bankApprovalRequestedAt: now,
      },
    });
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: 'Bank quote email sent',
      },
    });

    return NextResponse.json({ 
      ok: true,
      message: 'Bank quote email sent',
    });
  } catch (error: any) {
    console.error('[API/Leads/Email/Quote/Bank] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to send bank quote email', details: error.message },
      { status: 500 }
    );
  }
}
