import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import UnifiedLeadsClient from '@/components/UnifiedLeadsClient';
import DashboardRefresh from '@/components/DashboardRefresh';
import { toSetupTypeLabel } from '@/lib/setupType';
import { getStatus, type LeadWorkflowData } from '@/lib/leadWorkflow';

// Force dynamic rendering to ensure filters work correctly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  // Await searchParams (Next.js 15+)
  const params = await searchParams;

  // Extract query params
  const q = typeof params.q === 'string' ? params.q : '';
  const setupType = typeof params.setupType === 'string' ? params.setupType : 'all';
  const status = typeof params.status === 'string' ? params.status : 'all';
  const assigned = typeof params.assigned === 'string' ? params.assigned : 'all';
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  // Build where clause for leads table
  const leadWhere: any = {};

  // Search filter
  if (q) {
    const searchFilter = { contains: q };
    leadWhere.OR = [
      { fullName: searchFilter },
      { whatsapp: searchFilter },
      { email: searchFilter },
    ];
  }

  // Service filter
  if (setupType && setupType !== 'all') {
    leadWhere.setupType = setupType;
  }

  // Agent filter
  if (assigned && assigned !== 'all') {
    if (assigned === 'unassigned') {
      leadWhere.assignedAgent = null;
    } else {
      leadWhere.assignedAgent = assigned;
    }
  }

  // Sort order
  const orderBy = sort === 'oldest'
    ? { createdAt: 'asc' as const }
    : { createdAt: 'desc' as const };

  // Fetch leads from website only, including agent assignments
  const websiteLeadsRaw = await db.lead.findMany({
    where: leadWhere,
    orderBy,
    include: {
      agentAssignments: {
        include: {
          agent: true,
        },
        orderBy: {
          isPrimary: 'desc',
        },
      },
    },
  });
  
  // All leads are now standalone services (company setup OR bank setup, not combined)
  const websiteLeads = websiteLeadsRaw;

  // Helper to normalize website setupType for display
  const normalizeWebsiteService = (setupType: string | null): string => {
    if (!setupType) return 'N/A';
    return toSetupTypeLabel(setupType);
  };

  // Normalize leads for display
  const normalizedLeads = websiteLeads.map((lead) => {
    // Get primary agent from database assignments, fallback to legacy assignedAgent only if no assignments exist
    let assignedAgentId: string | null = null;
    
    if (lead.agentAssignments && lead.agentAssignments.length > 0) {
      // Use primary agent from assignments if available
      const primaryAssignment = lead.agentAssignments.find(la => la.isPrimary);
      assignedAgentId = primaryAssignment?.agentId || lead.agentAssignments[0]?.agentId || null;
    } else {
      // Only use legacy assignedAgent if there are no assignments AND it's a valid agent ID
      const legacyAgent = lead.assignedAgent;
      if (legacyAgent && 
          legacyAgent !== 'unassigned' && 
          legacyAgent !== 'null' &&
          legacyAgent.trim() !== '' &&
          // Reject any value that looks like it contains additional text (e.g., "Gaurav - ADCB")
          !legacyAgent.includes(' - ') &&
          !legacyAgent.includes(' | ') &&
          // Check if it's a valid UUID (new agent system) or legacy agent ID
          (legacyAgent === 'athar' || legacyAgent === 'anoop' || legacyAgent === 'self' || legacyAgent.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))) {
        assignedAgentId = legacyAgent;
      }
    }
    
    return {
      id: lead.id,
      leadType: 'Lead' as const,
      name: lead.fullName,
      contact: lead.whatsapp,
      email: lead.email,
      service: normalizeWebsiteService(lead.setupType), // Normalize for display
      serviceRaw: lead.setupType, // Keep raw value for filtering
      setupType: lead.setupType, // For workflow detection
      status: getStatus(lead as LeadWorkflowData, 'Lead'),
      assignedAgentId: assignedAgentId,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    agentContactedAt: lead.agentContactedAt,
    feasible: lead.feasible,
    quotedAmountAed: lead.quotedAmountAed,
    companyQuoteSentAt: lead.companyQuoteSentAt,
    quoteViewedAt: lead.quoteViewedAt,
    proceedConfirmedAt: lead.proceedConfirmedAt,
    quoteApprovedAt: lead.quoteApprovedAt,
    approved: lead.approved,
    quoteDeclinedAt: lead.quoteDeclinedAt,
    companyInvoiceSentAt: lead.companyInvoiceSentAt,
    companyPaymentLink: lead.companyPaymentLink,
    paymentReceivedAt: lead.paymentReceivedAt,
    companyCompletedAt: lead.companyCompletedAt,
    bankQuotedAmountAed: lead.bankQuotedAmountAed,
    bankQuoteSentAt: lead.bankQuoteSentAt,
    bankQuoteViewedAt: lead.bankQuoteViewedAt,
    bankProceedConfirmedAt: lead.bankProceedConfirmedAt,
    bankQuoteApprovedAt: lead.bankQuoteApprovedAt,
    bankQuoteDeclinedAt: lead.bankQuoteDeclinedAt,
    bankPaymentLink: lead.bankPaymentLink,
    bankApproved: lead.bankApproved,
    bankInvoiceSentAt: lead.bankInvoiceSentAt,
    bankPaymentReceivedAt: lead.bankPaymentReceivedAt,
    bankCompletedAt: lead.bankCompletedAt,
    bankDeclinedAt: lead.bankDeclinedAt,
    bankDeclineReason: lead.bankDeclineReason,
    bankDeclineStage: lead.bankDeclineStage,
    bankPaymentReminderSentAt: lead.bankPaymentReminderSentAt,
    bankPaymentReminderCount: lead.bankPaymentReminderCount,
    bankInvoiceVersion: lead.bankInvoiceVersion,
    bankInvoiceAmountAed: lead.bankInvoiceAmountAed,
    bankInvoicePaymentLink: lead.bankInvoicePaymentLink,
    companyInvoiceNumber: lead.companyInvoiceNumber,
    bankInvoiceNumber: lead.bankInvoiceNumber,
    };
  });

  // Sort results
  normalizedLeads.sort((a, b) => {
    if (sort === 'oldest') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Apply status filter (computed status)
  let filteredLeads = normalizedLeads;
  if (status && status !== 'all') {
    filteredLeads = normalizedLeads.filter((lead) => lead.status === status);
  }

  const leads = filteredLeads;

  // Fetch agents from database for filter dropdown
  const dbAgents = await db.agent.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // Map database agents to the format expected by UnifiedLeadsClient
  const agents = dbAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
  }));

  // Add legacy agents for backward compatibility (if they exist in database, they'll be included above)
  const legacyAgentIds = ['athar', 'anoop', 'self'];
  const legacyAgentNames: Record<string, string> = {
    'athar': 'Athar',
    'anoop': 'Anoop',
    'self': 'Zahed',
  };
  
  // Add legacy agents if they're not already in the list
  legacyAgentIds.forEach(legacyId => {
    if (!agents.find(a => a.id === legacyId)) {
      agents.push({ id: legacyId, name: legacyAgentNames[legacyId] });
    }
  });

  return (
    <>
      <DashboardRefresh interval={30000} />
      <UnifiedLeadsClient 
        leads={leads}
        initialSearchParams={{
          q,
          setupType,
          status,
          assigned,
          sort,
        }}
        agents={agents}
      />
    </>
  );
}

