import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { createInvoiceToken } from '@/lib/invoice-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leads/[id]/bank-invoices
 * Get bank invoice revision history for a lead
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

    // Fetch bank invoice revisions for this lead
    const revisions = await db.bankInvoiceRevision.findMany({
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

    // Generate view URLs for each revision
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.ADMIN_BASE_URL ||
      'http://localhost:3001';

    const revisionsWithUrls = await Promise.all(revisions.map(async (revision) => {
      const token = await createInvoiceToken({ leadId: id, version: revision.version, project: 'bank' });
      return {
        ...revision,
        viewUrl: `${baseUrl}/invoice/view?token=${token}`,
      };
    }));

    return NextResponse.json({
      ok: true,
      revisions: revisionsWithUrls.map(r => ({
        id: r.id,
        version: r.version,
        invoiceNumber: r.invoiceNumber,
        amountAed: r.amountAed,
        sentAt: r.sentAt,
        viewUrl: r.viewUrl,
      })),
    });
  } catch (error: any) {
    console.error('[API/Leads/BankInvoices] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch bank invoice revisions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




