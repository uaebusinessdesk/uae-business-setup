import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createInvoiceToken } from '@/lib/invoice-token';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/invoice/view-link?leadId=...
 * Generate invoice view URL for admin use
 */
export async function GET(req: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const versionParam = searchParams.get('version');
    const version = versionParam ? parseInt(versionParam, 10) : undefined;
    const project = searchParams.get('project') || 'company'; // 'company' or 'bank'

    if (!leadId) {
      return NextResponse.json({ ok: false, error: 'leadId is required' }, { status: 400 });
    }

    // If version is provided, verify that revision exists
    if (version !== undefined) {
      if (project === 'bank') {
        const revision = await db.bankInvoiceRevision.findUnique({
          where: {
            leadId_version: {
              leadId,
              version,
            },
          },
        });
        if (!revision) {
          return NextResponse.json({ ok: false, error: 'Bank invoice revision not found' }, { status: 404 });
        }
      } else {
        const revision = await db.companyInvoiceRevision.findUnique({
          where: {
            leadId_version: {
              leadId,
              version,
            },
          },
        });
        if (!revision) {
          return NextResponse.json({ ok: false, error: 'Invoice revision not found' }, { status: 404 });
        }
      }
    } else {
      // Verify invoice exists (latest)
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        select: {
          id: true,
          companyInvoiceSentAt: true,
          companyInvoiceHtml: true,
          bankInvoiceSentAt: true,
          bankInvoiceHtml: true,
        },
      });

      if (!lead) {
        return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
      }

      if (project === 'bank') {
        if (!lead.bankInvoiceSentAt || !lead.bankInvoiceHtml) {
          return NextResponse.json({ ok: false, error: 'Bank invoice not available' }, { status: 404 });
        }
      } else {
        if (!lead.companyInvoiceSentAt || !lead.companyInvoiceHtml) {
          return NextResponse.json({ ok: false, error: 'Invoice not available' }, { status: 404 });
        }
      }
    }

    // Generate invoice view token and URL
    const invoiceToken = await createInvoiceToken({ leadId, version, project: project as 'company' | 'bank' });
    const baseUrl = 
      process.env.ADMIN_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3001';
    const invoiceViewUrl = `${baseUrl}/invoice/view?token=${invoiceToken}`;

    return NextResponse.json({
      ok: true,
      invoiceViewUrl,
    });
  } catch (error: any) {
    console.error('[API/Invoice/View-Link] Error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to generate invoice view link',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

