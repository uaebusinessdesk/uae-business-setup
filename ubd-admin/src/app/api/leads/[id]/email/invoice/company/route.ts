import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildCompanyInvoiceEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';
import { createInvoiceToken } from '@/lib/invoice-token';

export const dynamic = 'force-dynamic';

/**
 * Generate clean HTML snapshot for invoice view page
 */
function generateInvoiceHtml(
  lead: any,
  invoiceNumber: string,
  paymentLink: string,
  isRevisedInvoice: boolean
): string {
  const setupTypeLabel = lead.setupType === 'mainland' ? 'Mainland' : 
                         lead.setupType === 'freezone' ? 'Free Zone' : 
                         lead.setupType === 'offshore' ? 'Offshore' : lead.setupType;
  
  const formattedAmount = lead.quotedAmountAed?.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }) || 'N/A';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #c9a14a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0b2a4a;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      flex-wrap: wrap;
      gap: 20px;
    }
    .invoice-meta div {
      flex: 1;
      min-width: 200px;
    }
    .invoice-meta strong {
      color: #0b2a4a;
      display: block;
      margin-bottom: 5px;
    }
    .content {
      margin: 30px 0;
    }
    .invoice-details {
      background-color: #f8f9fa;
      border-left: 4px solid #c9a14a;
      padding: 20px;
      margin: 20px 0;
    }
    .invoice-details p {
      margin: 10px 0;
      font-size: 16px;
    }
    .invoice-details strong {
      color: #0b2a4a;
    }
    .amount-section {
      text-align: center;
      margin: 30px 0;
      padding: 30px;
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border: 2px solid #c9a14a;
      border-radius: 8px;
    }
    .amount-section .amount-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    .amount-section .amount-value {
      font-size: 36px;
      font-weight: bold;
      color: #0b2a4a;
    }
    .payment-section {
      text-align: center;
      margin: 30px 0;
      padding: 25px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .payment-button {
      display: inline-block;
      background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%);
      color: #ffffff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 15px 0;
      box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
    }
    .payment-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(201, 161, 74, 0.4);
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .footer p {
      margin: 5px 0;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
      }
      .payment-section {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>Invoice</h1>
      <div class="invoice-meta">
        <div>
          <strong>Invoice Number</strong>
          ${invoiceNumber}
        </div>
        <div>
          <strong>Date</strong>
          ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
    
    <div class="content">
      <p><strong>Bill To:</strong></p>
      <p>${lead.fullName || 'Valued Client'}</p>
      ${lead.email ? `<p>${lead.email}</p>` : ''}
      ${lead.whatsapp ? `<p>${lead.whatsapp}</p>` : ''}
      
      ${isRevisedInvoice ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404;"><strong>Note:</strong> This is a revised invoice based on your latest request.</p>
      </div>
      ` : ''}
      
      <div class="invoice-details">
        <p><strong>Service:</strong> ${setupTypeLabel} Company Setup</p>
        <p><strong>Description:</strong> UAE Business Desk company incorporation and setup services</p>
      </div>
      
      <div class="amount-section">
        <div class="amount-label">Total Amount Due</div>
        <div class="amount-value">${formattedAmount}</div>
      </div>
      
      ${paymentLink ? `
      <div class="payment-section">
        <h2 style="color: #0b2a4a; margin-bottom: 15px;">Complete Your Payment</h2>
        <p style="margin-bottom: 20px;">Please complete your payment using the secure link below:</p>
        <a href="${paymentLink}" class="payment-button">Pay Now via Ziina</a>
        <p style="margin-top: 15px; font-size: 13px; color: #666;">
          Once payment is received, we will begin the documentation process and keep you updated on the progress.
        </p>
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
    </div>
    
    <div class="footer">
      <p><strong>${process.env.BRAND_NAME || 'UAE Business Desk'}</strong></p>
      <p>${process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@uaebusinessdesk.com'}</p>
      <p>+971 50 420 9110</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * POST /api/leads/[id]/email/invoice/company
 * Send company invoice email to lead
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
    const body = await req.json().catch(() => ({}));
    const { paymentLink } = body;

    // Try to find lead in both tables (include invoice version field)
    let lead = await db.lead.findUnique({ 
      where: { id },
      select: {
        id: true,
        fullName: true,
        whatsapp: true,
        email: true,
        nationality: true,
        residenceCountry: true,
        setupType: true,
        activity: true,
        shareholdersCount: true,
        visasRequired: true,
        visasCount: true,
        timeline: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        assignedAgent: true,
        agentContactedAt: true,
        feasible: true,
        quotedAmountAed: true,
        companyQuoteSentAt: true,
        companyPaymentLink: true,
        internalNotes: true,
        approvalRequestedAt: true,
        approved: true,
        quoteApprovedAt: true,
        proceedConfirmedAt: true,
        paymentReceivedAt: true,
        companyCompletedAt: true,
        hasBankProject: true,
        bankQuotedAmountAed: true,
        bankQuoteSentAt: true,
        bankPaymentLink: true,
        bankApprovalRequestedAt: true,
        bankApproved: true,
        bankPaymentReceivedAt: true,
        bankCompletedAt: true,
        companyInvoiceNumber: true,
        companyInvoiceLink: true,
        companyInvoiceSentAt: true,
        companyInvoiceVersion: true,
        bankInvoiceNumber: true,
        bankInvoiceLink: true,
        bankInvoiceSentAt: true,
        googleReviewRequestedAt: true,
      }
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }


    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    // Block if payment already received
    if (lead.paymentReceivedAt) {
      return NextResponse.json({ error: 'Cannot send invoice after payment is received' }, { status: 400 });
    }

    // Validate approval: proceedConfirmedAt OR approved OR quoteApprovedAt
    const isApproved = lead.proceedConfirmedAt || lead.approved === true || lead.quoteApprovedAt;
    if (!isApproved) {
      return NextResponse.json({ error: 'Quote must be approved before sending invoice' }, { status: 400 });
    }

    // Determine invoice version
    // If companyInvoiceSentAt exists AND paymentReceivedAt is null: increment version
    // Otherwise: set version = 1
    const isRevisedInvoice = !!(lead.companyInvoiceSentAt && !lead.paymentReceivedAt);
    const currentInvoiceVersion = lead.companyInvoiceVersion || 1;
    const newInvoiceVersion = isRevisedInvoice ? currentInvoiceVersion + 1 : 1;
    
    // Generate invoice number: "UBD-C-{YYYYMMDD}-{last4id}-R{version}"
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const last4Id = id.slice(-4).toUpperCase();
    const invoiceNumber = `UBD-C-${dateStr}-${last4Id}-R${newInvoiceVersion}`;

    // Validate paymentLink if provided
    const finalPaymentLink = paymentLink || lead.companyPaymentLink;
    if (!finalPaymentLink) {
      return NextResponse.json({ error: 'Payment link is required' }, { status: 400 });
    }

    // Validate payment link is HTTPS URL
    try {
      const url = new URL(finalPaymentLink);
      if (url.protocol !== 'https:') {
        return NextResponse.json({ error: 'Payment link must use HTTPS' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid payment link URL format' }, { status: 400 });
    }

    // Generate invoice view token and URL
    const invoiceToken = await createInvoiceToken({ leadId: id });
    const baseUrl =
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3001';
    const invoiceViewUrl = `${baseUrl}/invoice/view?token=${invoiceToken}`;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Invoice Email] invoiceViewUrl:', invoiceViewUrl);
    }
    
    // Build email with payment link and view URL (pass isRevised flag)
    // Temporarily set invoice number on lead for template
    const leadWithInvoiceNumber = { ...lead, companyInvoiceNumber: invoiceNumber };
    const { subject: templateSubject, body: emailBody, htmlBody } = buildCompanyInvoiceEmail(leadWithInvoiceNumber, finalPaymentLink, isRevisedInvoice, invoiceViewUrl);
    
    // Override subject if revised invoice (version > 1)
    const formattedAmount = lead.quotedAmountAed?.toLocaleString('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }) || 'N/A';
    const subject = newInvoiceVersion > 1
      ? `Revised Invoice R${newInvoiceVersion}: ${invoiceNumber}`
      : templateSubject;

    // Generate invoice HTML snapshot (clean version for public view) - used in both phases
    const invoiceHtml = generateInvoiceHtml(lead, invoiceNumber, finalPaymentLink, isRevisedInvoice);

    // ===== PHASE 1: Build invoice + Send email =====
    let emailSent = false;
    try {
      // Send email
      await sendCustomerEmail({
        to: lead.email,
        subject,
        html: htmlBody || emailBody.replace(/\n/g, '<br>'),
      }, 'invoice');
      
      emailSent = true;
    } catch (emailError: any) {
      // Phase 1 failed - email sending failed
      console.error('[API/Leads/Email/Invoice/Company] Phase 1 failed - Email send error:', emailError);
      return NextResponse.json({
        ok: false,
        message: 'Failed to send invoice email',
        error: emailError.message || 'Email sending failed',
        ...(process.env.NODE_ENV !== 'production' && { debug: String(emailError) }),
      }, { status: 500 });
    }

    // ===== PHASE 2: Update Lead invoice snapshot + Create CompanyInvoiceRevision =====
    const now = new Date();
    let dbUpdateSuccess = false;
    let updatedLead: any = null;
    let dbError: any = null;

    try {
      
      // Update invoice fields: amount, version, number, sent timestamp, payment link, and HTML snapshot
      const updateData: any = {
        companyInvoiceSentAt: now,
        companyInvoiceAmountAed: lead.quotedAmountAed, // Store current quote amount
        companyInvoiceVersion: newInvoiceVersion,
        companyInvoiceNumber: invoiceNumber,
        companyInvoicePaymentLink: finalPaymentLink, // Store payment link specifically for this invoice
        companyInvoiceHtml: invoiceHtml, // Store HTML snapshot
        paymentLinkSentAt: now, // Set at same time for backward compatibility
        companyPaymentLink: finalPaymentLink, // Always persist the payment link used
      };

      const updatedLead = await db.lead.update({
        where: { id },
        data: updateData,
      });
      await db.leadActivity.create({
        data: {
          leadId: id,
          action: 'email_sent',
          message: isRevisedInvoice 
            ? `Revised company invoice (v${newInvoiceVersion}) email sent with payment link`
            : 'Company invoice email sent with payment link',
        },
      });
        
      // Create invoice revision record for history
      try {
        await db.companyInvoiceRevision.upsert({
          where: {
            leadId_version: {
              leadId: id,
              version: newInvoiceVersion,
            },
          },
          create: {
            leadId: id,
            version: newInvoiceVersion,
            invoiceNumber: invoiceNumber,
            amountAed: lead.quotedAmountAed!,
            paymentLink: finalPaymentLink,
            html: invoiceHtml,
            sentAt: now,
          },
          update: {
            invoiceNumber: invoiceNumber,
            amountAed: lead.quotedAmountAed!,
            paymentLink: finalPaymentLink,
            html: invoiceHtml,
            sentAt: now,
          },
        });
      } catch (revisionError) {
        // Log but don't fail the invoice send if revision creation fails
        console.error('[API/Leads/Email/Invoice/Company] Failed to create invoice revision:', revisionError);
        dbError = revisionError;
      }
      
      dbUpdateSuccess = true;
    } catch (dbUpdateError: any) {
      // Phase 2 failed - DB update failed
      dbError = dbUpdateError;
      console.error('[API/Leads/Email/Invoice/Company] Phase 2 failed - DB update error:', dbUpdateError);
    }

    // ===== Response: Always return success if email was sent =====
    if (emailSent) {
      const response: any = {
        ok: true,
        message: isRevisedInvoice 
          ? `Revised invoice ${invoiceNumber} sent successfully`
          : `Invoice ${invoiceNumber} sent successfully`,
        invoiceViewUrl: invoiceViewUrl,
        companyInvoiceNumber: invoiceNumber,
        companyInvoiceVersion: newInvoiceVersion,
      };

      if (dbUpdateSuccess && updatedLead) {
        // Both phases succeeded
        response.companyInvoiceSentAt = updatedLead.companyInvoiceSentAt;
      } else {
        // Phase 1 succeeded but Phase 2 failed
        response.warning = 'Email sent but invoice record update failed';
        if (process.env.NODE_ENV !== 'production') {
          response.debug = dbError instanceof Error ? dbError.message : String(dbError);
        }
      }

      return NextResponse.json(response, { status: 200 });
    }

    // This should never be reached, but just in case
    return NextResponse.json({
      ok: false,
      message: 'Failed to send invoice email',
      error: 'Unknown error',
    }, { status: 500 });
  } catch (error: any) {
    // Catch-all for any unexpected errors
    console.error('[API/Leads/Email/Invoice/Company] Unexpected error:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to send company invoice email',
      error: error.message || 'Unknown error',
      ...(process.env.NODE_ENV !== 'production' && { debug: String(error) }),
    }, { status: 500 });
  }
}

