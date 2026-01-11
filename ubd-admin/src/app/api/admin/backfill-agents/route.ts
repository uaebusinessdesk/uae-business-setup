import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

/**
 * One-time backfill script to assign agents to existing leads
 * Access: /api/admin/backfill-agents
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all leads where assignedAgent is null or 'unassigned'
    // Note: We'll filter for 'unassigned' and also check for null in memory
    const allLeads = await db.lead.findMany({
      where: {
        OR: [
          { assignedAgent: 'unassigned' },
          { assignedAgent: { not: { in: ['athar', 'anoop', 'self'] } } },
        ],
      },
      select: {
        id: true,
        setupType: true,
        assignedAgent: true,
      },
    });

    // Filter in memory for null or unassigned
    const leads = allLeads.filter(lead => !lead.assignedAgent || lead.assignedAgent === 'unassigned');

    let updated = 0;
    let skipped = 0;

    for (const lead of leads) {
      let assignedAgent = 'self'; // Default
      
      if (lead.setupType === 'mainland') {
        assignedAgent = 'athar';
      } else if (lead.setupType === 'freezone' || lead.setupType === 'offshore') {
        assignedAgent = 'anoop';
      } else if (lead.setupType === 'bank') {
        assignedAgent = 'self';
      } else if (lead.setupType === 'not_sure') {
        assignedAgent = 'self';
      }

      // Only update if different
      if (lead.assignedAgent !== assignedAgent) {
        await db.lead.update({
          where: { id: lead.id },
          data: { assignedAgent },
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Backfill completed: ${updated} leads updated, ${skipped} skipped`,
      stats: {
        total: leads.length,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json(
      { error: 'Failed to backfill agents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


