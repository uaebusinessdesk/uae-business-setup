import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendCustomerEmail } from '@/lib/sendCustomerEmail';
import { buildCompletionEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/completion
 * Send completion email to lead (with Google review if first completion)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    // Determine if this is the first completion
    // First completion = company OR bank completes first (whichever happens first)
    const companyCompleted = lead.companyCompletedAt !== null;
    const bankCompleted = lead.bankCompletedAt !== null;
    const isFirstCompletion = !lead.googleReviewRequestedAt && (companyCompleted || bankCompleted);

    // Build email
    const { subject, body, htmlBody } = buildCompletionEmail(lead, isFirstCompletion);

    // Send email
    await sendCustomerEmail({
      to: lead.email,
      subject,
      html: htmlBody || body.replace(/\n/g, '<br>'),
    }, 'completion');

    // Update googleReviewRequestedAt if this is the first completion
    if (isFirstCompletion) {
      const now = new Date();
      await db.lead.update({
        where: { id },
        data: { googleReviewRequestedAt: now },
      });
    }

    // Log activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: `Completion email sent${isFirstCompletion ? ' (with Google review request)' : ''}`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Completion email sent',
      googleReviewRequested: isFirstCompletion,
    });
  } catch (error: any) {
    console.error('[API/Leads/Email/Completion] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send completion email', details: error.message },
      { status: 500 }
    );
  }
}

