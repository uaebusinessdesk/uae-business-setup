import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';
import { toSetupTypeLabel } from '@/lib/setupType';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quote/details
 * Get latest quote details from database using token
 * Body: { token: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body. Expected JSON with token field.' },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    let payload: { leadId: string; leadType: 'Lead'; action: string; project: 'company' | 'bank' | 'bank-deal' } | null;
    try {
      const verifiedPayload = await verifyApprovalToken(token);
      payload = verifiedPayload ? {
        ...verifiedPayload,
        project: verifiedPayload.project === 'bank-deal' ? 'bank' : verifiedPayload.project as 'bank' | 'company'
      } : null;
    } catch (verifyError: any) {
      console.error('[API/Quote/Details] Token verification error:', verifyError);
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract project (default to 'company' for backward compatibility)
    const project = payload.project || 'company';

    // Fetch lead from database
    let lead: any = null;

    try {
      const leadSelect = project === 'bank-deal' ? {
        bankDealQuotedAmountAed: true,
        fullName: true,
        setupType: true,
        hasBankProject: true,
        bankDealQuoteViewedAt: true,
        bankDealProceedConfirmedAt: true,
        bankDealQuoteDeclinedAt: true,
        bankDealQuoteDeclineReason: true,
        bankDealQuoteApprovedAt: true,
      } : project === 'bank' ? {
        bankQuotedAmountAed: true,
        fullName: true,
        setupType: true,
        hasBankProject: true,
        bankQuoteViewedAt: true,
        bankProceedConfirmedAt: true,
        bankQuoteDeclinedAt: true,
        bankQuoteDeclineReason: true,
        bankQuoteApprovedAt: true,
        bankApproved: true,
        bankQuoteQuestionsAt: true,
        bankQuoteQuestionsReason: true,
      } : {
        quotedAmountAed: true,
        fullName: true,
        setupType: true,
        hasBankProject: true,
        quoteViewedAt: true,
        proceedConfirmedAt: true,
        quoteDeclinedAt: true,
        quoteDeclineReason: true,
        quoteApprovedAt: true,
        approved: true,
        quoteQuestionsAt: true,
        quoteQuestionsReason: true,
      };
      
      lead = await db.lead.findUnique({ 
        where: { id: payload.leadId },
        select: leadSelect,
      });
    } catch (dbError: any) {
      console.error('QUOTE DETAILS ERROR FULL:', dbError);
      const isDev = process.env.NODE_ENV !== 'production';
      const errorResponse: any = {
        ok: false,
        error: 'Failed to fetch lead from database',
      };
      if (isDev) {
        errorResponse.debugMessage = dbError instanceof Error ? dbError.message : String(dbError);
        errorResponse.debugName = (dbError as any)?.name;
        errorResponse.debugCode = (dbError as any)?.code;
        errorResponse.debugStack = (dbError as any)?.stack?.split('\n').slice(0, 6).join('\n');
      }
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: 'Quote not found or link expired.' },
        { status: 404 }
      );
    }

    // Extract quote information
    const quotedAmountAed = project === 'bank-deal'
      ? (lead as any).bankDealQuotedAmountAed
      : project === 'bank'
      ? (lead as any).bankQuotedAmountAed
      : (lead as any).quotedAmountAed || null;
    
    // Get customer name
    const customerName = (lead as any).fullName || null;
    
    // Get setupType for service name
    let setupType: string | null = null;
    setupType = (lead as any).setupType || null;
    
    // Get bank account needs
    const needsBankAccount = (lead as any).needsBankAccount || false;
    const hasBankProject = (lead as any).hasBankProject || false;
    
    // Service name: use toSetupTypeLabel to get correct label (handles bank, mainland, freezone, offshore)
    // For Bank Deal, always use "Bank Account Setup"
    const serviceName = project === 'bank-deal' ? 'Bank Account Setup' : toSetupTypeLabel(setupType);
    
    // Determine what this quote covers
    const isBankDealQuote = project === 'bank-deal';
    const isBankQuote = project === 'bank';
    const serviceNameIncludesBank = serviceName.toLowerCase().includes('bank account');
    const isCompanyQuote = project === 'company';
    
    // Determine quote coverage
    let quoteCoverage: string;
    if (isBankDealQuote) {
      quoteCoverage = 'Bank Account Setup only';
    } else if (isBankQuote) {
      quoteCoverage = 'Bank Account Setup only';
    } else if (serviceNameIncludesBank && isCompanyQuote) {
      // Service name shows "+ Bank Account" but this is a company quote
      // This means bank account will be quoted separately later
      quoteCoverage = 'Company Setup only (Bank Account Setup will be quoted separately after company incorporation is completed)';
    } else {
      quoteCoverage = 'Company Setup only';
    }

    // Get decision tracking dates - based on project type
    const quoteViewedAt = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteViewedAt ? new Date((lead as any).bankDealQuoteViewedAt).toISOString() : null)
      : project === 'bank'
      ? ((lead as any).bankQuoteViewedAt ? new Date((lead as any).bankQuoteViewedAt).toISOString() : null)
      : ((lead as any).quoteViewedAt ? new Date((lead as any).quoteViewedAt).toISOString() : null);
    
    // Decision fields - based on project type
    const proceededAt = project === 'bank-deal'
      ? ((lead as any).bankDealProceedConfirmedAt ? new Date((lead as any).bankDealProceedConfirmedAt).toISOString() : null)
      : project === 'bank'
      ? ((lead as any).bankProceedConfirmedAt ? new Date((lead as any).bankProceedConfirmedAt).toISOString() : null)
      : ((lead as any).proceedConfirmedAt ? new Date((lead as any).proceedConfirmedAt).toISOString() : null);
    const approvedAt = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteApprovedAt ? new Date((lead as any).bankDealQuoteApprovedAt).toISOString() : proceededAt)
      : project === 'bank'
      ? ((lead as any).bankQuoteApprovedAt ? new Date((lead as any).bankQuoteApprovedAt).toISOString() : proceededAt)
      : ((lead as any).quoteApprovedAt ? new Date((lead as any).quoteApprovedAt).toISOString() : proceededAt);
    const declinedAt = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteDeclinedAt ? new Date((lead as any).bankDealQuoteDeclinedAt).toISOString() : null)
      : project === 'bank'
      ? ((lead as any).bankQuoteDeclinedAt ? new Date((lead as any).bankQuoteDeclinedAt).toISOString() : null)
      : ((lead as any).quoteDeclinedAt ? new Date((lead as any).quoteDeclinedAt).toISOString() : null);
    const quoteDeclineReason = project === 'bank-deal'
      ? ((lead as any).bankDealQuoteDeclineReason || null)
      : project === 'bank'
      ? ((lead as any).bankQuoteDeclineReason || null)
      : ((lead as any).quoteDeclineReason || null);
    const questionsAt = project === 'bank'
      ? ((lead as any).bankQuoteQuestionsAt ? new Date((lead as any).bankQuoteQuestionsAt).toISOString() : null)
      : ((lead as any).quoteQuestionsAt ? new Date((lead as any).quoteQuestionsAt).toISOString() : null);
    const questionsReason = project === 'bank'
      ? ((lead as any).bankQuoteQuestionsReason || null)
      : ((lead as any).quoteQuestionsReason || null);

    // Check if already proceeded, declined, or has questions based on project
    const alreadyProceeded = !!proceededAt;
    const alreadyDeclined = !!declinedAt;
    const alreadyHasQuestions = !!questionsAt;

    // Build response
    const response: any = {
      ok: true,
      leadType: 'Lead',
      lead: {
        quotedAmountAed,
        customerName,
        serviceName,
        quoteCoverage,
        quoteViewedAt,
        proceededAt,
        approvedAt,
        declinedAt,
        quoteDeclineReason,
        questionsAt,
        questionsReason,
        alreadyProceeded,
        alreadyDeclined,
        alreadyHasQuestions,
      },
      // Also include flat fields for backward compatibility with existing page
      quotedAmountAed,
      serviceName,
      customerName,
      quoteCoverage,
      quoteViewedAt,
      proceededAt,
      approvedAt,
      declinedAt,
      quoteDeclineReason,
      questionsAt,
      questionsReason,
      alreadyProceeded,
      alreadyDeclined,
      alreadyHasQuestions,
    };

    // DEV: Add debug block to see which field triggered "Already proceeded"
    if (process.env.NODE_ENV !== 'production') {
      response.debug = {
        proceedConfirmedAt: (lead as any).proceedConfirmedAt,
        project,
        setupType,
        serviceName,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('QUOTE DETAILS ERROR FULL:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
      ok: false,
      error: 'Failed to fetch quote details',
    };
    if (isDev) {
      errorResponse.debugMessage = error instanceof Error ? error.message : String(error);
      errorResponse.debugName = (error as any)?.name;
      errorResponse.debugCode = (error as any)?.code;
      errorResponse.debugStack = (error as any)?.stack?.split('\n').slice(0, 6).join('\n');
    }
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

