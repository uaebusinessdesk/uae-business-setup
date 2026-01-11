import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quote/decline
 * Track when customer declines the quote
 * Body: { token: string, reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, reason } = body;

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
      console.error('quote decline error', dbError);
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

    // Check if already declined based on project
    const alreadyDeclinedField = project === 'bank' ? lead.bankQuoteDeclinedAt : lead.quoteDeclinedAt;
    if (alreadyDeclinedField) {
      const declineReasonField = project === 'bank' ? lead.bankQuoteDeclineReason : lead.quoteDeclineReason;
      return NextResponse.json({
        ok: true,
        state: {
          alreadyDeclined: true,
          quoteDeclinedAt: alreadyDeclinedField,
          quoteDeclineReason: declineReasonField,
          message: 'You have already declined this quote.',
        },
      });
    }

    // Update lead with decline based on project
    const updateData: any = {};
    
    if (project === 'bank') {
      updateData.bankQuoteDeclinedAt = now;
      updateData.bankApproved = false;
      
      // Store decline reason if provided
      if (reason && typeof reason === 'string' && reason.trim()) {
        updateData.bankQuoteDeclineReason = reason.trim();
      }
    } else {
      updateData.quoteDeclinedAt = now;
      updateData.approved = false;
      
      // Store decline reason if provided
      if (reason && typeof reason === 'string' && reason.trim()) {
        updateData.quoteDeclineReason = reason.trim();
      }
    }

    try {
      await db.lead.update({
        where: { id: payload.leadId },
        data: updateData,
      });
      const message = project === 'bank'
        ? (reason ? `Bank quote declined: ${reason}` : 'Bank quote declined by customer')
        : (reason ? `Quote declined: ${reason}` : 'Quote declined by customer');
      await logActivity(payload.leadId, 'quote_declined', message);
      
      // Send admin notification (only on first decline - already checked above)
      try {
        const quoteAmount = project === 'bank' ? lead.bankQuotedAmountAed : lead.quotedAmountAed;
        const fullName = lead.fullName || 'Unknown';
        const email = lead.email || 'No email';
        const amountStr = quoteAmount ? `AED ${quoteAmount.toLocaleString()}` : 'Amount not set';
        
        await notifyAdmin({
          event: 'quote_declined',
          leadId: payload.leadId,
          project: project === 'bank-deal' ? 'bank' : project as 'bank' | 'company',
          subject: `[Quote Declined] Lead ${fullName} – ${amountStr}`,
          lines: [
            `Quote declined by customer`,
            `Lead: ${fullName}`,
            `Email: ${email}`,
            `Amount: ${amountStr}`,
            `Project: ${project === 'bank' ? 'Bank' : 'Company'}`,
            ...(reason ? [`Reason: ${reason}`] : []),
            `Declined at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        });
      } catch (notifyError) {
        console.error('Failed to send admin notification:', notifyError);
        // Don't fail the request if notification fails
      }
    } catch (updateError: any) {
      console.error('quote decline error', updateError);
      const isDev = process.env.NODE_ENV !== 'production';
      const errorResponse: any = {
        ok: false,
        error: 'Failed to update lead',
      };
      if (isDev) {
        errorResponse.debug = updateError instanceof Error ? updateError.message : String(updateError);
      }
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Return response based on project
    if (project === 'bank') {
      return NextResponse.json({
        ok: true,
        state: {
          quoteDeclinedAt: now.toISOString(),
          quoteDeclineReason: updateData.bankQuoteDeclineReason || null,
          approved: false,
        },
      });
    } else {
      return NextResponse.json({
        ok: true,
        state: {
          quoteDeclinedAt: now.toISOString(),
          quoteDeclineReason: updateData.quoteDeclineReason || null,
          approved: false,
        },
      });
    }
  } catch (error: any) {
    console.error('quote decline error', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to process decline',
    };
    if (isDev) {
      errorResponse.debug = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

