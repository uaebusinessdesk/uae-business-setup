import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/reset-master
 * Master reset - resets all workflow fields from agent assignment onwards
 * Requires password "9211" for security
 * No safety blocks - resets everything regardless of state
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
    const { password, reason } = body;

    // Validate password
    if (password !== '9211') {
      return NextResponse.json(
        { ok: false, error: 'Invalid password' },
        { status: 403 }
      );
    }

    // Verify lead exists
    const lead = await db.lead.findUnique({ 
      where: { id },
      select: { id: true }
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Reset ALL workflow fields from agent assignment onwards
    const resetData: any = {
      // Agent Assignment Fields
      assignedAgent: 'unassigned',
      agentContactedAt: null,
      bankDealAgentContactedAt: null,

      // Feasibility & Quote Amounts
      feasible: null,
      quotedAmountAed: null,
      bankQuotedAmountAed: null,
      bankDealQuotedAmountAed: null,

      // Company Quote Workflow
      companyQuoteSentAt: null,
      quoteViewedAt: null,
      proceedConfirmedAt: null,
      quoteApprovedAt: null,
      approved: null,
      quoteDeclinedAt: null,
      quoteDeclineReason: null,
      quoteQuestionsAt: null,
      quoteQuestionsReason: null,
      quoteWhatsAppSentAt: null,
      quoteWhatsAppMessageId: null,

      // Company Invoice Workflow
      companyInvoiceSentAt: null,
      companyInvoiceNumber: null,
      companyInvoiceVersion: 1,
      companyInvoiceAmountAed: null,
      companyInvoicePaymentLink: null,
      companyInvoiceHtml: null,
      companyInvoiceViewedAt: null,
      companyPaymentLink: null,
      paymentLinkSentAt: null,

      // Company Payment & Completion
      paymentReceivedAt: null,
      companyCompletedAt: null,
      paymentReminderSentAt: null,
      paymentReminderCount: 0,

      // Company Decline
      declinedAt: null,
      declineReason: null,
      declineStage: null,

      // Bank Quote Workflow
      bankQuoteSentAt: null,
      bankQuoteViewedAt: null,
      bankProceedConfirmedAt: null,
      bankQuoteApprovedAt: null,
      bankApproved: null,
      bankQuoteDeclinedAt: null,
      bankQuoteDeclineReason: null,
      bankQuoteQuestionsAt: null,
      bankQuoteQuestionsReason: null,

      // Bank Invoice Workflow
      bankInvoiceSentAt: null,
      bankInvoiceNumber: null,
      bankInvoiceVersion: 1,
      bankInvoiceAmountAed: null,
      bankInvoicePaymentLink: null,
      bankInvoiceHtml: null,
      bankPaymentLink: null,

      // Bank Payment & Completion
      bankPaymentReceivedAt: null,
      bankCompletedAt: null,
      bankPaymentReminderSentAt: null,
      bankPaymentReminderCount: 0,

      // Bank Decline
      bankDeclinedAt: null,
      bankDeclineReason: null,
      bankDeclineStage: null,

      // Bank Deal Workflow
      bankDealQuoteSentAt: null,
      bankDealQuoteViewedAt: null,
      bankDealQuoteApprovedAt: null,
      bankDealProceedConfirmedAt: null,
      bankDealQuoteDeclinedAt: null,
      bankDealQuoteDeclineReason: null,
      bankDealPaymentLink: null,
      bankDealInvoiceNumber: null,
      bankDealInvoiceAmountAed: null,
      bankDealInvoicePaymentLink: null,
      bankDealInvoiceSentAt: null,
      bankDealPaymentReceivedAt: null,
      bankDealPaymentReminderSentAt: null,
      bankDealPaymentReminderCount: 0,
      bankDealCompletedAt: null,
      bankDealDeclinedAt: null,
      bankDealDeclineReason: null,

      // Approval Fields
      approvalRequestedAt: null,
      bankApprovalRequestedAt: null,
    };

    // Delete all agent assignments (LeadAgent records)
    await db.leadAgent.deleteMany({
      where: { leadId: id },
    });

    // Update the lead record
    await db.lead.update({
      where: { id },
      data: resetData,
    });

    // Log activity if reason provided
    if (reason) {
      try {
        const { logActivity } = await import('@/lib/activity');
        await logActivity(id, 'workflow_reset', `Master reset: ${reason}`);
      } catch (e) {
        // Activity logging is optional, don't fail if it errors
        console.error('[API/Leads/ResetMaster] Activity log error:', e);
      }
    }

    return NextResponse.json({ ok: true, message: 'Master reset completed successfully' });
  } catch (error: any) {
    console.error('[API/Leads/ResetMaster] Error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to reset workflow',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
