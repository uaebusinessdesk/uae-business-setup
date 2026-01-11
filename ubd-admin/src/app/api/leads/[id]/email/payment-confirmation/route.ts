import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildPaymentConfirmationEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/payment-confirmation
 * Send payment confirmation email to lead
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
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    // Build email
    const { subject, body, htmlBody } = buildPaymentConfirmationEmail(lead);

    // Send email
    await sendCustomerEmail({
      to: lead.email,
      subject,
      html: htmlBody || body.replace(/\n/g, '<br>'),
    }, 'payment-confirmation');

    // Log activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: 'Payment confirmation email sent',
      },
    });

    return NextResponse.json({ success: true, message: 'Payment confirmation email sent' });
  } catch (error: any) {
    console.error('[API/Leads/Email/Payment-Confirmation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send payment confirmation email', details: error.message },
      { status: 500 }
    );
  }
}

