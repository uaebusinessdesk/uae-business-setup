import type { CompanySla } from './sla';

interface Lead {
  agentContactedAt?: Date | null;
  feasible?: boolean | null;
  quotedAmountAed?: number | null;
  approvalRequestedAt?: Date | null;
  approved?: boolean | null;
  paymentReceivedAt?: Date | null;
  companyCompletedAt?: Date | null;
  hasBankProject?: boolean;
  needsBankAccount?: boolean;
  bankQuotedAmountAed?: number | null;
  bankApproved?: boolean | null;
  bankPaymentReceivedAt?: Date | null;
  bankCompletedAt?: Date | null;
}

export interface NextAction {
  label: string;
  type: 'action' | 'waiting' | 'overdue' | 'done';
}

export function getNextAction(lead: Lead, sla: CompanySla): NextAction {
  // 1) If agent not contacted
  if (!lead.agentContactedAt) {
    return {
      label: 'Send WhatsApp to Agent',
      type: 'action',
    };
  }

  // 2) If agent contacted but feasibility not confirmed
  if (lead.agentContactedAt && lead.feasible === null) {
    if (sla.isResponseOverdue) {
      return {
        label: 'Follow up agent (Feasibility)',
        type: 'overdue',
      };
    } else {
      return {
        label: 'Await feasibility',
        type: 'waiting',
      };
    }
  }

  // 3) If not feasible
  if (lead.feasible === false) {
    return {
      label: 'Closed (Not feasible)',
      type: 'done',
    };
  }

  // 4) If feasible but no quote yet
  if (lead.feasible === true && !lead.quotedAmountAed) {
    return {
      label: 'Add quote amount',
      type: 'action',
    };
  }

  // 5) If quoted but approval not requested
  if (lead.quotedAmountAed && !lead.approvalRequestedAt) {
    return {
      label: 'Send approval request',
      type: 'action',
    };
  }

  // 6) If approval requested but no decision
  if (lead.approvalRequestedAt && lead.approved === null) {
    return {
      label: 'Awaiting customer decision',
      type: 'waiting',
    };
  }

  // 7) If declined
  if (lead.approved === false) {
    return {
      label: 'Declined',
      type: 'done',
    };
  }

  // 8) If approved but payment not received
  if (lead.approved === true && !lead.paymentReceivedAt) {
    return {
      label: 'Awaiting payment',
      type: 'waiting',
    };
  }

  // 9) If payment received but company not completed
  if (lead.paymentReceivedAt && !lead.companyCompletedAt) {
    if (sla.isCompletionOverdue) {
      return {
        label: 'Follow up agent (Completion)',
        type: 'overdue',
      };
    } else {
      return {
        label: 'Mark company completed',
        type: 'action',
      };
    }
  }

  // 10) If company completed and has bank project
  if (lead.companyCompletedAt && lead.hasBankProject) {
    // If bank not quoted
    if (!lead.bankQuotedAmountAed) {
      return {
        label: 'Add bank quote',
        type: 'action',
      };
    }
    // If bank not approved
    if (lead.bankApproved === null) {
      return {
        label: 'Send bank approval request',
        type: 'action',
      };
    }
    // If bank declined
    if (lead.bankApproved === false) {
      return {
        label: 'Bank declined',
        type: 'done',
      };
    }
    // If bank approved but payment not received
    if (lead.bankApproved === true && !lead.bankPaymentReceivedAt) {
      return {
        label: 'Awaiting bank payment',
        type: 'waiting',
      };
    }
    // If bank payment received but not completed
    if (lead.bankPaymentReceivedAt && !lead.bankCompletedAt) {
      return {
        label: 'Mark bank completed',
        type: 'action',
      };
    }
    // Bank completed
    if (lead.bankCompletedAt) {
      return {
        label: 'Completed',
        type: 'done',
      };
    }
  }

  // 11) Company completed, no bank project or bank completed
  return {
    label: 'Completed',
    type: 'done',
  };
}
