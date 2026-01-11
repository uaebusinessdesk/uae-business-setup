import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const q = searchParams.get('q') || '';
    const setupType = searchParams.get('setupType') || '';
    const serviceChoice = searchParams.get('serviceChoice') || '';
    const status = searchParams.get('status') || 'all';
    const assigned = searchParams.get('assigned') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    // Build where clause
    const leadWhere: any = {};

    // Source filter - only website leads
    const fetchWebsiteLeads = source === 'all' || source === 'website';

    // Search filter
    if (q) {
      const searchFilter = { contains: q };
      if (fetchWebsiteLeads) {
        leadWhere.OR = [
          { fullName: searchFilter },
          { whatsapp: searchFilter },
          { email: searchFilter },
        ];
      }
    }

    // Service filter
    if (setupType && setupType !== 'all' && fetchWebsiteLeads) {
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

    // Fetch leads
    const websiteLeads = fetchWebsiteLeads ? await db.lead.findMany({
      where: leadWhere,
      orderBy,
    }) : [];

    // Normalize results
    const normalizedLeads = websiteLeads.map((lead) => ({
        id: lead.id,
        leadType: 'Lead' as const,
        source: 'website' as const,
        name: lead.fullName,
        contact: lead.whatsapp,
        email: lead.email,
        service: lead.setupType,
        status: computeWebsiteLeadStatus(lead),
        assignedAgentId: lead.assignedAgent,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        // Workflow fields
        agentContactedAt: lead.agentContactedAt,
        feasible: lead.feasible,
        quotedAmountAed: lead.quotedAmountAed,
        companyQuoteSentAt: lead.companyQuoteSentAt,
        companyPaymentLink: lead.companyPaymentLink,
        approved: lead.approved,
        paymentReceivedAt: lead.paymentReceivedAt,
        companyCompletedAt: lead.companyCompletedAt,
        hasBankProject: lead.hasBankProject || lead.needsBankAccount,
        bankQuotedAmountAed: lead.bankQuotedAmountAed,
        bankQuoteSentAt: lead.bankQuoteSentAt,
        bankPaymentLink: lead.bankPaymentLink,
        bankApproved: lead.bankApproved,
        bankPaymentReceivedAt: lead.bankPaymentReceivedAt,
        bankCompletedAt: lead.bankCompletedAt,
        bankAfterCompany: lead.bankAfterCompany,
        companyInvoiceNumber: lead.companyInvoiceNumber,
        bankInvoiceNumber: lead.bankInvoiceNumber,
        // Original data for detail page
        _original: lead,
      }));

    // Sort combined results
    normalizedLeads.sort((a, b) => {
      if (sort === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Apply status filter to website leads (computed status)
    let filteredLeads = normalizedLeads;
    if (status && status !== 'all') {
      filteredLeads = normalizedLeads.filter((lead) => {
        // Website leads - status already computed
        return lead.status === status;
      });
    }

    return NextResponse.json(filteredLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// Helper function to compute website lead status
function computeWebsiteLeadStatus(lead: any): string {
  // Closed states (check first)
  if (lead.feasible === false) return 'Not Feasible';
  if (lead.approved === false || lead.bankApproved === false) return 'Declined';
  
  // Completed states
  const companyDone = lead.companyCompletedAt !== null;
  const bankNeeded = lead.hasBankProject; // Only standalone bank projects, not combined services
  const bankDone = lead.bankCompletedAt !== null;
  
  if (companyDone && (!bankNeeded || bankDone)) {
    return 'Completed';
  }
  if (companyDone && bankNeeded && !bankDone) {
    return 'Bank Pending';
  }
  
  // Active workflow states
  if (lead.paymentReceivedAt || lead.bankPaymentReceivedAt) {
    if (bankNeeded && lead.bankPaymentReceivedAt && !bankDone) {
      return 'Bank In Progress';
    }
    if (lead.paymentReceivedAt && !companyDone) {
      return 'Company In Progress';
    }
  }
  
  if (lead.approved === true && !lead.paymentReceivedAt) {
    return 'Awaiting Payment';
  }
  
  // Invoice sent states
  const hasCompanyInvoice = lead.companyInvoiceNumber && lead.companyInvoiceSentAt;
  const hasBankInvoice = lead.bankInvoiceNumber && lead.bankInvoiceSentAt;
  
  if (hasCompanyInvoice || hasBankInvoice) {
    if (lead.approvalRequestedAt && lead.approved === null) {
      return 'Awaiting Payment'; // Invoice sent, waiting for payment
    }
    return 'Invoice Sent';
  }
  
  // Quote approved state
  const hasCompanyQuote = lead.companyQuoteSentAt;
  const hasBankQuote = lead.bankQuoteSentAt;
  
  if ((hasCompanyQuote || hasBankQuote) && lead.approved === null && !hasCompanyInvoice && !hasBankInvoice) {
    return 'Quoted';
  }
  
  // Quote state
  if (lead.quotedAmountAed || lead.bankQuotedAmountAed) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Determine needsBankAccount
    // Only set to true if setupType is "bank" (standalone bank service)
    // For company setup (mainland, freezone, offshore, not_sure), always set to false
    // Combined services are no longer supported - customers must use separate forms
    const needsBankAccount = body.setupType === 'bank' ? true : false;

    // Determine bankStage based on needsBankAccount
    const bankStage = needsBankAccount ? 'queued' : 'not_applicable';

    // Auto-assign agent based on setupType (matching capture route logic)
    let assignedAgent = 'self';
    if (body.setupType === 'mainland') {
      assignedAgent = 'athar';
    } else if (body.setupType === 'freezone' || body.setupType === 'offshore') {
      assignedAgent = 'anoop';
    } else if (body.setupType === 'bank' || body.setupType === 'existing-company') {
      assignedAgent = 'self'; // Zahed handles bank account setup
    } else if (body.setupType === 'not_sure') {
      assignedAgent = 'self';
    }

    // Legacy field for backward compatibility
    let companyAssignedTo = 'unassigned';
    if (body.setupType === 'mainland') {
      companyAssignedTo = 'athar';
    } else if (body.setupType === 'freezone' || body.setupType === 'offshore') {
      companyAssignedTo = 'anoop';
    }
    
    const lead = await db.lead.create({
      data: {
        fullName: body.fullName,
        whatsapp: body.whatsapp,
        email: body.email || null,
        nationality: body.nationality || null,
        residenceCountry: body.residenceCountry || null,
        setupType: body.setupType,
        activity: body.activity || null,
        shareholdersCount: body.shareholdersCount ? parseInt(String(body.shareholdersCount)) : null,
        visasRequired: body.visasRequired === true || body.visasRequired === 'yes' ? true : body.visasRequired === false || body.visasRequired === 'no' ? false : null,
        visasCount: body.visasCount ? parseInt(String(body.visasCount)) : null,
        timeline: body.timeline || null,
        notes: body.notes || null,
        assignedTo: 'unassigned', // Legacy field
        stage: 'new', // Legacy field
        // Deal Workflow - Company
        assignedAgent: assignedAgent,
        // Company Setup Tracking - defaults (legacy)
        companyStage: 'new',
        companyFeasible: false,
        companyAssignedTo: companyAssignedTo,
        companyInvoiceStatus: 'not_sent',
        // Bank Setup Tracking - defaults
        needsBankAccount: needsBankAccount,
        bankStage: bankStage,
        bankInvoiceStatus: 'not_sent',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

