/**
 * Shared workflow computation functions for leads
 * Used by both the leads list and lead detail pages
 */

export interface LeadWorkflowData {
  // Basic fields
  feasible?: boolean | null;
  quotedAmountAed?: number | null;
  agentContactedAt?: Date | null;
  
  // Quote workflow
  companyQuoteSentAt?: Date | null;
  quoteViewedAt?: Date | null;
  proceedConfirmedAt?: Date | null;
  quoteApprovedAt?: Date | null;
  approved?: boolean | null;
  quoteDeclinedAt?: Date | null;
  quoteQuestionsAt?: Date | null;
  
  // Invoice workflow
  companyInvoiceNumber?: string | null;
  companyInvoiceSentAt?: Date | null;
  companyPaymentLink?: string | null;
  paymentReceivedAt?: Date | null;
  companyCompletedAt?: Date | null;
  
  // Decline/reminder tracking
  declinedAt?: Date | null;
  declineStage?: string | null;
  
  // Bank workflow (standalone only)
  bankQuotedAmountAed?: number | null;
  bankQuoteSentAt?: Date | null;
  bankQuoteViewedAt?: Date | null;
  bankProceedConfirmedAt?: Date | null;
  bankQuoteApprovedAt?: Date | null;
  bankQuoteDeclinedAt?: Date | null;
  bankQuoteDeclineReason?: string | null;
  bankQuoteQuestionsAt?: Date | null;
  bankPaymentLink?: string | null;
  bankApproved?: boolean | null;
  bankInvoiceNumber?: string | null;
  bankInvoiceSentAt?: Date | null;
  bankPaymentReceivedAt?: Date | null;
  bankCompletedAt?: Date | null;
  bankDeclinedAt?: Date | null;
  
  // Lead type detection (for determining bank project)
  setupType?: string | null;
  serviceChoice?: string | null;
}

/**
 * Get the next action for company workflow
 */
function getCompanyNextAction(lead: LeadWorkflowData): string | null {
  // Initial contact
  if (!lead.agentContactedAt) {
    return 'Send WhatsApp to Agent';
  }
  
  // Feasibility and quote
  if (lead.feasible === null) {
    return 'Set Feasibility & Quote';
  }
  if (lead.feasible === true && !lead.quotedAmountAed) {
    return 'Enter Quoted Amount';
  }
  
  // Quote sending
  if (lead.quotedAmountAed && !lead.companyQuoteSentAt) {
    return 'Send Company Quote';
  }
  
  // Wait for quote decision
  const isApproved = lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.approved === true;
  const hasQuestions = lead.quoteQuestionsAt !== null && lead.quoteQuestionsAt !== undefined;
  if (lead.companyQuoteSentAt && !isApproved && !lead.quoteDeclinedAt && !hasQuestions) {
    return 'Waiting for customer decision';
  }
  // If customer has questions, workflow is paused
  if (hasQuestions && !isApproved && !lead.quoteDeclinedAt) {
    return 'Customer has questions - contact customer';
  }
  
  // Invoice generation (after approval)
  if (isApproved && !lead.companyInvoiceNumber) {
    return 'Generate & Send Company Invoice';
  }
  
  // Payment states (after invoice sent)
  if (isApproved && lead.companyInvoiceSentAt) {
    if (!lead.paymentReceivedAt) {
      return 'Send payment reminder / follow up';
    }
    if (!lead.companyCompletedAt) {
      return 'Mark Company Completed';
    }
  }
  
  // Company completed
  if (lead.companyCompletedAt !== null) {
    return null; // No pending company actions
  }
  
  return null;
}

/**
 * Get the next action for bank workflow
 */
function getBankNextAction(lead: LeadWorkflowData, leadType?: 'Lead'): string | null {
  // Bank workflow is only for bank-only leads (setupType === "bank")
  const isBankLead = lead.setupType === 'bank';
  
  if (!isBankLead) {
    return null; // Not a bank-only lead
  }
  
  // Check if bank declined
  if (lead.bankQuoteDeclinedAt || lead.bankDeclinedAt || lead.bankApproved === false) {
    return null; // Bank declined, no pending actions
  }
  
  // Check if bank completed
  if (lead.bankCompletedAt !== null) {
    return null; // Bank completed, no pending actions
  }
  
  // Bank quote workflow
  if (!lead.bankQuotedAmountAed) {
    return 'Set Bank Quote';
  }
  if (lead.bankQuotedAmountAed && !lead.bankQuoteSentAt) {
    return 'Send Bank Quote';
  }
  
  // Wait for bank quote decision
  const isBankApproved = lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.bankApproved === true;
  const bankHasQuestions = lead.bankQuoteQuestionsAt !== null && lead.bankQuoteQuestionsAt !== undefined;
  if (lead.bankQuoteSentAt && !isBankApproved && !lead.bankQuoteDeclinedAt && !bankHasQuestions) {
    return 'Awaiting bank approval';
  }
  // If customer has questions, workflow is paused
  if (bankHasQuestions && !isBankApproved && !lead.bankQuoteDeclinedAt) {
    return 'Customer has questions - contact customer';
  }
  
  // Bank invoice generation (after bank approval)
  if (isBankApproved && !lead.bankInvoiceNumber) {
    return 'Send Bank Invoice';
  }
  
  // Bank payment states
  if (lead.bankInvoiceSentAt) {
    if (!lead.bankPaymentReceivedAt) {
      return 'Send payment reminder / follow up';
    }
    if (!lead.bankCompletedAt) {
      return 'Mark Bank Completed';
    }
  }
  
  return null;
}

/**
 * Get the next action for a lead based on its current state
 * Handles both company and bank-only leads correctly
 */
export function getNextAction(lead: LeadWorkflowData, leadType?: 'Lead'): string {
  // Check if this is a bank-only lead
  const isBankOnlyLead = lead.setupType === 'bank';
  
  // Closed states (check declinedAt first)
  if (lead.declinedAt) {
    return 'No further action';
  }
  if (lead.feasible === false) return 'Closed (Not Feasible)';
  
  // For bank-only leads, check bank-specific decline fields
  if (isBankOnlyLead) {
    if (lead.bankQuoteDeclinedAt || lead.bankDeclinedAt || lead.bankApproved === false) {
      return 'Bank Quote Declined';
    }
    if (lead.bankCompletedAt !== null) {
      return 'Completed';
    }
    
    // Get bank-specific next action
    const bankAction = getBankNextAction(lead, leadType);
    if (bankAction) {
      return bankAction;
    }
    return 'Completed';
  }
  
  // Company workflow (or combined company + bank)
  if (lead.quoteDeclinedAt) {
    return 'Quote Declined';
  }
  // Only treat as declined if approved=false AND quoteDeclinedAt is set
  if (lead.approved === false && lead.quoteDeclinedAt) {
    return 'Closed - Declined';
  }
  
  // Check completion status
  const companyDone = lead.companyCompletedAt !== null;
  
  if (companyDone) {
    return 'Completed';
  }
  
  // Get company next action
  const companyAction = getCompanyNextAction(lead);
  
  if (companyAction) {
    return companyAction;
  }
  
  // Default fallback
  return 'Completed';
}

/**
 * Get the status for a lead based on its current state
 * Handles both company and bank-only leads correctly
 */
export function getStatus(lead: LeadWorkflowData, leadType?: 'Lead'): string {
  // Check if this is a bank-only lead
  const isBankOnlyLead = lead.setupType === 'bank';
  
  // Closed states (check declinedAt first)
  if (lead.declinedAt) return 'Closed - Declined';
  if (lead.feasible === false) return 'Not Feasible';
  
  // For bank-only leads, use bank-specific workflow
  if (isBankOnlyLead) {
    if (lead.bankQuoteDeclinedAt || lead.bankDeclinedAt || lead.bankApproved === false) {
      return 'Declined';
    }
    
    // Bank completed
    if (lead.bankCompletedAt !== null) {
      return 'Completed';
    }
    
    // Bank payment received
    if (lead.bankPaymentReceivedAt) {
      if (!lead.bankCompletedAt) {
        return 'Bank In Progress';
      }
    }
    
    // Bank invoice sent
    const hasBankInvoice = lead.bankInvoiceNumber && lead.bankInvoiceSentAt;
    if (hasBankInvoice) {
      if (!lead.bankPaymentReceivedAt) {
        return 'Awaiting Payment';
      }
      return 'Invoice Sent';
    }
    
    if (lead.bankApproved === true && !lead.bankPaymentReceivedAt && !hasBankInvoice) {
      return 'Awaiting Payment';
    }
    
    // Bank quote sent but waiting for decision
    const hasBankQuote = lead.bankQuoteSentAt;
    const isBankApproved = lead.bankProceedConfirmedAt || lead.bankQuoteApprovedAt || lead.bankApproved === true;
    
    if (hasBankQuote && !isBankApproved && !lead.bankQuoteDeclinedAt && !hasBankInvoice) {
      return 'Awaiting Customer Approval';
    }
    
    if (hasBankQuote) {
      if (!isBankApproved && !lead.bankQuoteDeclinedAt) {
        return 'Quoted';
      }
    }
    
    // Bank quote state
    if (lead.bankQuotedAmountAed) {
      return 'Quoted';
    }
    
    // Feasibility state
    if (lead.feasible === null && lead.agentContactedAt) {
      return 'Feasibility Review';
    }
    
    // Agent contact state
    if (lead.agentContactedAt) {
      return 'Agent Contacted';
    }
    
    return 'New';
  }
  
  // Company workflow (or combined company + bank)
  if (lead.quoteDeclinedAt) return 'Declined';
  if (lead.approved === false && lead.quoteDeclinedAt) return 'Declined';
  
  // Completed states
  const companyDone = lead.companyCompletedAt !== null;
  
  if (companyDone) {
    return 'Completed';
  }
  
  // Active workflow states
  if (lead.paymentReceivedAt) {
    if (lead.paymentReceivedAt && !companyDone) {
      return 'Company In Progress';
    }
  }
  
  // Invoice sent states
  const hasCompanyInvoice = lead.companyInvoiceNumber && lead.companyInvoiceSentAt;
  
  if (hasCompanyInvoice) {
    if (!lead.paymentReceivedAt) {
      return 'Awaiting Payment';
    }
    return 'Invoice Sent';
  }
  
  if (lead.approved === true && !lead.paymentReceivedAt && !hasCompanyInvoice) {
    return 'Awaiting Payment';
  }
  
  // Declined state
  if (lead.quoteDeclinedAt) {
    return 'Declined';
  }
  
  // Quote sent but waiting for decision
  const hasCompanyQuote = lead.companyQuoteSentAt;
  const isApproved = lead.proceedConfirmedAt || lead.quoteApprovedAt || lead.approved === true;
  
  if (hasCompanyQuote && !isApproved && !lead.quoteDeclinedAt && !hasCompanyInvoice) {
    return 'Awaiting Customer Approval';
  }
  
  if (hasCompanyQuote) {
    if (!isApproved && !lead.quoteDeclinedAt) {
      return 'Quoted';
    }
  }
  
  // Quote state
  if (lead.quotedAmountAed) {
    return 'Quoted';
  }
  
  // Feasibility state
  if (lead.feasible === null && lead.agentContactedAt) {
    return 'Feasibility Review';
  }
  
  // Agent contact state
  if (lead.agentContactedAt) {
    return 'Agent Contacted';
  }
  
  return 'New';
}
