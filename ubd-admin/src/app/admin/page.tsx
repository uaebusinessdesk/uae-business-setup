import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import DashboardRefresh from '@/components/DashboardRefresh';
import DashboardContent from '@/components/DashboardContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  // Fetch agents for mapping
  const agents = await db.agent.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Create agent name mapping
  const agentNameMap = new Map<string, string>();
  agents.forEach(agent => {
    agentNameMap.set(agent.id, agent.name);
  });

  // Fetch all website leads with workflow fields and agent assignments
  const websiteLeads = await db.lead.findMany({
    select: {
      id: true,
      fullName: true,
      createdAt: true,
      agentContactedAt: true,
      feasible: true,
      quotedAmountAed: true,
      companyQuoteSentAt: true,
      companyPaymentLink: true,
      approved: true,
      paymentReceivedAt: true,
      companyCompletedAt: true,
      hasBankProject: true,
      bankQuotedAmountAed: true,
      bankQuoteSentAt: true,
      bankPaymentLink: true,
      bankApproved: true,
      bankPaymentReceivedAt: true,
      bankCompletedAt: true,
      companyInvoiceNumber: true,
      companyInvoiceSentAt: true,
      bankInvoiceNumber: true,
      bankInvoiceSentAt: true,
      assignedAgent: true, // Legacy field for backward compatibility
      agentAssignments: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Helper function to compute status (same logic as in route.ts)
  function computeStatus(lead: any): string {
    if (lead.feasible === false) return 'Not Feasible';
    if (lead.approved === false || lead.bankApproved === false) return 'Declined';
    
    const companyDone = lead.companyCompletedAt !== null;
    const bankNeeded = lead.hasBankProject; // Standalone bank projects only
    const bankDone = lead.bankCompletedAt !== null;
    
    if (companyDone && (!bankNeeded || bankDone)) return 'Completed';
    if (companyDone && bankNeeded && !bankDone) return 'Bank Pending';
    
    if (lead.paymentReceivedAt || lead.bankPaymentReceivedAt) {
      if (bankNeeded && lead.bankPaymentReceivedAt && !bankDone) return 'Bank In Progress';
      if (lead.paymentReceivedAt && !companyDone) return 'Company In Progress';
    }
    
    if (lead.approved === true && !lead.paymentReceivedAt) return 'Awaiting Payment';
    
    const hasCompanyInvoice = lead.companyInvoiceNumber && lead.companyInvoiceSentAt;
    const hasBankInvoice = lead.bankInvoiceNumber && lead.bankInvoiceSentAt;
    
    if (hasCompanyInvoice || hasBankInvoice) {
      // If invoice sent but not approved yet, it's awaiting payment
      if (lead.approved === null) return 'Awaiting Payment';
      return 'Invoice Sent';
    }
    
    const hasCompanyQuote = lead.companyQuoteSentAt;
    const hasBankQuote = lead.bankQuoteSentAt;
    
    if ((hasCompanyQuote || hasBankQuote) && lead.approved === null && !hasCompanyInvoice && !hasBankInvoice) {
      return 'Quoted';
    }
    
    if (lead.quotedAmountAed || lead.bankQuotedAmountAed) return 'Quoted';
    if (lead.feasible === null && lead.agentContactedAt) return 'Feasibility Review';
    if (lead.agentContactedAt) return 'Agent Contacted';
    return 'New';
  }

  // Combine and compute KPIs
  const allLeads = websiteLeads.map(l => ({ ...l, leadType: 'Lead' as const }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalLeads = allLeads.length;
  let newLeadsToday = 0;
  let newLeads = 0;
  let agentContacted = 0;
  let feasibilityReview = 0;
  let quoted = 0;
  let invoiceSent = 0;
  let awaitingPayment = 0;
  let paymentReceived = 0;
  let inProgress = 0;
  let completed = 0;
  let notFeasible = 0;
  let declined = 0;
  let awaitingAction = 0;
  let awaitingQuote = 0;
  let awaitingPaymentCount = 0;
  let totalQuoted = 0;
  let totalPaid = 0;
  let pendingPayments = 0;
  let withAthar = 0;
  let withAnoop = 0;
  let withSelf = 0;
  let unassigned = 0;

  for (const lead of allLeads) {
    const status = computeStatus(lead);
    const createdDate = new Date(lead.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    
    // New leads today
    if (createdDate.getTime() === today.getTime()) {
      newLeadsToday++;
    }

    // Status counts
    if (status === 'New') newLeads++;
    else if (status === 'Agent Contacted') agentContacted++;
    else if (status === 'Feasibility Review') feasibilityReview++;
    else if (status === 'Quoted') quoted++;
    else if (status === 'Invoice Sent') invoiceSent++;
    else if (status === 'Awaiting Payment') awaitingPayment++;
    else if (status === 'Payment Received' || status === 'Company In Progress' || status === 'Bank In Progress') {
      paymentReceived++;
      inProgress++;
    }
    else if (status === 'Completed') completed++;
    else if (status === 'Not Feasible') notFeasible++;
    else if (status === 'Declined') declined++;

    // Awaiting action (needs admin attention)
    if (status === 'New' || status === 'Quoted' || status === 'Invoice Sent') {
      awaitingAction++;
    }

    // Awaiting quote
    if (lead.agentContactedAt && lead.feasible === null) {
      awaitingQuote++;
    }

    // Awaiting payment
    if (status === 'Awaiting Payment' || (lead.companyInvoiceSentAt && !lead.paymentReceivedAt) || (lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt)) {
      awaitingPaymentCount++;
    }

    // Revenue metrics
    if (lead.quotedAmountAed) totalQuoted += lead.quotedAmountAed;
    if (lead.bankQuotedAmountAed) totalQuoted += lead.bankQuotedAmountAed;
    if (lead.paymentReceivedAt && lead.quotedAmountAed) totalPaid += lead.quotedAmountAed;
    if (lead.bankPaymentReceivedAt && lead.bankQuotedAmountAed) totalPaid += lead.bankQuotedAmountAed;
    if (lead.companyInvoiceSentAt && !lead.paymentReceivedAt && lead.quotedAmountAed) {
      pendingPayments += lead.quotedAmountAed;
    }
    if (lead.bankInvoiceSentAt && !lead.bankPaymentReceivedAt && lead.bankQuotedAmountAed) {
      pendingPayments += lead.bankQuotedAmountAed;
    }

    // Agent assignment - use new system first, fallback to legacy
    let assignedAgentId: string | null = null;
    if (lead.leadType === 'Lead' && (lead as any).agentAssignments && (lead as any).agentAssignments.length > 0) {
      // Use primary agent from new assignment system
      const primaryAssignment = (lead as any).agentAssignments.find((la: any) => la.isPrimary);
      if (primaryAssignment) {
        assignedAgentId = primaryAssignment.agentId;
      } else if ((lead as any).agentAssignments.length > 0) {
        // Fallback to first agent if no primary
        assignedAgentId = (lead as any).agentAssignments[0].agentId;
      }
    }
    
    // Fallback to legacy assignedAgent field
    const assigned = assignedAgentId || lead.assignedAgent || 'unassigned';
    
    // Count by agent - check if it's a UUID (new system) or legacy string
    if (assignedAgentId && agentNameMap.has(assignedAgentId)) {
      // New system - get agent name and check if it contains legacy names
      const agentName = agentNameMap.get(assignedAgentId)?.toLowerCase() || '';
      if (agentName.includes('athar') || assignedAgentId.includes('athar')) {
        withAthar++;
      } else if (agentName.includes('anoop') || assignedAgentId.includes('anoop')) {
        withAnoop++;
      } else if (agentName.includes('self') || agentName.includes('zahed') || assignedAgentId.includes('self')) {
        withSelf++;
      } else {
        // New agent - count as assigned but not in legacy categories
        // For now, we'll count new agents separately or add to unassigned
        // You may want to add a "Other Agents" category later
        unassigned++;
      }
    } else {
      // Legacy system
      if (assigned === 'athar') withAthar++;
      else if (assigned === 'anoop') withAnoop++;
      else if (assigned === 'self') withSelf++;
      else unassigned++;
    }
  }

  // Transform leads data for DashboardContent component
  const transformedLeads = websiteLeads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt,
    fullName: lead.fullName || 'Unknown',
    status: computeStatus(lead),
    quotedAmountAed: lead.quotedAmountAed,
    bankQuotedAmountAed: lead.bankQuotedAmountAed,
    paymentReceivedAt: lead.paymentReceivedAt,
    bankPaymentReceivedAt: lead.bankPaymentReceivedAt,
    companyQuoteSentAt: lead.companyQuoteSentAt,
    bankQuoteSentAt: lead.bankQuoteSentAt,
    companyInvoiceSentAt: lead.companyInvoiceSentAt,
    bankInvoiceSentAt: lead.bankInvoiceSentAt,
    companyCompletedAt: lead.companyCompletedAt,
    bankCompletedAt: lead.bankCompletedAt,
  }));

  const metrics = {
    totalLeads,
    newLeadsToday,
    newLeads,
    agentContacted,
    feasibilityReview,
    quoted,
    invoiceSent,
    awaitingPayment,
    paymentReceived,
    inProgress,
    completed,
    notFeasible,
    declined,
    awaitingAction,
    awaitingQuote,
    awaitingPaymentCount,
    totalQuoted,
    totalPaid,
    pendingPayments,
    withAthar,
    withAnoop,
    withSelf,
    unassigned,
  };

  return (
    <div className="bg-[#faf8f3] min-h-screen">
      <DashboardRefresh interval={30000} />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                  <p className="text-sm text-gray-500">Overview of leads and workflow status</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/admin/leads"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Leads
                </Link>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <DashboardContent initialLeads={transformedLeads} initialMetrics={metrics} />
        </div>
      </div>
    </div>
  );
}

