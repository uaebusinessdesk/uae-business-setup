import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

// Ziina payment link placeholder
const ZIINA_PAYMENT_LINK_PLACEHOLDER = process.env.ZIINA_PAYMENT_LINK || 'https://ziina.com/pay/placeholder';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { invoiceType, paymentLink } = body; // 'company' or 'bank', optional paymentLink

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({
      where: { id },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Validate prerequisites based on invoice type
    if (invoiceType === 'company') {
      if (!lead.quotedAmountAed) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Company quote amount must be set first' },
          { status: 400 }
        );
      }
      if (!lead.companyQuoteSentAt) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Company quote must be sent to customer first' },
          { status: 400 }
        );
      }
      // Payment link is optional - can be provided in request or already saved on lead
      if (paymentLink) {
        // Validate payment link if provided
        if (!paymentLink.startsWith('https://')) {
          return NextResponse.json(
            { error: 'Payment link must start with https://' },
            { status: 400 }
          );
        }
        try {
          new URL(paymentLink);
        } catch {
          return NextResponse.json(
            { error: 'Invalid payment link URL format' },
            { status: 400 }
          );
        }
      }
      if (lead.approved !== true) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Quote must be approved by customer first' },
          { status: 400 }
        );
      }
      if (lead.companyInvoiceNumber) {
        return NextResponse.json(
          { error: 'Company invoice already generated. Use the existing invoice.' },
          { status: 400 }
        );
      }
    } else if (invoiceType === 'bank') {
      if (!lead.bankQuotedAmountAed) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Bank quote amount must be set first' },
          { status: 400 }
        );
      }
      if (!lead.bankQuoteSentAt) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Bank quote must be sent to customer first' },
          { status: 400 }
        );
      }
      if (!lead.bankPaymentLink) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Bank payment link must be entered first' },
          { status: 400 }
        );
      }
      if (lead.bankApproved !== true) {
        return NextResponse.json(
          { error: 'Cannot generate invoice: Bank quote must be approved by customer first' },
          { status: 400 }
        );
      }
      if (lead.bankInvoiceNumber) {
        return NextResponse.json(
          { error: 'Bank invoice already generated. Use the existing invoice.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid invoice type. Must be "company" or "bank"' },
        { status: 400 }
      );
    }

    // Determine invoice details based on type
    let invoiceAmount: number;
    let invoiceNumber: string;
    let serviceDescription: string;

    if (invoiceType === 'company') {
      invoiceAmount = lead.quotedAmountAed!;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      invoiceNumber = `INV-COMP-${dateStr}-${randomStr}`;
      serviceDescription = `UAE ${lead.setupType === 'mainland' ? 'Mainland' : lead.setupType === 'freezone' ? 'Free Zone' : 'Offshore'} Company Formation - Documentation and Facilitation Services`;
    } else {
      invoiceAmount = lead.bankQuotedAmountAed!;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      invoiceNumber = `INV-BANK-${dateStr}-${randomStr}`;
      serviceDescription = 'UAE Bank Account Setup - Documentation and Facilitation Services';
    }

    // Extract lead reference from notes
    const leadRef = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i)?.[1] || 'N/A';

    // Use payment link from request body, then from lead, then fallback to placeholder
    const finalPaymentLink = invoiceType === 'company' 
      ? (paymentLink || lead.companyPaymentLink || ZIINA_PAYMENT_LINK_PLACEHOLDER)
      : (lead.bankPaymentLink || ZIINA_PAYMENT_LINK_PLACEHOLDER);

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml({
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      clientName: lead.fullName,
      clientEmail: lead.email || '',
      clientWhatsApp: lead.whatsapp,
      serviceDescription,
      amount: invoiceAmount,
      paymentLink: finalPaymentLink,
      leadRef,
    });

    // Update lead with invoice details
    if (invoiceType === 'company') {
      const updateData: any = {
        companyInvoiceNumber: invoiceNumber,
        companyInvoiceLink: `${process.env.ADMIN_BASE_URL || 'http://localhost:3000'}/api/admin/leads/${id}/invoice/${invoiceType}/view?number=${invoiceNumber}`,
        companyInvoiceSentAt: new Date(),
        approvalRequestedAt: new Date(),
      };
      // Save payment link if provided in request
      if (paymentLink) {
        updateData.companyPaymentLink = paymentLink;
      }
      await db.lead.update({
        where: { id },
        data: updateData,
      });
      await logActivity(id, 'company_invoice_generated', `Company invoice ${invoiceNumber} generated and sent`);
    } else {
      await db.lead.update({
        where: { id },
        data: {
          bankInvoiceNumber: invoiceNumber,
          bankInvoiceLink: `${process.env.ADMIN_BASE_URL || 'http://localhost:3000'}/api/admin/leads/${id}/invoice/${invoiceType}/view?number=${invoiceNumber}`,
          bankInvoiceSentAt: new Date(),
          bankApprovalRequestedAt: new Date(),
        },
      });
      await logActivity(id, 'bank_invoice_generated', `Bank invoice ${invoiceNumber} generated and sent`);
    }

    // Send invoice email to client
    if (lead.email) {
      try {
        await sendEmail({
          to: lead.email,
          subject: `Invoice ${invoiceNumber} - UAE Business Desk`,
          html: invoiceHtml,
        });
        await logActivity(id, 'invoice_email_sent', `Invoice email sent to ${lead.email}`);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Fetch updated lead to get persisted payment link
    let updatedLead;
    if (invoiceType === 'company') {
      updatedLead = await db.lead.findUnique({ where: { id } });
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      invoiceLink: `${process.env.ADMIN_BASE_URL || 'http://localhost:3000'}/api/admin/leads/${id}/invoice/${invoiceType}/view?number=${invoiceNumber}`,
      companyPaymentLink: invoiceType === 'company' ? (updatedLead as any)?.companyPaymentLink : undefined,
    });
  } catch (error: any) {
    console.error('Invoice generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateInvoiceHtml(data: {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientEmail: string;
  clientWhatsApp: string;
  serviceDescription: string;
  amount: number;
  paymentLink: string;
  leadRef: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber} - UAE Business Desk</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .invoice-wrapper {
      max-width: 900px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #0b2a4a 0%, #1a3d5f 100%);
      color: #ffffff;
      padding: 40px 50px;
      position: relative;
      overflow: hidden;
    }
    .invoice-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }
    .invoice-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 50%;
    }
    .company-info {
      position: relative;
      z-index: 1;
    }
    .company-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .company-tagline {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 400;
    }
    .invoice-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 30px;
      position: relative;
      z-index: 1;
    }
    .invoice-title {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -1px;
      opacity: 0.95;
    }
    .invoice-meta-box {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 20px 24px;
      border-radius: 8px;
      text-align: right;
    }
    .invoice-meta-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .invoice-meta-box p {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .invoice-body {
      padding: 50px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .info-section {
      background: #f8fafc;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid #c9a14a;
    }
    .info-section h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .info-section p {
      color: #1a202c;
      margin: 4px 0;
      font-size: 15px;
    }
    .info-section strong {
      font-size: 16px;
      color: #0b2a4a;
      font-weight: 600;
    }
    .items-section {
      margin: 40px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .items-table thead {
      background: linear-gradient(135deg, #0b2a4a 0%, #1a3d5f 100%);
    }
    .items-table th {
      color: #ffffff;
      padding: 18px 20px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th:last-child {
      text-align: right;
    }
    .items-table tbody tr {
      background: #ffffff;
      transition: background 0.2s;
    }
    .items-table tbody tr:hover {
      background: #f8fafc;
    }
    .items-table td {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 15px;
      color: #1a202c;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .total-box {
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border: 2px solid #c9a14a;
      border-radius: 8px;
      padding: 24px 32px;
      min-width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .total-label {
      font-size: 16px;
      color: #64748b;
      font-weight: 500;
    }
    .total-amount {
      font-size: 28px;
      font-weight: 700;
      color: #0b2a4a;
      letter-spacing: -0.5px;
    }
    .payment-section {
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border: 2px solid #c9a14a;
      border-radius: 12px;
      padding: 32px;
      margin: 40px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .payment-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 200px;
      height: 200px;
      background: rgba(201, 161, 74, 0.1);
      border-radius: 50%;
    }
    .payment-section h3 {
      color: #0b2a4a;
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }
    .payment-section p {
      color: #475569;
      margin: 8px 0;
      font-size: 15px;
      position: relative;
      z-index: 1;
    }
    .payment-button {
      display: inline-block;
      background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 20px;
      box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
      transition: all 0.3s;
      position: relative;
      z-index: 1;
    }
    .payment-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(201, 161, 74, 0.4);
    }
    .payment-note {
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
      position: relative;
      z-index: 1;
    }
    .important-note {
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #856404;
      line-height: 1.7;
    }
    .important-note strong {
      display: block;
      margin-bottom: 6px;
      font-size: 15px;
    }
    .footer {
      background: #f8fafc;
      padding: 30px 50px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .footer-section {
      text-align: left;
    }
    .footer-section h4 {
      color: #0b2a4a;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .footer-section p {
      color: #64748b;
      font-size: 13px;
      margin: 4px 0;
      line-height: 1.6;
    }
    .footer-bottom {
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 12px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .invoice-wrapper {
        box-shadow: none;
        border-radius: 0;
      }
      .payment-button {
        display: none;
      }
    }
    @media (max-width: 768px) {
      .invoice-header {
        padding: 30px 24px;
      }
      .invoice-body {
        padding: 30px 24px;
      }
      .invoice-title-section {
        flex-direction: column;
        gap: 20px;
      }
      .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .total-box {
        min-width: 100%;
      }
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <div class="company-info">
        <div class="company-name">UAE Business Desk</div>
        <div class="company-tagline">Business Setup & Corporate Services</div>
      </div>
      <div class="invoice-title-section">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta-box">
          <h3>Invoice Number</h3>
          <p>${data.invoiceNumber}</p>
        </div>
      </div>
    </div>

    <div class="invoice-body">
      <div class="info-grid">
        <div class="info-section">
          <h3>Bill To</h3>
          <p><strong>${data.clientName}</strong></p>
          ${data.clientEmail ? `<p style="color: #64748b;">${data.clientEmail}</p>` : ''}
          <p style="color: #64748b;">${data.clientWhatsApp}</p>
        </div>
        <div class="info-section">
          <h3>Invoice Details</h3>
          <p><strong>Date:</strong> ${data.invoiceDate}</p>
          <p><strong>Reference:</strong> ${data.leadRef}</p>
          <p><strong>Payment Terms:</strong> Due on Receipt</p>
        </div>
      </div>

      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${data.serviceDescription}</strong>
                <br>
                <span style="color: #64748b; font-size: 13px;">Professional documentation preparation and application facilitation services</span>
              </td>
              <td style="text-align: right; font-weight: 600;">${data.amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-box">
            <div class="total-row">
              <span class="total-label">Total Amount Due</span>
              <span class="total-amount">AED ${data.amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="payment-section">
        <h3>Payment Instructions</h3>
        <p>Please complete payment via Ziina using the secure link below:</p>
        <a href="${data.paymentLink}" class="payment-button">Pay via Ziina</a>
        <p class="payment-note">
          <strong>Important:</strong> Payment must be received before work commences. 
          This invoice is valid for 30 days from the date of issue.
        </p>
      </div>

      <div class="important-note">
        <strong>Service Disclaimer</strong>
        We provide documentation preparation and application facilitation services only. 
        Approval decisions are made by UAE authorities and banks based on their policies and client eligibility. 
        Final approval is subject to regulatory compliance and individual circumstances.
      </div>
    </div>

    <div class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Company</h4>
          <p>Capo Fin FZE</p>
          <p>Business Center</p>
          <p>Sharjah Publishing City</p>
          <p>Sharjah, United Arab Emirates</p>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p>Phone: +971 50 420 9110</p>
          <p>Email: support@uaebusinessdesk.com</p>
          <p>WhatsApp: +971 50 420 9110</p>
        </div>
        <div class="footer-section">
          <h4>Business Hours</h4>
          <p>Sunday - Thursday</p>
          <p>9:00 AM - 6:00 PM GST</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} UAE Business Desk. All rights reserved.</p>
        <p>This is an electronically generated invoice and is valid without signature.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

