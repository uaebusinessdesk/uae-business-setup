import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { db } from '@/lib/db';

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

    // Extract firstName from fullName
    const firstName = fullName?.split(' ')[0] || fullName || 'there';

    // Build message (same as quote email route)
    const message = `Hi ${firstName}, your UAE Business Desk quote has been emailed to you. No payment is required at this stage. Please use the 'View Quote & Decide' link in the email to confirm whether you'd like to proceed.`;

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

