import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/debug/reset-quote
 * DEV-ONLY: Reset quote workflow timestamps for testing
 * Returns 404 with JSON in production
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // DEV-ONLY: Return 404 with JSON in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate lead id safely from params
    let id: string;
    try {
      const paramsObj = await params;
      id = paramsObj?.id;
      if (!id || typeof id !== 'string' || id.trim() === '') {
        return NextResponse.json(
          { ok: false, error: 'Invalid lead ID' },
          { status: 400 }
        );
      }
    } catch (paramError: any) {
      console.error('reset-quote failed: invalid params', paramError);
      return NextResponse.json(
        { ok: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Find lead
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Reset only known-safe nullable fields that definitely exist in the schema
    const resetData: {
      companyQuoteSentAt: null;
      quoteViewedAt: null;
      proceedConfirmedAt: null;
      quoteApprovedAt: null;
      approved: false;
      quoteDeclinedAt: null;
      quoteDeclineReason: null;
      companyInvoiceSentAt: null;
      paymentReceivedAt: null;
      companyCompletedAt: null;
      companyPaymentLink: null;
      quoteWhatsAppSentAt: null;
      quoteWhatsAppMessageId: null;
    } = {
      companyQuoteSentAt: null,
      quoteViewedAt: null,
      proceedConfirmedAt: null,
      quoteApprovedAt: null,
      approved: false,
      quoteDeclinedAt: null,
      quoteDeclineReason: null,
      companyInvoiceSentAt: null,
      paymentReceivedAt: null,
      companyCompletedAt: null,
      companyPaymentLink: null,
      quoteWhatsAppSentAt: null,
      quoteWhatsAppMessageId: null,
    };

    // Track which fields were cleared for response
    const clearedFields = Object.keys(resetData);

    // Update the lead record
    await db.lead.update({
      where: { id },
      data: resetData,
    });

    return NextResponse.json({ 
      ok: true, 
      cleared: clearedFields 
    });
  } catch (error: any) {
    console.error('reset-quote failed', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Reset failed. See server logs.',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
