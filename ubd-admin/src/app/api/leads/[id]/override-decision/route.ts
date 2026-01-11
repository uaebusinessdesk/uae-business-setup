import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/override-decision
 * Allow admin to manually override customer decision
 * Body: { project: 'company' | 'bank', decision: 'accept' | 'decline' | 'questions', reason?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { project, decision, reason } = body;

    if (!project || (project !== 'company' && project !== 'bank')) {
      return NextResponse.json(
        { error: 'Project must be "company" or "bank"' },
        { status: 400 }
      );
    }

    if (!decision || (decision !== 'accept' && decision !== 'decline' && decision !== 'questions')) {
      return NextResponse.json(
        { error: 'Decision must be "accept", "decline", or "questions"' },
        { status: 400 }
      );
    }

    // Fetch lead
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const updateData: any = {};

    if (project === 'bank') {
      if (decision === 'accept') {
        updateData.bankApproved = true;
        updateData.bankProceedConfirmedAt = now;
        updateData.bankQuoteApprovedAt = now;
        // Clear questions and decline if set
        updateData.bankQuoteQuestionsAt = null;
        updateData.bankQuoteQuestionsReason = null;
        updateData.bankQuoteDeclinedAt = null;
        updateData.bankQuoteDeclineReason = null;
      } else if (decision === 'decline') {
        updateData.bankApproved = false;
        updateData.bankQuoteDeclinedAt = now;
        if (reason) {
          updateData.bankQuoteDeclineReason = reason.trim();
        }
        // Clear questions and proceed if set
        updateData.bankQuoteQuestionsAt = null;
        updateData.bankQuoteQuestionsReason = null;
        updateData.bankProceedConfirmedAt = null;
        updateData.bankQuoteApprovedAt = null;
      } else if (decision === 'questions') {
        updateData.bankQuoteQuestionsAt = now;
        if (reason) {
          updateData.bankQuoteQuestionsReason = reason.trim();
        }
        // Do NOT set bankApproved = false or bankQuoteDeclinedAt
        // Clear proceed if set
        updateData.bankProceedConfirmedAt = null;
        updateData.bankQuoteApprovedAt = null;
        updateData.bankQuoteDeclinedAt = null;
        updateData.bankQuoteDeclineReason = null;
      }
    } else {
      // company
      if (decision === 'accept') {
        updateData.approved = true;
        updateData.proceedConfirmedAt = now;
        updateData.quoteApprovedAt = now;
        // Clear questions and decline if set
        updateData.quoteQuestionsAt = null;
        updateData.quoteQuestionsReason = null;
        updateData.quoteDeclinedAt = null;
        updateData.quoteDeclineReason = null;
      } else if (decision === 'decline') {
        updateData.approved = false;
        updateData.quoteDeclinedAt = now;
        if (reason) {
          updateData.quoteDeclineReason = reason.trim();
        }
        // Clear questions and proceed if set
        updateData.quoteQuestionsAt = null;
        updateData.quoteQuestionsReason = null;
        updateData.proceedConfirmedAt = null;
        updateData.quoteApprovedAt = null;
      } else if (decision === 'questions') {
        updateData.quoteQuestionsAt = now;
        if (reason) {
          updateData.quoteQuestionsReason = reason.trim();
        }
        // Do NOT set approved = false or quoteDeclinedAt
        // Clear proceed if set
        updateData.proceedConfirmedAt = null;
        updateData.quoteApprovedAt = null;
        updateData.quoteDeclinedAt = null;
        updateData.quoteDeclineReason = null;
      }
    }

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    const activityMessage = project === 'bank'
      ? `Bank quote decision overridden by admin: ${decision}${reason ? ` (${reason})` : ''}`
      : `Quote decision overridden by admin: ${decision}${reason ? ` (${reason})` : ''}`;
    await logActivity(id, 'admin_override_decision', activityMessage);

    return NextResponse.json({
      success: true,
      decision,
      project,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error('[API/Leads/Override-Decision] Error:', error);
    return NextResponse.json(
      { error: 'Failed to override decision', details: error.message },
      { status: 500 }
    );
  }
}

