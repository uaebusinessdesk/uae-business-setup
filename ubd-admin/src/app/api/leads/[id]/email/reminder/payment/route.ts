import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendPaymentReminderEmail } from '@/lib/reminders/paymentReminder';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/reminder/payment
 * Send payment reminder email to lead
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
    const { project = 'company' } = body;

    // Validate project parameter
    if (project !== 'company' && project !== 'bank' && project !== 'bank-deal') {
      return NextResponse.json({ ok: false, error: 'Invalid project. Must be "company", "bank", or "bank-deal"' }, { status: 400 });
    }

    // Use shared helper to send reminder
    const result = await sendPaymentReminderEmail(id, project);

    if (!result.ok) {
      // Map error to appropriate HTTP status
      if (result.error === 'Lead not found') {
        return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
      }
      if (result.error?.includes('already been received') || 
          result.error?.includes('been declined') ||
          result.error?.includes('must be sent') ||
          result.error?.includes('required') ||
          result.error?.includes('48 hours')) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json(
        { ok: false, error: result.error || 'Failed to send payment reminder email' },
        { status: 500 }
      );
    }

    // Fetch updated lead to return current state
    const selectFields: any = project === 'bank-deal'
      ? {
          bankDealPaymentReminderSentAt: true,
          bankDealPaymentReminderCount: true,
        }
      : project === 'bank'
      ? {
          bankPaymentReminderSentAt: true,
          bankPaymentReminderCount: true,
        }
      : {
          paymentReminderSentAt: true,
          paymentReminderCount: true,
        };

    const updatedLead = await db.lead.findUnique({
      where: { id },
      select: selectFields,
    });

    if (project === 'bank-deal') {
      return NextResponse.json({
        ok: true,
        paymentReminderSentAt: (updatedLead as any)?.bankDealPaymentReminderSentAt,
        paymentReminderCount: (updatedLead as any)?.bankDealPaymentReminderCount,
        reminderCount: (updatedLead as any)?.bankDealPaymentReminderCount,
      });
    } else if (project === 'bank') {
      return NextResponse.json({
        ok: true,
        paymentReminderSentAt: (updatedLead as any)?.bankPaymentReminderSentAt,
        paymentReminderCount: (updatedLead as any)?.bankPaymentReminderCount,
        reminderCount: (updatedLead as any)?.bankPaymentReminderCount,
      });
    } else {
      return NextResponse.json({
        ok: true,
        paymentReminderSentAt: updatedLead?.paymentReminderSentAt,
        paymentReminderCount: updatedLead?.paymentReminderCount,
        reminderCount: updatedLead?.paymentReminderCount,
      });
    }
  } catch (error: any) {
    console.error('[API/Leads/Email/Reminder/Payment] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to send payment reminder email', details: error.message },
      { status: 500 }
    );
  }
}
