import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildBankInvoiceEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';
import { createInvoiceToken } from '@/lib/invoice-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generate clean HTML snapshot for bank invoice view page
 */
function generateInvoiceHtml(
  lead: any,
  invoiceNumber: string,
  paymentLink: string,
  isRevisedInvoice: boolean
): string {
  const formattedAmount = lead.bankQuotedAmountAed?.toLocaleString('en-AE', {
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
        <p><strong>Service:</strong> Bank Account Documentation Support</p>
        <p><strong>Description:</strong> UAE Business Desk bank account setup and documentation services</p>
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
          Once payment is received, we will begin the bank account application process and keep you updated on the progress.
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
 * POST /api/leads/[id]/email/invoice/bank
 * Send bank invoice email to lead
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
    const body = await req.json().catch(() => ({}));
    const { paymentLink } = body;

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({ 
      where: { id },
      select: {
        id: true,
        fullName: true,
        whatsapp: true,
        email: true,
        bankQuotedAmountAed: true,
        bankQuoteSentAt: true,
        bankPaymentLink: true,
        bankProceedConfirmedAt: true,
        bankQuoteApprovedAt: true,
        bankApproved: true,
        bankPaymentReceivedAt: true,
        bankInvoiceNumber: true,
        bankInvoiceVersion: true,
        bankInvoiceSentAt: true,
      }
    });

    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ ok: false, error: 'Lead has no email address' }, { status: 400 });
    }

    // Block if payment already received
    if (lead.bankPaymentReceivedAt) {
      return NextResponse.json({ ok: false, error: 'Cannot send invoice after payment is received' }, { status: 400 });
    }

    // Validate bank approval: bankProceedConfirmedAt OR bankApproved OR bankQuoteApprovedAt
    const isApproved = lead.bankProceedConfirmedAt || lead.bankApproved === true || lead.bankQuoteApprovedAt;
    if (!isApproved) {
      return NextResponse.json({ ok: false, error: 'Bank quote must be approved before sending invoice' }, { status: 400 });
    }

    // Determine invoice version
    const isRevisedInvoice = !!(lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt);
    const currentInvoiceVersion = lead.bankInvoiceVersion || 1;
    const newInvoiceVersion = isRevisedInvoice ? currentInvoiceVersion + 1 : 1;
    
    // Generate invoice number: "UBD-B-{YYYYMMDD}-{last4id}-R{version}"
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const last4Id = id.slice(-4).toUpperCase();
    const invoiceNumber = `UBD-B-${dateStr}-${last4Id}-R${newInvoiceVersion}`;

    // Validate paymentLink if provided
    const finalPaymentLink = paymentLink || lead.bankPaymentLink;
    if (!finalPaymentLink) {
      return NextResponse.json({ ok: false, error: 'Payment link is required' }, { status: 400 });
    }

    // Validate payment link is HTTPS URL
    try {
      const url = new URL(finalPaymentLink);
      if (url.protocol !== 'https:') {
        return NextResponse.json({ ok: false, error: 'Payment link must use HTTPS' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid payment link URL format' }, { status: 400 });
    }

    // Generate invoice view token and URL (with project="bank")
    const invoiceToken = await createInvoiceToken({ leadId: id, project: 'bank' });
    const baseUrl =
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3001';
    const invoiceViewUrl = `${baseUrl}/invoice/view?token=${invoiceToken}`;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Bank Invoice Email] invoiceViewUrl:', invoiceViewUrl);
    }
    
    // Build email with payment link and view URL
    const leadWithInvoiceNumber = { ...lead, bankInvoiceNumber: invoiceNumber };
    const { subject: templateSubject, body: emailBody, htmlBody } = buildBankInvoiceEmail(leadWithInvoiceNumber, finalPaymentLink, isRevisedInvoice, invoiceViewUrl);
    
    // Override subject if revised invoice (version > 1)
    const formattedAmount = lead.bankQuotedAmountAed?.toLocaleString('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }) || 'N/A';
    const subject = newInvoiceVersion > 1
      ? `Revised Invoice R${newInvoiceVersion}: ${invoiceNumber}`
      : templateSubject;

    // Generate invoice HTML snapshot
    const invoiceHtml = generateInvoiceHtml(lead, invoiceNumber, finalPaymentLink, isRevisedInvoice);

    // ===== PHASE 1: Build invoice + Send email =====
    let emailSent = false;
    try {
      await sendCustomerEmail({
        to: lead.email,
        subject,
        html: htmlBody || emailBody.replace(/\n/g, '<br>'),
      }, 'invoice');
      
      emailSent = true;
    } catch (emailError: any) {
      console.error('[API/Leads/Email/Invoice/Bank] Phase 1 failed - Email send error:', emailError);
      return NextResponse.json({
        ok: false,
        message: 'Failed to send invoice email',
        error: emailError.message || 'Email sending failed',
        ...(process.env.NODE_ENV !== 'production' && { debug: String(emailError) }),
      }, { status: 500 });
    }

    // ===== PHASE 2: Update Lead invoice snapshot + Create BankInvoiceRevision =====
    const now = new Date();
    let dbUpdateSuccess = false;
    let updatedLead: any = null;
    let dbError: any = null;

    try {
      const updateData: any = {
        bankInvoiceSentAt: now,
        bankInvoiceAmountAed: lead.bankQuotedAmountAed,
        bankInvoiceVersion: newInvoiceVersion,
        bankInvoiceNumber: invoiceNumber,
        bankInvoicePaymentLink: finalPaymentLink,
        bankInvoiceHtml: invoiceHtml,
        bankPaymentLink: finalPaymentLink,
      };

      updatedLead = await db.lead.update({
        where: { id },
        data: updateData,
      });
      await db.leadActivity.create({
        data: {
          leadId: id,
          action: 'email_sent',
          message: isRevisedInvoice 
            ? `Revised bank invoice (v${newInvoiceVersion}) email sent with payment link`
            : 'Bank invoice email sent with payment link',
        },
      });
      
      // Create invoice revision record for history
      try {
        await db.bankInvoiceRevision.upsert({
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
            amountAed: lead.bankQuotedAmountAed!,
            paymentLink: finalPaymentLink,
            html: invoiceHtml,
            sentAt: now,
          },
          update: {
            invoiceNumber: invoiceNumber,
            amountAed: lead.bankQuotedAmountAed!,
            paymentLink: finalPaymentLink,
            html: invoiceHtml,
            sentAt: now,
          },
        });
      } catch (revisionError) {
        console.error('[API/Leads/Email/Invoice/Bank] Failed to create invoice revision:', revisionError);
        dbError = revisionError;
      }
      
      dbUpdateSuccess = true;
    } catch (dbUpdateError: any) {
      dbError = dbUpdateError;
      console.error('[API/Leads/Email/Invoice/Bank] Phase 2 failed - DB update error:', dbUpdateError);
    }

    // ===== Response: Always return success if email was sent =====
    if (emailSent) {
      const response: any = {
        ok: true,
        message: isRevisedInvoice 
          ? `Revised invoice ${invoiceNumber} sent successfully`
          : `Invoice ${invoiceNumber} sent successfully`,
        invoiceViewUrl: invoiceViewUrl,
        bankInvoiceNumber: invoiceNumber,
        bankInvoiceVersion: newInvoiceVersion,
      };

      if (dbUpdateSuccess && updatedLead) {
        response.bankInvoiceSentAt = updatedLead.bankInvoiceSentAt;
      } else {
        response.warning = 'Email sent but invoice record update failed';
        if (process.env.NODE_ENV !== 'production') {
          response.debug = dbError instanceof Error ? dbError.message : String(dbError);
        }
      }

      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json({
      ok: false,
      message: 'Failed to send invoice email',
      error: 'Unknown error',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[API/Leads/Email/Invoice/Bank] Unexpected error:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to send bank invoice email',
      error: error.message || 'Unknown error',
      ...(process.env.NODE_ENV !== 'production' && { debug: String(error) }),
    }, { status: 500 });
  }
}
