import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { db } from '@/lib/db';
import { createApprovalToken } from '@/lib/quote-approval-token';
import { buildQuoteReminderMessage } from '@/lib/messages';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/whatsapp/quote-notification
 * Manually send WhatsApp quote notification (admin fallback)
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
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const fullName = lead.fullName;
    const phoneNumber = (lead as any).phone || lead.whatsapp;
    const companyQuoteSentAt = lead.companyQuoteSentAt;
    const quoteWhatsAppSentAt = lead.quoteWhatsAppSentAt;

    // Check if quote has been sent
    if (!companyQuoteSentAt) {
      return NextResponse.json(
        { error: 'Company quote email must be sent first' },
        { status: 400 }
      );
    }

    // Check if WhatsApp already sent
    if (quoteWhatsAppSentAt) {
      return NextResponse.json(
        { error: 'WhatsApp notification already sent' },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'No phone number available for this lead' },
        { status: 400 }
      );
    }

    // Validate E.164 format (must start with +)
    const phoneE164 = phoneNumber.trim();
    if (!phoneE164.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format (e.g., +971501234567)' },
        { status: 400 }
      );
    }

    // For manual notification route, we can't reliably determine if quote is revised
    // Default to false (the quote email route handles revised quote detection)
    const isRevisedQuote = false;

    // Generate approval URL for the quote (if needed)
    let approvalUrl: string | undefined;
    try {
      const approvalToken = await createApprovalToken(id, 'Lead', 'company');
      const baseUrl = 
        process.env.ADMIN_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        'http://localhost:3001';
      approvalUrl = `${baseUrl}/quote/approve?token=${approvalToken}`;
    } catch (error) {
      // If token generation fails, continue without approvalUrl
      console.error('[API/Leads/WhatsApp/Quote-Notification] Failed to generate approval URL:', error);
    }

    // Build structured quote reminder message
    const message = buildQuoteReminderMessage(lead, approvalUrl, isRevisedQuote);

    // Send WhatsApp
    const result = await sendWhatsAppMessage(phoneE164, message);

    if (!result.ok) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to send WhatsApp message',
          code: result.code,
          userMessage: result.userMessage,
        },
        { status: result.code === 'WHATSAPP_DISABLED' ? 503 : 500 }
      );
    }

    // Update tracking fields on success
    const now = new Date();
    await db.lead.update({
      where: { id },
      data: {
        quoteWhatsAppSentAt: now,
        quoteWhatsAppMessageId: result.messageId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp quote notification sent',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('[API/Leads/WhatsApp/Quote-Notification] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp notification', details: error.message },
      { status: 500 }
    );
  }
}

