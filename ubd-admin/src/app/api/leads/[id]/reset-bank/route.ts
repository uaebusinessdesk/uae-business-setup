import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/reset-bank
 * Reset bank workflow for a lead (production-safe)
 * Hard-blocks reset if bank payment received or bank completed
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
    const { reason } = body;

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({ 
      where: { id },
      select: {
        bankPaymentReceivedAt: true,
        bankCompletedAt: true,
      }
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Hard-block reset if bank payment received or bank completed
    if (lead.bankPaymentReceivedAt || lead.bankCompletedAt) {
      return NextResponse.json(
        { ok: false, error: 'Cannot reset after bank payment received or completion.' },
        { status: 400 }
      );
    }

    // Reset bank quote/invoice decision workflow fields
    const resetData: any = {
      // Bank quote workflow
      bankQuoteSentAt: null,
      bankQuoteViewedAt: null,
      bankProceedConfirmedAt: null,
      bankQuoteApprovedAt: null,
      bankApproved: null,
      bankQuoteDeclinedAt: null,
      bankQuoteDeclineReason: null,
      bankQuoteQuestionsAt: null,
      bankQuoteQuestionsReason: null,
      // Bank invoice workflow
      bankInvoiceSentAt: null,
      bankInvoiceNumber: null,
      bankInvoiceVersion: 1,
      bankInvoiceAmountAed: null,
      bankInvoicePaymentLink: null,
      bankInvoiceHtml: null,
      // Bank payment reminders
      bankPaymentReminderSentAt: null,
      bankPaymentReminderCount: 0,
      // Bank decline/close (reset these too)
      bankDeclinedAt: null,
      bankDeclineReason: null,
      bankDeclineStage: null,
    };

    // DEV: Log fields being cleared
    if (process.env.NODE_ENV !== 'production') {
      const clearedFields = Object.keys(resetData).filter(key => resetData[key] !== undefined);
      console.log(`[ResetBank] Clearing fields: ${clearedFields.join(', ')}`);
    }

    // Update the lead record
    await db.lead.update({
      where: { id },
      data: resetData,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[API/Leads/ResetBank] Error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to reset bank workflow',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

