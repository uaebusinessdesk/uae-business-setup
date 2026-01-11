import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { sendText } from '@/lib/whatsapp';
import { getInternalNotifyRecipients } from '@/config/app';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/[id]/notify-internal
 * Sends WhatsApp message to all internal recipients for a legacy Lead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await params;
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch the lead
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get agent name or default to '-'
    const agentName = lead.assignedAgent || '-';

    // Build the message
    const message = `New lead for review ✅
Lead ID: ${lead.id}
Client WhatsApp: ${lead.whatsapp || '-'}
Email: ${lead.email || '-'}
Service: ${lead.setupType}
Status: ${lead.agentContactedAt ? 'Agent Contacted' : 'New'}
Assigned Agent: ${agentName}`;

    // Get all internal recipient numbers from config
    const internalRecipients = getInternalNotifyRecipients();
    
    if (internalRecipients.length === 0) {
      return NextResponse.json(
        { error: 'Internal notification numbers not configured. Please set INTERNAL_NOTIFY_NUMBERS environment variable.' },
        { status: 500 }
      );
    }

    // Send to all internal recipients
    const results = await Promise.allSettled(
      internalRecipients.map(async (recipient) => {
        try {
          await sendText(recipient.number, message);
          console.log(`[Internal Notification] Sent to ${recipient.name} (${recipient.number}) for lead ${leadId}`);
          return { recipient: recipient.name, success: true };
        } catch (error: any) {
          console.error(`[Internal Notification] Failed to send to ${recipient.name}:`, error.message);
          return { recipient: recipient.name, success: false, error: error.message };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Update lead status only if at least one message was sent successfully
    if (successful > 0 && !lead.agentContactedAt) {
      const now = new Date();
      await db.lead.update({
        where: { id: leadId },
        data: {
          agentContactedAt: now,
          updatedAt: now,
        },
      });
      console.log(`[Internal Notification] Updated Lead ${leadId} agentContactedAt`);
    }

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} of ${results.length} internal recipients`,
      details: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { recipient: 'unknown', success: false }
      ),
      statusUpdated: successful > 0 && !lead.agentContactedAt,
    });
  } catch (error: any) {
    console.error('[API/Leads/Notify-Internal] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send internal notifications', details: error.message },
      { status: 500 }
    );
  }
}




