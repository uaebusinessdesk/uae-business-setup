/**
 * Follow-up message builders for WhatsApp
 */

// Lead type for followups
interface Lead {
  fullName: string;
  setupType?: string | null;
  notes?: string | null;
  companyAssignedTo?: string;
  companyInvoiceNumber?: string | null;
  [key: string]: any;
}

/**
 * Extract lead reference from notes
 */
function extractLeadRef(notes: string | null): string {
  if (!notes) return 'N/A';
  const match = notes.match(/Lead Reference:\s*([A-Z0-9-]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Get agent name from companyAssignedTo
 */
function getAgentName(companyAssignedTo: string): string {
  if (companyAssignedTo === 'athar') return 'Athar';
  if (companyAssignedTo === 'anoop') return 'Anoop';
  return 'Agent';
}

/**
 * Get setup type label
 */
function getSetupTypeLabel(setupType: string): string {
  if (setupType === 'mainland') return 'Mainland';
  if (setupType === 'freezone') return 'Free Zone';
  if (setupType === 'offshore') return 'Offshore';
  return setupType;
}

/**
 * Build agent feasibility follow-up message
 */
export function buildAgentFeasibilityFollowUp(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes ?? null);
  const agentName = getAgentName(lead.companyAssignedTo || 'unassigned');
  const setupTypeLabel = getSetupTypeLabel(lead.setupType);
  
  let message = `Hi ${agentName},\n\n`;
  message += `*Follow-up: Feasibility Confirmation*\n\n`;
  message += `Lead Reference: ${leadRef}\n`;
  message += `Client: ${lead.fullName}\n`;
  message += `Setup Type: ${setupTypeLabel}\n\n`;
  message += `Please confirm feasibility and expected cost range when ready.\n\n`;
  message += `Thanks!`;
  
  return message;
}

/**
 * Build agent completion follow-up message
 */
export function buildAgentCompletionFollowUp(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes ?? null);
  const agentName = getAgentName(lead.companyAssignedTo || 'unassigned');
  const setupTypeLabel = getSetupTypeLabel(lead.setupType);
  
  let message = `Hi ${agentName},\n\n`;
  message += `*Follow-up: Company Completion*\n\n`;
  message += `Lead Reference: ${leadRef}\n`;
  message += `Client: ${lead.fullName}\n`;
  message += `Setup Type: ${setupTypeLabel}\n\n`;
  message += `Please provide an update on the company formation completion status.\n\n`;
  message += `Thanks!`;
  
  return message;
}

/**
 * Build company payment reminder message
 */
export function buildCompanyPaymentReminder(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes ?? null);
  const invoiceNumber = lead.companyInvoiceNumber || 'N/A';
  
  let message = `Hi ${lead.fullName},\n\n`;
  message += `*Payment Reminder — Company Setup Invoice*\n\n`;
  message += `Lead Reference: ${leadRef}\n`;
  message += `Invoice Number: ${invoiceNumber}\n\n`;
  if (lead.companyInvoiceLink) {
    message += `Invoice Link: ${lead.companyInvoiceLink}\n\n`;
  }
  message += `Please complete the payment to proceed with your company formation.\n\n`;
  message += `Thank you!`;
  
  return message;
}

/**
 * Build bank payment reminder message
 */
export function buildBankPaymentReminder(lead: Lead): string {
  const leadRef = extractLeadRef(lead.notes ?? null);
  const invoiceNumber = lead.bankInvoiceNumber || 'N/A';
  
  let message = `Hi ${lead.fullName},\n\n`;
  message += `*Payment Reminder — Bank Account Setup Invoice*\n\n`;
  message += `Lead Reference: ${leadRef}\n`;
  message += `Invoice Number: ${invoiceNumber}\n\n`;
  if (lead.bankInvoiceLink) {
    message += `Invoice Link: ${lead.bankInvoiceLink}\n\n`;
  }
  message += `Please complete the payment to proceed with your bank account setup.\n\n`;
  message += `Thank you!`;
  
  return message;
}


