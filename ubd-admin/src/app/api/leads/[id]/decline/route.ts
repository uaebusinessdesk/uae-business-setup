import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/decline
 * Mark a lead as declined/closed
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
    const { reason, stage, project = 'company' } = body;

    // Default stage to "After Invoice" if not provided
    const declineStage = stage || 'After Invoice';

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({
      where: { id },
      select: {
        id: true,
        paymentReceivedAt: true,
        declinedAt: true,
        companyCompletedAt: true,
        bankPaymentReceivedAt: true,
        bankDeclinedAt: true,
        bankCompletedAt: true,
      },
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Allow declining even after payment/completion - user can change status from completed to declined
    const now = new Date();
    const updateData: any = {};

    if (project === 'bank') {
      updateData.bankDeclineStage = declineStage;
      updateData.bankDeclinedAt = now; // Always set declinedAt (allows changing from completed to declined)
      // Clear completion if declining from completed state
      if (lead.bankCompletedAt) {
        updateData.bankCompletedAt = null;
      }
      if (reason !== undefined && reason !== null) {
        updateData.bankDeclineReason = reason;
      }
    } else {
      updateData.declineStage = declineStage;
      updateData.declinedAt = now; // Always set declinedAt (allows changing from completed to declined)
      // Clear completion if declining from completed state
      if (lead.companyCompletedAt) {
        updateData.companyCompletedAt = null;
      }
      if (reason !== undefined && reason !== null) {
        updateData.declineReason = reason;
      }
    }

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    const activityMessage = project === 'bank'
      ? `Bank project marked as declined${reason ? `: ${reason}` : ''} (Stage: ${declineStage})`
      : `Lead marked as declined${reason ? `: ${reason}` : ''} (Stage: ${declineStage})`;
    
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: project === 'bank' ? 'bank_declined' : 'lead_declined',
        message: activityMessage,
      },
    });

    return NextResponse.json({
      ok: true,
      declinedAt: project === 'bank' ? updatedLead.bankDeclinedAt : updatedLead.declinedAt,
    });
  } catch (error: any) {
    console.error('[API/Leads/Decline] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to decline lead', details: error.message },
      { status: 500 }
    );
  }
}

