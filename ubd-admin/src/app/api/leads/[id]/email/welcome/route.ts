import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { buildWelcomeEmail } from '@/lib/emailTemplates';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/email/welcome
 * Send welcome email to lead
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Try to find lead in both tables
    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    // Build email
    const { subject, body, htmlBody } = buildWelcomeEmail(lead);

    // Send email (explicitly pass emailType="welcome" to exclude CC)
    const { sendCustomerEmail } = await import('@/lib/sendCustomerEmail');
    await sendCustomerEmail({
      to: lead.email,
      subject,
      html: htmlBody || body.replace(/\n/g, '<br>'),
    }, 'welcome');

    // Log activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        action: 'email_sent',
        message: 'Welcome email sent',
      },
    });

    return NextResponse.json({ success: true, message: 'Welcome email sent' });
  } catch (error: any) {
    console.error('[API/Leads/Email/Welcome] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email', details: error.message },
      { status: 500 }
    );
  }
}

