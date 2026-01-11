import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leads/[id]/invoices
 * Get invoice revision history for a lead
 * Admin-only endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch invoice revisions for this lead
    const revisions = await db.companyInvoiceRevision.findMany({
      where: { leadId: id },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        invoiceNumber: true,
        amountAed: true,
        sentAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      revisions: revisions.map(r => ({
        id: r.id,
        version: r.version,
        invoiceNumber: r.invoiceNumber,
        amountAed: r.amountAed,
        sentAt: r.sentAt,
      })),
    });
  } catch (error: any) {
    console.error('[API/Leads/Invoices] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch invoice revisions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




