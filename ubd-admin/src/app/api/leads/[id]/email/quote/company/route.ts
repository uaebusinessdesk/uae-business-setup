import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildCompanyQuoteEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';
import { createApprovalToken } from '@/lib/quote-approval-token';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/quote/company
 * Send company quote email to lead
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

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    if (!lead.quotedAmountAed) {
      return NextResponse.json({ error: 'Company quote amount not set' }, { status: 400 });
    }

    // Guard: Prevent sending quote if invoice already sent (unless payment received)
    if (lead.companyInvoiceSentAt && !lead.paymentReceivedAt) {
      return NextResponse.json(
        { ok: false, error: 'Invoice already sent. Reset Quote Workflow before sending a new quote.' },
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

    // Generate approval token and URL (project='company')
    const approvalToken = await createApprovalToken(id, 'Lead', 'company');
    
    // Get base URL with production validation
    // In production, base URL must be HTTPS for security
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
        // If URL parsing fails, throw a clear error
        if (urlError.message.includes('HTTPS')) {
          throw urlError;
        }
        throw new Error(
          `Invalid base URL format: ${baseUrl}. ` +
          `Please set NEXT_PUBLIC_BASE_URL or ADMIN_BASE_URL to a valid HTTPS URL in production.`
        );
      }
    }
    // In development, allow HTTP (localhost) for local testing
    
    // Build approval URL
    // Note: If basePath is configured in next.config.ts, it must be included here:
    // const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // const approvalUrl = `${baseUrl}${basePath}/quote/approve?token=${approvalToken}`;
    // Currently no basePath is configured, so we use the direct path.
    const approvalUrl = `${baseUrl}/quote/approve?token=${approvalToken}`;

    // Determine if this is a revised quote (check BEFORE updating companyQuoteSentAt)
    const isRevisedQuote = !!lead.companyQuoteSentAt;

    // Build email
    let subject: string;
    let body: string;
    let htmlBody: string | undefined;
    try {
      const emailData = buildCompanyQuoteEmail(lead, approvalUrl, isRevisedQuote);
      subject = emailData.subject;
      body = emailData.body;
      htmlBody = emailData.htmlBody;
    } catch (templateError: any) {
      console.error('[API/Leads/Email/Quote/Company] Template build error:', templateError);
      return NextResponse.json(
        { 
          error: 'Failed to build email template', 
          details: templateError.message || 'Unknown template error'
        },
        { status: 500 }
      );
    }

    if (!htmlBody) {
      return NextResponse.json(
        { error: 'HTML email body not generated' },
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
      console.error('[API/Leads/Email/Quote/Company] Email send error:', {
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
          error: errorMessage,
          details: emailError.message || 'Unknown email error',
          code: emailError.code,
          smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
          smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        },
        { status: 500 }
      );
    }

    // Clear stale decision fields before sending new quote (prevents "Already proceeded" bug)
    const now = new Date();
    const updateData: any = {
      companyQuoteSentAt: now,
      // Clear decision fields to ensure fresh quote page
      quoteViewedAt: null,
      proceedConfirmedAt: null,
      quoteApprovedAt: null,
      approved: null, // Set to null (not false) - false means declined, null means no decision yet
      quoteDeclinedAt: null,
      quoteDeclineReason: null,
    };
    
    await db.lead.update({
      where: { id },
      data: updateData,
    });
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: 'Company quote email sent',
      },
    });

    // Attempt to send WhatsApp notification (non-blocking)
    let whatsappResult: { attempted: boolean; ok?: boolean; error?: string } = { attempted: false };
    let whatsappMessageId: string | undefined = undefined;
    
    try {
      // Get phone number (prefer phone, fallback to whatsapp)
      const phoneNumber = (lead as any).phone || lead.whatsapp;
      
      if (!phoneNumber) {
        console.log('[API/Leads/Email/Quote/Company] WhatsApp skipped: no phone number available');
        whatsappResult = { attempted: false };
      } else {
        // Validate E.164 format (must start with +)
        const phoneE164 = phoneNumber.trim();
        if (!phoneE164.startsWith('+')) {
          console.log('[API/Leads/Email/Quote/Company] WhatsApp skipped: phone number not in E.164 format', { phone: phoneE164 });
          whatsappResult = { attempted: false };
        } else {
          // Extract firstName from fullName
          const firstName = lead.fullName?.split(' ')[0] || lead.fullName || 'there';
          
          // Build message
          const message = `Hi ${firstName}, your UAE Business Desk quote has been emailed to you. No payment is required at this stage. Please use the 'View Quote' link in the email to confirm whether you'd like to proceed.`;
          
          // Send WhatsApp (non-blocking - don't throw)
          const result = await sendWhatsAppMessage(phoneE164, message);
          
          whatsappResult = {
            attempted: true,
            ok: result.ok,
            error: result.userMessage || result.error,
          };
          
          // Only set tracking fields if send succeeded
          if (result.ok && result.messageId) {
            whatsappMessageId = result.messageId;
            
            // Update tracking fields in database
            const updateData: any = {
              quoteWhatsAppSentAt: new Date(),
              quoteWhatsAppMessageId: result.messageId,
            };
            
            {
              await db.lead.update({
                where: { id },
                data: updateData,
              });
            }
          } else {
            console.error('[API/Leads/Email/Quote/Company] WhatsApp send failed:', result.error);
          }
        }
      }
    } catch (whatsappError: any) {
      // Log but don't fail the API response
      console.error('[API/Leads/Email/Quote/Company] WhatsApp notification error:', whatsappError.message || whatsappError);
      whatsappResult = {
        attempted: true,
        ok: false,
        error: whatsappError.message || 'Unknown error',
      };
      // Do not set tracking fields on error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Company quote email sent',
      whatsapp: whatsappResult,
    });
  } catch (error: any) {
    console.error('[API/Leads/Email/Quote/Company] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send company quote email', details: error.message },
      { status: 500 }
    );
  }
}

