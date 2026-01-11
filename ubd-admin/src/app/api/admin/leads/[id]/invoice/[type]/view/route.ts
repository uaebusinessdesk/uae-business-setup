import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Ziina payment link placeholder
const ZIINA_PAYMENT_LINK_PLACEHOLDER = process.env.ZIINA_PAYMENT_LINK || 'https://ziina.com/pay/placeholder';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const { id, type } = await params;
    const invoiceType = type;
    const searchParams = request.nextUrl.searchParams;
    const invoiceNumber = searchParams.get('number');

    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return new NextResponse('Lead not found', { status: 404 });
    }

    // Verify invoice number matches
    if (invoiceType === 'company' && lead.companyInvoiceNumber !== invoiceNumber) {
      return new NextResponse('Invalid invoice number', { status: 403 });
    }
    if (invoiceType === 'bank' && lead.bankInvoiceNumber !== invoiceNumber) {
      return new NextResponse('Invalid invoice number', { status: 403 });
    }

    // Extract lead reference from notes
    const leadRef = lead.notes?.match(/Lead Reference:\s*([A-Z0-9-]+)/i)?.[1] || 'N/A';

    // Generate invoice HTML (same as in POST route)
    const invoiceHtml = generateInvoiceHtml({
      invoiceNumber: invoiceNumber || 'N/A',
      invoiceDate: (invoiceType === 'company' ? lead.companyInvoiceSentAt : lead.bankInvoiceSentAt)?.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }) || new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      clientName: lead.fullName,
      clientEmail: lead.email || '',
      clientWhatsApp: lead.whatsapp,
      serviceDescription: invoiceType === 'company' 
        ? `UAE ${lead.setupType === 'mainland' ? 'Mainland' : lead.setupType === 'freezone' ? 'Free Zone' : 'Offshore'} Company Formation - Documentation and Facilitation Services`
        : 'UAE Bank Account Setup - Documentation and Facilitation Services',
      amount: invoiceType === 'company' ? (lead.quotedAmountAed || 0) : (lead.bankQuotedAmountAed || 0),
      paymentLink: ZIINA_PAYMENT_LINK_PLACEHOLDER,
      leadRef,
    });

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Invoice view failed:', error);
    return new NextResponse('Failed to load invoice', { status: 500 });
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
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .invoice-container {
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #0b2a4a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0b2a4a;
      margin: 0;
      font-size: 28px;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }
    .invoice-meta div {
      flex: 1;
      min-width: 150px;
    }
    .invoice-meta h3 {
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
    }
    .invoice-meta p {
      color: #0b2a4a;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .client-info {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 30px;
    }
    .client-info h3 {
      color: #0b2a4a;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 12px 0;
    }
    .client-info p {
      margin: 4px 0;
      color: #333;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background-color: #0b2a4a;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .total-row {
      background-color: #faf8f3;
      font-weight: 600;
    }
    .total-row td {
      padding: 16px 12px;
      font-size: 18px;
      color: #0b2a4a;
    }
    .payment-section {
      background-color: #faf8f3;
      border-left: 4px solid #c9a14a;
      padding: 24px;
      border-radius: 6px;
      margin: 30px 0;
      text-align: center;
    }
    .payment-section h3 {
      color: #0b2a4a;
      margin: 0 0 12px 0;
      font-size: 18px;
    }
    .payment-section p {
      color: #64748b;
      margin: 8px 0;
      font-size: 14px;
    }
    .payment-button {
      display: inline-block;
      background-color: #c9a14a;
      color: #ffffff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 16px;
      font-size: 16px;
    }
    .payment-button:hover {
      background-color: #a8853a;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .important-note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 13px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>INVOICE</h1>
    </div>

    <div class="invoice-meta">
      <div>
        <h3>Invoice Number</h3>
        <p>${data.invoiceNumber}</p>
      </div>
      <div>
        <h3>Invoice Date</h3>
        <p>${data.invoiceDate}</p>
      </div>
      <div>
        <h3>Reference</h3>
        <p>${data.leadRef}</p>
      </div>
    </div>

    <div class="client-info">
      <h3>Bill To</h3>
      <p><strong>${data.clientName}</strong></p>
      ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
      <p>${data.clientWhatsApp}</p>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.serviceDescription}</td>
          <td style="text-align: right;">${data.amount.toLocaleString('en-AE')}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total Amount Due</strong></td>
          <td style="text-align: right;"><strong>AED ${data.amount.toLocaleString('en-AE')}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="payment-section">
      <h3>Payment Instructions</h3>
      <p>Please complete payment via Ziina using the link below:</p>
      <a href="${data.paymentLink}" class="payment-button">Pay via Ziina</a>
      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
        Payment must be received before work commences.
      </p>
    </div>

    <div class="important-note">
      <strong>Important:</strong> We provide documentation preparation and application facilitation services only. Approval decisions are made by UAE authorities and banks based on their policies and client eligibility.
    </div>

    <div class="footer">
      <p><strong>UAE Business Desk</strong></p>
      <p>Capo Fin FZE | Business Center, Sharjah Publishing City, Sharjah, United Arab Emirates</p>
      <p>+971 50 420 9110 | support@uaebusinessdesk.com</p>
    </div>
  </div>
</body>
</html>
  `;
}





