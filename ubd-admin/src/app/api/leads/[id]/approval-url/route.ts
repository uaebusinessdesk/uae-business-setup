import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createApprovalToken } from '@/lib/quote-approval-token';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leads/[id]/approval-url
 * Generate approval URL for testing (dev only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find lead
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Generate approval token
    const approvalToken = await createApprovalToken(id, 'Lead');
    
    // Get base URL (same logic as email route)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.ADMIN_BASE_URL || 'http://localhost:3001';
    const approvalUrl = `${baseUrl}/quote/approve?token=${approvalToken}`;

    return NextResponse.json({ approvalUrl });
  } catch (error: any) {
    console.error('[API/Leads/ApprovalUrl] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate approval URL', details: error.message },
      { status: 500 }
    );
  }
}




