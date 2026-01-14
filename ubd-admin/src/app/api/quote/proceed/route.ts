import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quote/proceed
 * Track when customer confirms to proceed with the quote
 * Body: { token: string }
 * ⚠️ QUOTE APPROVED NOTIFICATION - FINALIZED & APPROVED ⚠️
 * This notification has been reviewed and approved.
 * Admin receives email notification when customer approves the quote.
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
      console.error('quote proceed error', dbError);
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

    // Build update data based on project - only set timestamps if not already set
    const updateData: any = {};
    
    if (project === 'bank-deal') {
      // Set bankDealProceedConfirmedAt only if null
      if (!(lead as any).bankDealProceedConfirmedAt) {
        updateData.bankDealProceedConfirmedAt = now;
      }
      
      // Set bankDealQuoteApprovedAt only if null
      if (!(lead as any).bankDealQuoteApprovedAt) {
        updateData.bankDealQuoteApprovedAt = now;
      }
    } else if (project === 'bank') {
      updateData.bankApproved = true; // Always set to true when proceeding
      
      // Set bankProceedConfirmedAt only if null
      if (!lead.bankProceedConfirmedAt) {
        updateData.bankProceedConfirmedAt = now;
      }
      
      // Set bankQuoteApprovedAt only if null
      if (!lead.bankQuoteApprovedAt) {
        updateData.bankQuoteApprovedAt = now;
      }
    } else {
      updateData.approved = true; // Always set to true when proceeding
      
      // Set proceedConfirmedAt only if null
      if (!lead.proceedConfirmedAt) {
        updateData.proceedConfirmedAt = now;
      }
      
      // Set quoteApprovedAt only if null
      if (!lead.quoteApprovedAt) {
        updateData.quoteApprovedAt = now;
      }
    }
    
    // Track if this is a new proceed confirmation (for activity log)
    const isNewProceed = project === 'bank-deal'
      ? !(lead as any).bankDealProceedConfirmedAt
      : project === 'bank'
      ? !lead.bankProceedConfirmedAt
      : !lead.proceedConfirmedAt;

    try {
      const updatedLead = await db.lead.update({
        where: { id: payload.leadId },
        data: updateData,
      });
      
      // Only log activity if this is a new proceed confirmation
      if (isNewProceed) {
        const message = project === 'bank-deal'
          ? 'Customer confirmed to proceed with Bank Deal quote'
          : project === 'bank'
          ? 'Customer confirmed to proceed with bank quote'
          : 'Customer confirmed to proceed with quote';
        await logActivity(payload.leadId, project === 'bank-deal' ? 'bank_deal_quote_proceeded' : 'quote_proceeded', message);
      }
      
      // Send admin notification (only on first proceed)
      if (isNewProceed) {
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
            event: 'quote_proceeded',
            leadId: payload.leadId,
            project: projectType,
            subject: `[Quote Approved] Lead ${fullName} – ${amountStr}`,
            lines: [
              `${project === 'bank-deal' ? 'Bank Deal quote' : projectType === 'bank' ? 'Bank quote' : 'Company quote'} approved by customer`,
              `Lead: ${fullName}`,
              `Email: ${email}`,
              `Amount: ${amountStr}`,
              `Project: ${project === 'bank-deal' ? 'Bank Deal' : projectType === 'bank' ? 'Bank' : 'Company'}`,
              `Approved at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
            ],
          });
        } catch (notifyError) {
          console.error('Failed to send admin notification:', notifyError);
          // Don't fail the request if notification fails
        }
      }

      // Return response based on project
      if (project === 'bank') {
        return NextResponse.json({
          ok: true,
          proceedConfirmedAt: updatedLead.bankProceedConfirmedAt?.toISOString() || null,
          quoteApprovedAt: updatedLead.bankQuoteApprovedAt?.toISOString() || null,
          approved: updatedLead.bankApproved,
        });
      } else {
        return NextResponse.json({
          ok: true,
          proceedConfirmedAt: updatedLead.proceedConfirmedAt?.toISOString() || null,
          quoteApprovedAt: updatedLead.quoteApprovedAt?.toISOString() || null,
          approved: updatedLead.approved,
        });
      }
    } catch (updateError: any) {
      console.error('quote proceed error', updateError);
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
  } catch (error: any) {
    console.error('quote proceed error', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to process proceed confirmation',
    };
    if (isDev) {
      errorResponse.debug = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

