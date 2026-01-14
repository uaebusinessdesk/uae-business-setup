import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quote/view
 * Track when customer views the quote decision page
 * Body: { token: string }
 * ⚠️ QUOTE VIEWED NOTIFICATION - FINALIZED & APPROVED ⚠️
 * This notification has been reviewed and approved.
 * Admin receives email notification when customer views the quote.
 * Please do not modify without careful review and approval.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token
    const payload = await verifyApprovalToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please use the link from your quote email.' },
        { status: 401 }
      );
    }

    // Extract project (default to 'company' for backward compatibility)
    const project = payload.project || 'company';

    const now = new Date();

    // Fetch lead
    let lead: any = null;
    try {
      lead = await db.lead.findUnique({ where: { id: payload.leadId } });
    } catch (dbError: any) {
      console.error('quote view error', dbError);
      const isDev = process.env.NODE_ENV !== 'production';
      const errorResponse: any = {
        ok: false,
        error: 'Failed to fetch lead from database',
      };
      if (isDev) {
        errorResponse.debug = dbError instanceof Error ? dbError.message : String(dbError);
      }
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: 'Quote not found or link expired.' },
        { status: 404 }
      );
    }

    // Only set if not already set (prevent duplicate tracking) - based on project
    const viewedAtField = project === 'bank-deal'
      ? (lead as any).bankDealQuoteViewedAt
      : project === 'bank'
      ? lead.bankQuoteViewedAt
      : lead.quoteViewedAt;
    
    // Check if quote was actually sent (prevent notifications after master reset)
    const quoteSentAt = project === 'bank-deal'
      ? (lead as any).bankDealQuoteSentAt
      : project === 'bank'
      ? lead.bankQuoteSentAt
      : lead.companyQuoteSentAt;
    
    // Only track view and send notification if quote was actually sent
    if (!viewedAtField && quoteSentAt) {
      try {
        const updateData: any = project === 'bank-deal'
          ? { bankDealQuoteViewedAt: now }
          : project === 'bank'
          ? { bankQuoteViewedAt: now }
          : { quoteViewedAt: now };
        
        const message = project === 'bank-deal'
          ? 'Bank Deal quote decision page viewed by customer'
          : project === 'bank'
          ? 'Bank quote decision page viewed by customer'
          : 'Quote decision page viewed by customer';
        
        await db.lead.update({
          where: { id: payload.leadId },
          data: updateData,
        });
        await logActivity(payload.leadId, project === 'bank-deal' ? 'bank_deal_quote_viewed' : 'quote_viewed', message);
        
        // Send admin notification (only on first view and if quote was sent)
        try {
          const quoteAmount = project === 'bank-deal'
            ? (lead as any).bankDealQuotedAmountAed
            : project === 'bank'
            ? lead.bankQuotedAmountAed
            : lead.quotedAmountAed;
          const fullName = lead.fullName || 'Unknown';
          const email = lead.email || 'No email';
          const amountStr = quoteAmount ? `AED ${quoteAmount.toLocaleString()}` : 'Amount not set';
          const projectType = project === 'bank-deal' ? 'bank' : project as 'bank' | 'company';
          
          await notifyAdmin({
            event: 'quote_viewed',
            leadId: payload.leadId,
            project: projectType,
            subject: `[Quote Viewed] Lead ${fullName} – ${amountStr}`,
            lines: [
              `${project === 'bank-deal' ? 'Bank Deal quote' : projectType === 'bank' ? 'Bank quote' : 'Company quote'} viewed by customer`,
              `Lead: ${fullName}`,
              `Email: ${email}`,
              `Amount: ${amountStr}`,
              `Project: ${project === 'bank-deal' ? 'Bank Deal' : projectType === 'bank' ? 'Bank' : 'Company'}`,
              `Viewed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
            ],
          });
        } catch (notifyError) {
          console.error('Failed to send admin notification:', notifyError);
          // Don't fail the request if notification fails
        }
      } catch (updateError: any) {
        console.error('quote view error', updateError);
        // Don't fail the request if tracking fails, just log it
      }
    }

    return NextResponse.json({
      ok: true,
      state: {
        viewedAt: viewedAtField || now.toISOString(),
        alreadyViewed: !!viewedAtField,
      },
    });
  } catch (error: any) {
    console.error('quote view error', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to track quote view',
    };
    if (isDev) {
      errorResponse.debug = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

