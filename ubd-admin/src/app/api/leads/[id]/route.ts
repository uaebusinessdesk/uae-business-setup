import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { isAuthenticated } from '@/lib/auth';
import { notifyAdmin } from '@/lib/notifications/adminNotify';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try website lead first - explicitly select all fields including decision fields
    let lead = await db.lead.findUnique({
      where: { id },
      // No select clause - returns all fields including proceedConfirmedAt, quoteApprovedAt, etc.
    });

    if (lead) {
      return NextResponse.json({
        ...lead,
        leadType: 'Lead',
        source: 'website',
      });
    }

    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Find lead
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Build update data with only provided fields
    const updateData: any = {};

    // Quote fields - only update if provided
    if (body.feasible !== undefined) {
      updateData.feasible = body.feasible;
    }

    if (body.quotedAmountAed !== undefined) {
      // Validate: if provided, must be a positive number
      if (body.quotedAmountAed !== null && body.quotedAmountAed !== '') {
        const amount = typeof body.quotedAmountAed === 'number' 
          ? body.quotedAmountAed 
          : parseInt(String(body.quotedAmountAed));
        
        if (isNaN(amount) || amount <= 0) {
          return NextResponse.json(
            { ok: false, error: 'quotedAmountAed must be a positive number' },
            { status: 400 }
          );
        }
        
        updateData.quotedAmountAed = amount;
        
        // Note: If invoice was sent and payment not received, invoice becomes outdated
        // (inferred by UI comparing quotedAmountAed != companyInvoiceAmountAed)
        // We don't update companyInvoiceAmountAed here - it's only set when invoice is sent
      } else {
        updateData.quotedAmountAed = null;
      }
    }

    // Bank quote amount - only update if provided
    if (body.bankQuotedAmountAed !== undefined) {
      // Validate: if provided, must be a positive number
      if (body.bankQuotedAmountAed !== null && body.bankQuotedAmountAed !== '') {
        const amount = typeof body.bankQuotedAmountAed === 'number' 
          ? body.bankQuotedAmountAed 
          : parseInt(String(body.bankQuotedAmountAed));
        
        if (isNaN(amount) || amount <= 0) {
          return NextResponse.json(
            { ok: false, error: 'bankQuotedAmountAed must be a positive number' },
            { status: 400 }
          );
        }
        
        updateData.bankQuotedAmountAed = amount;
      } else {
        updateData.bankQuotedAmountAed = null;
      }
    }

    if (body.companyPaymentLink !== undefined) {
      updateData.companyPaymentLink = body.companyPaymentLink || null;
    }

    // Payment received - only update if provided
    if (body.paymentReceivedAt !== undefined) {
      // Validate: invoice must be sent before payment can be marked
      if (body.paymentReceivedAt !== null && !lead.companyInvoiceSentAt) {
        return NextResponse.json(
          { ok: false, error: 'Send the invoice to the customer before marking payment received.' },
          { status: 400 }
        );
      }
      updateData.paymentReceivedAt = body.paymentReceivedAt ? new Date(body.paymentReceivedAt) : null;
    }

    // Company completed - only update if provided
    if (body.companyCompletedAt !== undefined) {
      // Validate: payment must be received before completion can be marked
      if (body.companyCompletedAt !== null && !lead.paymentReceivedAt) {
        return NextResponse.json(
          { ok: false, error: 'Payment must be received before marking company setup as completed.' },
          { status: 400 }
        );
      }
      updateData.companyCompletedAt = body.companyCompletedAt ? new Date(body.companyCompletedAt) : null;
    }

    // Internal notes - only update if provided
    if (body.internalNotes !== undefined) {
      updateData.internalNotes = body.internalNotes || null;
    }

    // Notes - only update if provided
    if (body.notes !== undefined) {
      updateData.notes = body.notes || null;
    }

    // Decline fields - allow editing/clearing to reopen lead
    if (body.declinedAt !== undefined) {
      updateData.declinedAt = body.declinedAt ? new Date(body.declinedAt) : null;
    }
    if (body.declineStage !== undefined) {
      updateData.declineStage = body.declineStage || null;
    }
    if (body.declineReason !== undefined) {
      updateData.declineReason = body.declineReason || null;
    }

    // Client fields - only update if provided
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.email !== undefined) updateData.email = body.email || null;
    if (body.nationality !== undefined) updateData.nationality = body.nationality || null;
    if (body.residenceCountry !== undefined) updateData.residenceCountry = body.residenceCountry || null;
    if (body.emirate !== undefined) updateData.emirate = body.emirate || null;
    if (body.setupType !== undefined) updateData.setupType = body.setupType;
    if (body.activity !== undefined) updateData.activity = body.activity || null;
    if (body.shareholdersCount !== undefined) {
      updateData.shareholdersCount = body.shareholdersCount !== null && body.shareholdersCount !== '' ? parseInt(String(body.shareholdersCount)) : null;
    }
    if (body.visasRequired !== undefined) updateData.visasRequired = body.visasRequired !== null ? body.visasRequired : null;
    if (body.visasCount !== undefined) {
      updateData.visasCount = body.visasCount !== null && body.visasCount !== '' ? parseInt(String(body.visasCount)) : null;
    }
    if (body.timeline !== undefined) updateData.timeline = body.timeline || null;

    // Update the lead record
    const updatedLead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error('[API/Leads/PATCH] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch original lead to detect changes
    const originalLead = await db.lead.findUnique({
      where: { id },
    });

    if (!originalLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate state transitions
    const errors: string[] = [];

    // Validate payment received - must have invoice sent first
    if (body.paymentReceivedAt !== undefined && body.paymentReceivedAt !== null) {
      if (!originalLead.companyInvoiceSentAt) {
        errors.push('Send the invoice to the customer before marking payment received.');
      }
    }

    // Validate company completed - must have payment received first
    if (body.companyCompletedAt !== undefined && body.companyCompletedAt !== null) {
      if (!originalLead.paymentReceivedAt) {
        errors.push('Cannot mark company completed: Payment must be received first');
      }
    }

    // Validate bank payment received - must have bank invoice first
    if (body.bankPaymentReceivedAt !== undefined && body.bankPaymentReceivedAt !== null) {
      if (!originalLead.bankInvoiceNumber && !originalLead.bankInvoiceSentAt) {
        errors.push('Cannot mark bank payment received: Bank invoice must be generated and sent first');
      }
    }

    // Validate bank completed - must have bank payment received first
    if (body.bankCompletedAt !== undefined && body.bankCompletedAt !== null) {
      if (!originalLead.bankPaymentReceivedAt) {
        errors.push('Cannot mark bank completed: Bank payment must be received first');
      }
    }

    // Validate quote approval - must have quote sent first
    if (body.approved === true && originalLead.approved !== true) {
      if (!originalLead.companyQuoteSentAt) {
        errors.push('Cannot approve quote: Company quote must be sent to customer first');
      }
    }

    // Validate bank quote approval - must have bank quote sent first
    if (body.bankApproved === true && originalLead.bankApproved !== true) {
      if (!originalLead.bankQuoteSentAt) {
        errors.push('Cannot approve bank quote: Bank quote must be sent to customer first');
      }
    }

    // Validate payment link format if provided
    if (body.companyPaymentLink !== undefined && body.companyPaymentLink !== null && body.companyPaymentLink !== '') {
      try {
        new URL(body.companyPaymentLink);
      } catch {
        errors.push('Invalid payment link format. Must be a valid URL (e.g., https://ziina.com/payment/...)');
      }
    }

    if (body.bankPaymentLink !== undefined && body.bankPaymentLink !== null && body.bankPaymentLink !== '') {
      try {
        new URL(body.bankPaymentLink);
      } catch {
        errors.push('Invalid bank payment link format. Must be a valid URL (e.g., https://ziina.com/payment/...)');
      }
    }

    if (errors.length > 0) {
      console.log('[API/Leads/PATCH] Validation errors found, returning 400:', errors);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    console.log('[API/Leads/PATCH] Validation passed, proceeding with update');

    // Only include fields that are actually provided in the body
    const updateData: any = {};
    console.log('[API/Leads/PATCH] Initialized updateData as empty object');
    
    // Client fields - only update if provided
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.email !== undefined) updateData.email = body.email || null;
    if (body.nationality !== undefined) updateData.nationality = body.nationality || null;
    if (body.residenceCountry !== undefined) updateData.residenceCountry = body.residenceCountry || null;
    if (body.emirate !== undefined) updateData.emirate = body.emirate || null;
    if (body.setupType !== undefined) updateData.setupType = body.setupType;
    if (body.activity !== undefined) updateData.activity = body.activity || null;
    if (body.shareholdersCount !== undefined) {
      updateData.shareholdersCount = body.shareholdersCount !== null && body.shareholdersCount !== '' ? parseInt(String(body.shareholdersCount)) : null;
    }
    if (body.visasRequired !== undefined) updateData.visasRequired = body.visasRequired !== null ? body.visasRequired : null;
    if (body.visasCount !== undefined) {
      updateData.visasCount = body.visasCount !== null && body.visasCount !== '' ? parseInt(String(body.visasCount)) : null;
    }
    if (body.timeline !== undefined) updateData.timeline = body.timeline || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    
    // Deal Workflow - Company - only update if provided
    if (body.assignedAgent !== undefined) updateData.assignedAgent = body.assignedAgent;
    if (body.agentContactedAt !== undefined) {
      updateData.agentContactedAt = body.agentContactedAt ? new Date(body.agentContactedAt) : null;
    }
    if (body.feasible !== undefined) updateData.feasible = body.feasible;
    if (body.quotedAmountAed !== undefined) {
      updateData.quotedAmountAed = body.quotedAmountAed !== null && body.quotedAmountAed !== '' ? parseInt(String(body.quotedAmountAed)) : null;
    }
    if (body.companyQuoteSentAt !== undefined) {
      updateData.companyQuoteSentAt = body.companyQuoteSentAt ? new Date(body.companyQuoteSentAt) : null;
    }
    if (body.companyPaymentLink !== undefined) updateData.companyPaymentLink = body.companyPaymentLink || null;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;
    if (body.approvalRequestedAt !== undefined) {
      updateData.approvalRequestedAt = body.approvalRequestedAt ? new Date(body.approvalRequestedAt) : null;
    }
    if (body.approved !== undefined) updateData.approved = body.approved;
    if (body.paymentReceivedAt !== undefined) {
      updateData.paymentReceivedAt = body.paymentReceivedAt ? new Date(body.paymentReceivedAt) : null;
    }
    if (body.companyCompletedAt !== undefined) {
      updateData.companyCompletedAt = body.companyCompletedAt ? new Date(body.companyCompletedAt) : null;
    }
    if (body.googleReviewRequestedAt !== undefined) {
      updateData.googleReviewRequestedAt = body.googleReviewRequestedAt ? new Date(body.googleReviewRequestedAt) : null;
    }
    // Decline fields - allow editing/clearing to reopen lead
    if (body.declinedAt !== undefined) {
      updateData.declinedAt = body.declinedAt ? new Date(body.declinedAt) : null;
    }
    if (body.declineStage !== undefined) {
      updateData.declineStage = body.declineStage || null;
    }
    if (body.declineReason !== undefined) {
      updateData.declineReason = body.declineReason || null;
    }
    
    // Deal Workflow - Bank - only update if provided (deprecated: hasBankProject is not used, bank is standalone only)
    if (body.bankQuotedAmountAed !== undefined) {
      updateData.bankQuotedAmountAed = body.bankQuotedAmountAed !== null && body.bankQuotedAmountAed !== '' ? parseInt(String(body.bankQuotedAmountAed)) : null;
    }
    if (body.bankQuoteSentAt !== undefined) {
      updateData.bankQuoteSentAt = body.bankQuoteSentAt ? new Date(body.bankQuoteSentAt) : null;
    }
    if (body.bankPaymentLink !== undefined) updateData.bankPaymentLink = body.bankPaymentLink || null;
    if (body.bankApprovalRequestedAt !== undefined) {
      updateData.bankApprovalRequestedAt = body.bankApprovalRequestedAt ? new Date(body.bankApprovalRequestedAt) : null;
    }
    if (body.bankApproved !== undefined) updateData.bankApproved = body.bankApproved;
    if (body.bankPaymentReceivedAt !== undefined) {
      updateData.bankPaymentReceivedAt = body.bankPaymentReceivedAt ? new Date(body.bankPaymentReceivedAt) : null;
    }
    if (body.bankCompletedAt !== undefined) {
      updateData.bankCompletedAt = body.bankCompletedAt ? new Date(body.bankCompletedAt) : null;
    }
    if (body.bankAfterCompany !== undefined) updateData.bankAfterCompany = body.bankAfterCompany;
    
    // Legacy fields - only update if provided
    if (body.estimatedCostMinAed !== undefined) {
      updateData.estimatedCostMinAed = body.estimatedCostMinAed !== null && body.estimatedCostMinAed !== '' ? parseInt(String(body.estimatedCostMinAed)) : null;
    }
    if (body.estimatedCostMaxAed !== undefined) {
      updateData.estimatedCostMaxAed = body.estimatedCostMaxAed !== null && body.estimatedCostMaxAed !== '' ? parseInt(String(body.estimatedCostMaxAed)) : null;
    }
    if (body.estimatedTimelineText !== undefined) updateData.estimatedTimelineText = body.estimatedTimelineText || null;
    if (body.riskNotes !== undefined) updateData.riskNotes = body.riskNotes || null;
    if (body.invoiceStatus !== undefined) updateData.invoiceStatus = body.invoiceStatus;
    if (body.invoiceAmountAed !== undefined) {
      updateData.invoiceAmountAed = body.invoiceAmountAed !== null && body.invoiceAmountAed !== '' ? parseInt(String(body.invoiceAmountAed)) : null;
    }
    if (body.stage !== undefined) updateData.stage = body.stage;
    if (body.dropReason !== undefined) updateData.dropReason = body.dropReason || null;
    
    // Company Setup Tracking - only update if provided
    if (body.companyStage !== undefined) updateData.companyStage = body.companyStage;
    if (body.companyFeasible !== undefined) updateData.companyFeasible = body.companyFeasible;
    if (body.companyAssignedTo !== undefined) updateData.companyAssignedTo = body.companyAssignedTo;
    if (body.companyCostMinAed !== undefined) {
      updateData.companyCostMinAed = body.companyCostMinAed !== null && body.companyCostMinAed !== '' ? parseInt(String(body.companyCostMinAed)) : body.companyCostMinAed === null ? null : undefined;
    }
    if (body.companyCostMaxAed !== undefined) {
      updateData.companyCostMaxAed = body.companyCostMaxAed !== null && body.companyCostMaxAed !== '' ? parseInt(String(body.companyCostMaxAed)) : body.companyCostMaxAed === null ? null : undefined;
    }
    if (body.companyInvoiceStatus !== undefined) updateData.companyInvoiceStatus = body.companyInvoiceStatus;
    if (body.companyInvoiceAmountAed !== undefined) {
      updateData.companyInvoiceAmountAed = body.companyInvoiceAmountAed !== null && body.companyInvoiceAmountAed !== '' ? parseInt(String(body.companyInvoiceAmountAed)) : body.companyInvoiceAmountAed === null ? null : undefined;
    }
    if (body.companyInvoiceNumber !== undefined) updateData.companyInvoiceNumber = body.companyInvoiceNumber;
    if (body.companyInvoiceLink !== undefined) updateData.companyInvoiceLink = body.companyInvoiceLink;
    if (body.companyZiinaCode !== undefined) updateData.companyZiinaCode = body.companyZiinaCode;
    if (body.companyInvoiceSentAt !== undefined) {
      updateData.companyInvoiceSentAt = body.companyInvoiceSentAt ? new Date(body.companyInvoiceSentAt) : null;
    }
    if (body.companyPaidAt !== undefined) {
      updateData.companyPaidAt = body.companyPaidAt ? new Date(body.companyPaidAt) : null;
    }
    if (body.companyCompletedAt !== undefined) {
      updateData.companyCompletedAt = body.companyCompletedAt ? new Date(body.companyCompletedAt) : null;
    }
    
    // Bank Setup Tracking - only update if provided
    if (body.needsBankAccount !== undefined) updateData.needsBankAccount = body.needsBankAccount;
    if (body.bankStage !== undefined) updateData.bankStage = body.bankStage;
    if (body.bankInvoiceStatus !== undefined) updateData.bankInvoiceStatus = body.bankInvoiceStatus;
    if (body.bankReadyAt !== undefined) {
      updateData.bankReadyAt = body.bankReadyAt ? new Date(body.bankReadyAt) : null;
    }
    if (body.bankInvoiceNumber !== undefined) updateData.bankInvoiceNumber = body.bankInvoiceNumber;
    if (body.bankInvoiceLink !== undefined) updateData.bankInvoiceLink = body.bankInvoiceLink;
    if (body.bankInvoiceSentAt !== undefined) {
      updateData.bankInvoiceSentAt = body.bankInvoiceSentAt ? new Date(body.bankInvoiceSentAt) : null;
    }
    if (body.bankPaidAt !== undefined) {
      updateData.bankPaidAt = body.bankPaidAt ? new Date(body.bankPaidAt) : null;
    }


    // Handle invoice status updates with timestamps
    if (body.invoiceStatus === 'sent' && body.invoiceStatus !== body.originalInvoiceStatus) {
      updateData.invoiceSentAt = new Date();
    }
    if (body.invoiceStatus === 'paid' && body.invoiceStatus !== body.originalInvoiceStatus) {
      updateData.paidAt = new Date();
    }

    // Handle sent to agent timestamp
    if (body.sentToAgentAt) {
      updateData.sentToAgentAt = body.sentToAgentAt instanceof Date 
        ? body.sentToAgentAt 
        : new Date(body.sentToAgentAt);
    } else if (body.stage === 'sent_to_agent' && body.originalStage !== 'sent_to_agent') {
      // Auto-set when stage changes to sent_to_agent
      updateData.sentToAgentAt = new Date();
    } else if (body.sentToAgentAt === null) {
      updateData.sentToAgentAt = null;
    }

    // Handle company completed timestamp
    if (body.companyStage === 'completed' && body.companyCompletedAt !== undefined) {
      updateData.companyCompletedAt = body.companyCompletedAt ? new Date(body.companyCompletedAt) : new Date();
    }

    // Handle bank ready timestamp
    if (body.bankStage === 'ready_for_bank' && body.bankReadyAt !== undefined) {
      updateData.bankReadyAt = body.bankReadyAt ? new Date(body.bankReadyAt) : new Date();
    }

    // Remove undefined fields to avoid overwriting with undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // IMPORTANT: Do NOT auto-assign assignedAgent based on setupType or agentContactedAt.
    // All agent assignments must be done manually via the agent assignment component.
    // The legacy assignedAgent field is only updated when agents are manually assigned/unassigned
    // via the /api/leads/[id]/assign-agents endpoint.

    console.log('[API/Leads/PATCH] Updating lead with data:', JSON.stringify(updateData, null, 2));
    
    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      console.log('[API/Leads/PATCH] No data to update, returning original lead');
      return NextResponse.json(originalLead);
    }
    
    let lead;
    try {
      lead = await db.lead.update({
        where: { id },
        data: updateData,
      });
      console.log('[API/Leads/PATCH] Database update completed');
    } catch (updateError: any) {
      console.error('[API/Leads/PATCH] Database update failed:', updateError);
      console.error('[API/Leads/PATCH] Update error details:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    
    // Safety check: ensure lead is defined
    if (!lead) {
      console.error('[API/Leads/PATCH] ERROR: lead is undefined after update!');
      return NextResponse.json(
        { error: 'Failed to update lead: lead object is undefined' },
        { status: 500 }
      );
    }
    
    try {
      console.log('[API/Leads/PATCH] Full updated lead object (first 500 chars):', JSON.stringify(lead).substring(0, 500));
    } catch (logError: any) {
      console.error('[API/Leads/PATCH] Error logging lead object:', logError);
      // Continue execution even if logging fails
    }

    // Log activities based on changes
    const activityLogs: Promise<void>[] = [];
    const notificationPromises: Promise<void>[] = [];

    // Agent contacted (deal workflow)
    if (body.agentContactedAt && !originalLead.agentContactedAt) {
      const assignedAgent = lead.assignedAgent || 'self';
      const agentName = assignedAgent === 'athar' ? 'Athar' : assignedAgent === 'anoop' ? 'Anoop' : 'Self';
      activityLogs.push(logActivity(id, 'agent_contacted', `Agent contacted via WhatsApp: ${agentName}`));
    }

    // Company assignment change
    if (body.companyAssignedTo !== undefined && originalLead.companyAssignedTo !== body.companyAssignedTo) {
      let message = 'Assigned to Unassigned';
      if (body.companyAssignedTo === 'athar') {
        message = 'Assigned to Athar';
      } else if (body.companyAssignedTo === 'anoop') {
        message = 'Assigned to Anoop';
      }
      activityLogs.push(logActivity(id, 'company_assigned', message));
    }

    // Company sent to agent
    if (body.companyStage === 'sent_to_agent' && originalLead.companyStage !== 'sent_to_agent') {
      const agentName = body.companyAssignedTo === 'athar' ? 'Athar' : body.companyAssignedTo === 'anoop' ? 'Anoop' : 'Unassigned';
      activityLogs.push(logActivity(id, 'company_sent_to_agent', `Sent to ${agentName}`));
    }

    // Company feasible confirmed
    if (body.companyFeasible === true && originalLead.companyFeasible !== true) {
      activityLogs.push(logActivity(id, 'company_feasible_confirmed', 'Company feasibility confirmed'));
    }

    // Company not feasible
    if (body.companyFeasible === false && originalLead.companyFeasible !== false) {
      activityLogs.push(logActivity(id, 'company_not_feasible', 'Company marked as not feasible'));
    }

    // Company completed - check both companyStage and companyCompletedAt
    const companyJustCompleted = 
      (body.companyStage === 'completed' && originalLead.companyStage !== 'completed') ||
      (body.companyCompletedAt !== undefined && body.companyCompletedAt !== null && !originalLead.companyCompletedAt);
    
    if (companyJustCompleted) {
      activityLogs.push(logActivity(id, 'company_completed', 'Company setup marked as completed'));
      
      // Combined services workflow removed - bank account setup is now standalone only
      // No auto-activation of bank workflow when company completes
    }


    // Bank started (in_progress)
    if (body.bankStage === 'in_progress' && originalLead.bankStage !== 'in_progress') {
      activityLogs.push(logActivity(id, 'bank_started', 'Bank setup started'));
    }

    // Bank completed
    if (body.bankStage === 'completed' && originalLead.bankStage !== 'completed') {
      activityLogs.push(logActivity(id, 'bank_completed', 'Bank setup completed'));
    }

    // Bank closed
    if (body.bankStage === 'closed' && originalLead.bankStage !== 'closed') {
      activityLogs.push(logActivity(id, 'bank_closed', 'Bank setup closed'));
    }

    // Company payment received (notify once)
    // ⚠️ PAYMENT RECEIVED NOTIFICATION - FINALIZED & APPROVED ⚠️
    // This notification has been reviewed and approved.
    // Admin receives email notification when payment is received (marked manually or via payment gateway).
    // Please do not modify without careful review and approval.
    if (body.paymentReceivedAt && !originalLead.paymentReceivedAt) {
      const now = new Date();
      notificationPromises.push(
        notifyAdmin({
          event: 'payment_received_marked',
          leadId: id,
          project: 'company',
          subject: `[Payment Received] Lead ${lead.fullName || 'Unknown'} – Company`,
          lines: [
            `Company payment marked as received`,
            `Lead: ${lead.fullName || 'Unknown'}`,
            `Email: ${lead.email || 'No email'}`,
            `Invoice: ${lead.companyInvoiceNumber || 'N/A'}`,
            `Amount: ${lead.companyInvoiceAmountAed ? `AED ${lead.companyInvoiceAmountAed.toLocaleString()}` : 'Amount not set'}`,
            `Project: Company`,
            `Marked at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        }).catch(err => {
          console.error('Failed to send admin notification for payment received:', err);
        })
      );
    }

    // Bank payment received (notify once)
    // ⚠️ PAYMENT RECEIVED NOTIFICATION - FINALIZED & APPROVED ⚠️
    // This notification has been reviewed and approved.
    // Admin receives email notification when bank payment is received (marked manually or via payment gateway).
    // Please do not modify without careful review and approval.
    if (body.bankPaymentReceivedAt && !originalLead.bankPaymentReceivedAt) {
      const now = new Date();
      notificationPromises.push(
        notifyAdmin({
          event: 'payment_received_marked',
          leadId: id,
          project: 'bank',
          subject: `[Payment Received] Lead ${lead.fullName || 'Unknown'} – Bank`,
          lines: [
            `Bank payment marked as received`,
            `Lead: ${lead.fullName || 'Unknown'}`,
            `Email: ${lead.email || 'No email'}`,
            `Invoice: ${lead.bankInvoiceNumber || 'N/A'}`,
            `Amount: ${lead.bankInvoiceAmountAed ? `AED ${lead.bankInvoiceAmountAed.toLocaleString()}` : 'Amount not set'}`,
            `Project: Bank`,
            `Marked at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        }).catch(err => {
          console.error('Failed to send admin notification for bank payment received:', err);
        })
      );
    }

    // Company completed (notify once)
    if (body.companyCompletedAt && !originalLead.companyCompletedAt) {
      const now = new Date();
      notificationPromises.push(
        notifyAdmin({
          event: 'completed_marked',
          leadId: id,
          project: 'company',
          subject: `[Company Completed] Lead ${lead.fullName || 'Unknown'}`,
          lines: [
            `Company setup marked as completed`,
            `Lead: ${lead.fullName || 'Unknown'}`,
            `Email: ${lead.email || 'No email'}`,
            `Project: Company`,
            `Completed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        }).catch(err => {
          console.error('Failed to send admin notification for company completed:', err);
        })
      );
    }

    // Bank completed (notify once)
    if (body.bankCompletedAt && !originalLead.bankCompletedAt) {
      const now = new Date();
      notificationPromises.push(
        notifyAdmin({
          event: 'completed_marked',
          leadId: id,
          project: 'bank',
          subject: `[Bank Completed] Lead ${lead.fullName || 'Unknown'}`,
          lines: [
            `Bank setup marked as completed`,
            `Lead: ${lead.fullName || 'Unknown'}`,
            `Email: ${lead.email || 'No email'}`,
            `Project: Bank`,
            `Completed at: ${now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })}`,
          ],
        }).catch(err => {
          console.error('Failed to send admin notification for bank completed:', err);
        })
      );
    }

    // Execute all activity logs in parallel (non-blocking)
    Promise.all(activityLogs).catch(err => {
      console.error('Error logging activities:', err);
    });

    // Send admin notifications (non-blocking)
    Promise.all(notificationPromises).catch(err => {
      console.error('Error sending admin notifications:', err);
    });

    // Return the updated lead
    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Error name:', error?.name);
    return NextResponse.json(
      { 
        error: 'Failed to update lead',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete lead
    try {
      await db.lead.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

