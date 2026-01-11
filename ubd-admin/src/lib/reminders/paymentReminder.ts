import { db } from '@/lib/db';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildPaymentReminderEmail } from '@/lib/emailTemplates';
import { notifyAdmin } from '@/lib/notifications/adminNotify';
import { createInvoiceToken } from '@/lib/invoice-token';

/**
 * Send payment reminder email for a lead
 * @param leadId - The lead ID to send reminder for
 * @param project - Project type: 'company', 'bank', or 'bank-deal' (defaults to 'company')
 * @returns Promise with ok status and optional error message
 */
export async function sendPaymentReminderEmail(
  leadId: string,
  project: 'company' | 'bank' | 'bank-deal' = 'company'
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Fetch lead with project-specific fields
    const selectFields: any = {
      id: true,
      fullName: true,
      email: true,
      declinedAt: true,
    };

    if (project === 'bank-deal') {
      selectFields.bankDealInvoiceSentAt = true;
      selectFields.bankDealInvoiceNumber = true;
      selectFields.bankDealInvoiceAmountAed = true;
      selectFields.bankDealInvoicePaymentLink = true;
      selectFields.bankDealPaymentReceivedAt = true;
      selectFields.bankDealDeclinedAt = true;
      selectFields.bankDealPaymentReminderSentAt = true;
      selectFields.bankDealPaymentReminderCount = true;
    } else if (project === 'bank') {
      selectFields.bankInvoiceSentAt = true;
      selectFields.bankInvoiceNumber = true;
      selectFields.bankInvoiceAmountAed = true;
      selectFields.bankInvoicePaymentLink = true;
      selectFields.bankPaymentReceivedAt = true;
      selectFields.bankDeclinedAt = true;
      selectFields.bankPaymentReminderSentAt = true;
      selectFields.bankPaymentReminderCount = true;
    } else {
      selectFields.companyInvoiceSentAt = true;
      selectFields.companyInvoiceNumber = true;
      selectFields.companyInvoiceAmountAed = true;
      selectFields.companyInvoicePaymentLink = true;
      selectFields.paymentReceivedAt = true;
      selectFields.paymentReminderSentAt = true;
      selectFields.paymentReminderCount = true;
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: selectFields,
    });

    if (!lead) {
      return { ok: false, error: 'Lead not found' };
    }

    // Validate email exists
    if (!lead.email) {
      return { ok: false, error: 'Lead has no email address' };
    }

    // Project-specific field access
    const invoiceSentAt = project === 'bank-deal'
      ? (lead as any).bankDealInvoiceSentAt
      : project === 'bank'
      ? (lead as any).bankInvoiceSentAt
      : (lead as any).companyInvoiceSentAt;
    const invoiceNumber = project === 'bank-deal'
      ? (lead as any).bankDealInvoiceNumber
      : project === 'bank'
      ? (lead as any).bankInvoiceNumber
      : (lead as any).companyInvoiceNumber;
    const invoiceAmountAed = project === 'bank-deal'
      ? (lead as any).bankDealInvoiceAmountAed
      : project === 'bank'
      ? (lead as any).bankInvoiceAmountAed
      : (lead as any).companyInvoiceAmountAed;
    const invoicePaymentLink = project === 'bank-deal'
      ? (lead as any).bankDealInvoicePaymentLink
      : project === 'bank'
      ? (lead as any).bankInvoicePaymentLink
      : (lead as any).companyInvoicePaymentLink;
    const paymentReceivedAt = project === 'bank-deal'
      ? (lead as any).bankDealPaymentReceivedAt
      : project === 'bank'
      ? (lead as any).bankPaymentReceivedAt
      : (lead as any).paymentReceivedAt;
    const declinedAt = project === 'bank-deal'
      ? (lead as any).bankDealDeclinedAt
      : project === 'bank'
      ? (lead as any).bankDeclinedAt
      : (lead as any).declinedAt;
    const reminderSentAt = project === 'bank-deal'
      ? (lead as any).bankDealPaymentReminderSentAt
      : project === 'bank'
      ? (lead as any).bankPaymentReminderSentAt
      : (lead as any).paymentReminderSentAt;
    const reminderCount = project === 'bank-deal'
      ? (lead as any).bankDealPaymentReminderCount
      : project === 'bank'
      ? (lead as any).bankPaymentReminderCount
      : (lead as any).paymentReminderCount;

    // Validate invoice has been sent
    if (!invoiceSentAt) {
      return { ok: false, error: 'Invoice must be sent before sending payment reminder' };
    }

    // Validate payment not received
    if (paymentReceivedAt) {
      return { ok: false, error: 'Payment has already been received' };
    }

    // Validate lead not declined
    if (declinedAt) {
      return { ok: false, error: 'Lead has been declined' };
    }

    // Validate payment link exists
    if (!invoicePaymentLink) {
      return { ok: false, error: 'Payment link is required' };
    }

    // Validate required invoice fields
    if (!invoiceNumber) {
      return { ok: false, error: 'Invoice number is required' };
    }

    if (!invoiceAmountAed) {
      return { ok: false, error: 'Invoice amount is required' };
    }

    // Removed 48-hour restriction - reminders can be sent manually at any time

    // Generate invoice view URL
    const invoiceToken = await createInvoiceToken({ 
      leadId: leadId, 
      project: project === 'bank-deal' ? 'bank-deal' : (project === 'bank' ? 'bank' : 'company')
    });
    const baseUrl =
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3001';
    const invoiceViewUrl = `${baseUrl}/invoice/view?token=${invoiceToken}`;

    // Build and send reminder email
    const { subject, body, htmlBody } = buildPaymentReminderEmail({
      customerName: lead.fullName || 'Valued Client',
      invoiceNumber: invoiceNumber,
      amountAed: invoiceAmountAed,
      paymentLink: invoicePaymentLink,
      invoiceViewUrl: invoiceViewUrl,
    });

    await sendCustomerEmail({
      to: lead.email,
      subject,
      html: htmlBody || body.replace(/\n/g, '<br>'),
    }, 'reminder');

    // Get current timestamp
    const now = new Date();

    // Update payment reminder fields based on project
    const updateData: any = {};
    if (project === 'bank-deal') {
      updateData.bankDealPaymentReminderSentAt = now;
      updateData.bankDealPaymentReminderCount = (reminderCount || 0) + 1;
    } else if (project === 'bank') {
      updateData.bankPaymentReminderSentAt = now;
      updateData.bankPaymentReminderCount = (reminderCount || 0) + 1;
    } else {
      updateData.paymentReminderSentAt = now;
      updateData.paymentReminderCount = (reminderCount || 0) + 1;
    }

    await db.lead.update({
      where: { id: leadId },
      data: updateData,
    });

    // Log activity
    const message = project === 'bank-deal'
      ? `Bank Deal payment reminder email sent (reminder #${(reminderCount || 0) + 1})`
      : project === 'bank'
      ? `Bank payment reminder email sent (reminder #${(reminderCount || 0) + 1})`
      : `Payment reminder email sent (reminder #${(reminderCount || 0) + 1})`;
    
    await db.leadActivity.create({
      data: {
        leadId: leadId,
        action: project === 'bank-deal' ? 'bank_deal_payment_reminder_sent' : 'email_sent',
        message,
      },
    });

    // Send admin notification (every time)
    try {
      const newReminderCount = (reminderCount || 0) + 1;
      const amountStr = invoiceAmountAed ? `AED ${invoiceAmountAed.toLocaleString()}` : 'Amount not set';
      
      await notifyAdmin({
        event: 'payment_reminder_sent',
        leadId,
        project,
        subject: `[Payment Reminder] Lead ${lead.fullName} – ${invoiceNumber || amountStr} (Reminder #${newReminderCount})`,
        lines: [
          `Payment reminder sent to customer`,
          `Lead: ${lead.fullName}`,
          `Email: ${lead.email || 'No email'}`,
          `Invoice: ${invoiceNumber || 'N/A'}`,
          `Amount: ${amountStr}`,
          `Project: ${project === 'bank' ? 'Bank' : 'Company'}`,
          `Reminder count: ${newReminderCount}`,
          `Sent at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
        ],
      });
    } catch (notifyError) {
      console.error('Failed to send admin notification:', notifyError);
      // Don't fail the reminder if notification fails
    }

    return { ok: true };
  } catch (error: any) {
    console.error(`[PaymentReminder] Error sending ${project} reminder for lead ${leadId}:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to send payment reminder',
    };
  }
}

