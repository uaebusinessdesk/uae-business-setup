import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/reset-quote
 * Reset quote workflow for a lead (production-safe)
 * Hard-blocks reset if payment received or company completed
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
        paymentReceivedAt: true,
        companyCompletedAt: true,
      }
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Hard-block reset if payment received or company completed
    if (lead.paymentReceivedAt || lead.companyCompletedAt) {
      return NextResponse.json(
        { ok: false, error: 'Cannot reset after payment received or completion.' },
        { status: 400 }
      );
    }

    // Reset only company quote/invoice decision workflow fields
    // Only include fields that exist on Lead model
    const resetData: any = {
      // Company quote workflow
      companyQuoteSentAt: null,
      quoteViewedAt: null,
      proceedConfirmedAt: null,
      quoteApprovedAt: null,
      approved: null, // Set to null (not false) - false means declined, null means no decision yet
      quoteDeclinedAt: null,
      quoteDeclineReason: null,
      quoteQuestionsAt: null,
      quoteQuestionsReason: null,
      // Company invoice workflow
      companyInvoiceSentAt: null,
      companyInvoiceNumber: null,
      companyInvoiceVersion: 1, // Reset to version 1
      companyInvoiceAmountAed: null,
      companyInvoicePaymentLink: null,
      companyInvoiceHtml: null,
      companyInvoiceViewedAt: null,
      // Payment reminders
      paymentReminderSentAt: null,
      paymentReminderCount: 0,
      // Company decline/close (reset these too)
      declinedAt: null,
      declineReason: null,
      declineStage: null,
    };

    // Update the lead record
    await db.lead.update({
      where: { id },
      data: resetData,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[API/Leads/ResetQuote] Error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to reset quote workflow',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

