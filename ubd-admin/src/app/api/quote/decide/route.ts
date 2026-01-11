import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quote/decide
 * Handle quote decision (proceed, decline, or questions)
 * Body: { token: string, decision: 'proceed' | 'decline' | 'questions' }
 * ⚠️ QUOTE APPROVED NOTIFICATION - FINALIZED & APPROVED ⚠️
 * This notification has been reviewed and approved.
 * Admin receives email notification when customer approves the quote via decision page.
 * Please do not modify without careful review and approval.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, decision, questionsReason } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (decision !== 'proceed' && decision !== 'decline' && decision !== 'questions') {
      return NextResponse.json({ error: 'Decision must be "proceed", "decline", or "questions"' }, { status: 400 });
    }

    // Verify token
    const payload = await verifyApprovalToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const now = new Date();
    
    // Extract project (default to 'company' for backward compatibility)
    const project = payload.project || 'company';

    // Check current state
    const lead = await db.lead.findUnique({ where: { id: payload.leadId } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if already decided - return success response instead of error
    const isAlreadyProceeded = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteApprovedAt || (lead as any).bankDealProceedConfirmedAt)
      : project === 'bank'
      ? (lead.bankQuoteApprovedAt || lead.bankProceedConfirmedAt || lead.bankApproved === true)
      : (lead.quoteApprovedAt || lead.proceedConfirmedAt || lead.approved === true);
    
    if (isAlreadyProceeded) {
      const proceedDate = project === 'bank-deal'
        ? ((lead as any).bankDealProceedConfirmedAt || (lead as any).bankDealQuoteApprovedAt || lead.updatedAt)
        : project === 'bank'
        ? (lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.updatedAt)
        : (lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.updatedAt);
      return NextResponse.json({
        success: true,
        decision: 'proceed',
        alreadyProceeded: true,
        date: proceedDate,
      }, { status: 200 });
    }

    // Check if already has questions - return success response instead of error
    const isAlreadyHasQuestions = project === 'bank'
      ? (lead.bankQuoteQuestionsAt)
      : (lead.quoteQuestionsAt);
    
    if (isAlreadyHasQuestions && decision === 'questions') {
      const questionsDate = project === 'bank'
        ? (lead.bankQuoteQuestionsAt || lead.updatedAt)
        : (lead.quoteQuestionsAt || lead.updatedAt);
      return NextResponse.json({
        success: true,
        decision: 'questions',
        alreadyHasQuestions: true,
        date: questionsDate,
      }, { status: 200 });
    }

    // Check if already declined - return success response instead of error
    const isAlreadyDeclined = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteDeclinedAt)
      : project === 'bank'
      ? (lead.bankQuoteDeclinedAt || lead.bankApproved === false)
      : (lead.quoteDeclinedAt || lead.approved === false);
    
    if (isAlreadyDeclined) {
      const declineDate = project === 'bank-deal'
        ? ((lead as any).bankDealQuoteDeclinedAt || lead.updatedAt)
        : project === 'bank'
        ? (lead.bankQuoteDeclinedAt || lead.updatedAt)
        : (lead.quoteDeclinedAt || lead.updatedAt);
      return NextResponse.json({
        success: true,
        decision: 'decline',
        alreadyDeclined: true,
        date: declineDate,
      }, { status: 200 });
    }

    // Update based on decision
    if (decision === 'proceed') {
      const updateData: any = {};
      
      if (project === 'bank-deal') {
        updateData.bankDealProceedConfirmedAt = now;
        updateData.bankDealQuoteApprovedAt = now;
      } else if (project === 'bank') {
        updateData.bankApproved = true;
        updateData.bankProceedConfirmedAt = now;
        updateData.bankQuoteApprovedAt = now;
      } else {
        updateData.approved = true;
        updateData.proceedConfirmedAt = now;
        updateData.quoteApprovedAt = now;
      }
      
      const updatedLead = await db.lead.update({
        where: { id: payload.leadId },
        data: updateData,
      });
      
      const activityMessage = project === 'bank-deal'
        ? 'Bank Deal quote approved by customer via decision page'
        : project === 'bank'
        ? 'Bank quote approved by customer via decision page'
        : 'Quote approved by customer via decision page';
      await logActivity(payload.leadId, project === 'bank-deal' ? 'bank_deal_quote_approved' : 'quote_approved', activityMessage);
      
      // Send admin notification
      try {
        const quoteAmount = project === 'bank-deal'
          ? (updatedLead as any).bankDealQuotedAmountAed
          : project === 'bank'
          ? updatedLead.bankQuotedAmountAed
          : updatedLead.quotedAmountAed;
        const fullName = updatedLead.fullName || 'Unknown';
        const email = updatedLead.email || 'No email';
        const amountStr = quoteAmount ? `AED ${quoteAmount.toLocaleString()}` : 'Amount not set';
        const projectType = project === 'bank-deal' ? 'bank' : project as 'bank' | 'company';
        
        await notifyAdmin({
          event: 'quote_approved',
          leadId: payload.leadId,
          project: projectType,
          subject: `[Quote Approved] Lead ${fullName} – ${amountStr}`,
          lines: [
            `Quote approved by customer`,
            `Lead: ${fullName}`,
            `Email: ${email}`,
            `Amount: ${amountStr}`,
            `Project: ${project === 'bank' ? 'Bank' : 'Company'}`,
            `Approved at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        });
      } catch (notifyError) {
        console.error('Failed to send admin notification:', notifyError);
        // Don't fail the request if notification fails
      }
    } else if (decision === 'decline') {
      // decline
      const updateData: any = {};
      
      if (project === 'bank-deal') {
        updateData.bankDealQuoteDeclinedAt = now;
      } else if (project === 'bank') {
        updateData.bankApproved = false;
        updateData.bankQuoteDeclinedAt = now;
      } else {
        updateData.approved = false;
        updateData.quoteDeclinedAt = now;
      }
      
      await db.lead.update({
        where: { id: payload.leadId },
        data: updateData,
      });
      
      const activityMessage = project === 'bank-deal'
        ? 'Bank Deal quote declined by customer via decision page'
        : project === 'bank'
        ? 'Bank quote declined by customer via decision page'
        : 'Quote declined by customer via decision page';
      await logActivity(payload.leadId, project === 'bank-deal' ? 'bank_deal_quote_declined' : 'quote_declined', activityMessage);
      
      // Send admin notification
      try {
        const updatedLead = await db.lead.findUnique({ where: { id: payload.leadId } });
        if (!updatedLead) {
          throw new Error('Lead not found after update');
        }
        
        const quoteAmount = project === 'bank-deal'
          ? (updatedLead as any).bankDealQuotedAmountAed
          : project === 'bank'
          ? updatedLead.bankQuotedAmountAed
          : updatedLead.quotedAmountAed;
        const fullName = updatedLead.fullName || 'Unknown';
        const email = updatedLead.email || 'No email';
        const amountStr = quoteAmount ? `AED ${quoteAmount.toLocaleString()}` : 'Amount not set';
        const projectType = project === 'bank-deal' ? 'bank' : project as 'bank' | 'company';
        
        // Get decline reason if available
        const declineReason = project === 'bank-deal'
          ? ((updatedLead as any).bankDealQuoteDeclineReason || null)
          : project === 'bank'
          ? (updatedLead.bankQuoteDeclineReason || null)
          : (updatedLead.quoteDeclineReason || null);
        
        await notifyAdmin({
          event: 'quote_declined',
          leadId: payload.leadId,
          project: projectType,
          subject: `[Quote Declined] Lead ${fullName} – ${amountStr}`,
          lines: [
            `Quote declined by customer`,
            `Lead: ${fullName}`,
            `Email: ${email}`,
            `Amount: ${amountStr}`,
            `Project: ${project === 'bank' ? 'Bank' : 'Company'}`,
            ...(declineReason ? [`Reason: ${declineReason}`] : []),
            `Declined at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        });
      } catch (notifyError) {
        console.error('Failed to send admin notification:', notifyError);
        // Don't fail the request if notification fails
      }
    } else if (decision === 'questions') {
      // questions - pause workflow, don't decline
      const updateData: any = {};
      
      if (project === 'bank') {
        updateData.bankQuoteQuestionsAt = now;
        if (questionsReason) {
          updateData.bankQuoteQuestionsReason = questionsReason;
        }
        // Do NOT set bankApproved = false or bankQuoteDeclinedAt
      } else {
        updateData.quoteQuestionsAt = now;
        if (questionsReason) {
          updateData.quoteQuestionsReason = questionsReason;
        }
        // Do NOT set approved = false or quoteDeclinedAt
      }
      
      const updatedLead = await db.lead.update({
        where: { id: payload.leadId },
        data: updateData,
      });
      
      const activityMessage = project === 'bank'
        ? 'Bank quote - customer has questions'
        : 'Quote - customer has questions';
      await logActivity(payload.leadId, 'quote_questions', activityMessage);
      
      // Send admin notification
      try {
        const quoteAmount = project === 'bank'
          ? updatedLead.bankQuotedAmountAed
          : updatedLead.quotedAmountAed;
        const fullName = updatedLead.fullName || 'Unknown';
        const email = updatedLead.email || 'No email';
        const amountStr = quoteAmount ? `AED ${quoteAmount.toLocaleString()}` : 'Amount not set';
        
        await notifyAdmin({
          event: 'quote_questions',
          leadId: payload.leadId,
          project: project === 'bank' ? 'bank' : 'company',
          subject: `[Quote Questions] Lead ${fullName} – ${amountStr}`,
          lines: [
            `Customer has questions about the quote`,
            `Lead: ${fullName}`,
            `Email: ${email}`,
            `Amount: ${amountStr}`,
            `Project: ${project === 'bank' ? 'Bank' : 'Company'}`,
            `Questions received at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
            ...(questionsReason ? [`Customer's Questions:`, questionsReason] : []),
            `Note: Workflow is paused. Please contact the customer to answer their questions.`,
          ],
        });
      } catch (notifyError) {
        console.error('Failed to send admin notification:', notifyError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      decision,
      date: now.toISOString(),
    });
  } catch (error: any) {
    console.error('[API/Quote/Decide] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process decision', details: error.message },
      { status: 500 }
    );
  }
}

