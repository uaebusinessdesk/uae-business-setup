import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentIds, serviceType } = body;

    if (!agentIds || !Array.isArray(agentIds)) {
      return NextResponse.json(
        { error: 'agentIds must be an array' },
        { status: 400 }
      );
    }

    // Allow empty array to unassign all agents
    if (agentIds.length === 0) {
      // Delete all existing assignments
      await db.leadAgent.deleteMany({
        where: { leadId: id },
      });

      // Update legacy assignedAgent field to 'unassigned'
      await db.lead.update({
        where: { id },
        data: {
          assignedAgent: 'unassigned',
        },
      });

      return NextResponse.json([]);
    }

    // Check if lead exists
    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Verify all agent IDs exist
    const agents = await db.agent.findMany({
      where: {
        id: { in: agentIds },
        isActive: true,
      },
    });

    if (agents.length !== agentIds.length) {
      return NextResponse.json(
        { error: 'One or more agent IDs are invalid' },
        { status: 400 }
      );
    }

    // Determine service type if not provided
    let determinedServiceType: string = serviceType || '';
    if (!determinedServiceType || (determinedServiceType !== 'company' && determinedServiceType !== 'bank')) {
      // Check if any agent name contains bank pattern
      const bankPattern = /- (adcb|wio|enbd|emirates nbd|dib|fgb|adib|rakbank|cbd|mashreq|hsbc|standard chartered|citibank|barclays|deutsche bank|commercial bank|ajman bank|nbad|first abu dhabi bank|fab)/i;
      const hasBankAgent = agents.some(agent => {
        const agentName = agent.name.toLowerCase();
        return bankPattern.test(agent.name) || agentName.includes('bank') || agentName.includes('adcb') || agentName.includes('wio') || agentName.includes('enbd');
      });
      determinedServiceType = hasBankAgent ? 'bank' : 'company';
    }
    
    // Ensure we have a valid service type
    if (determinedServiceType !== 'company' && determinedServiceType !== 'bank') {
      determinedServiceType = 'company'; // Default to company
    }

    // Delete existing assignments for this service type
    await db.leadAgent.deleteMany({
      where: { 
        leadId: id,
        serviceType: determinedServiceType,
      },
    });

    // Helper function to extract bank name from agent name
    const extractBankName = (agentName: string): string | null => {
      const bankPattern = /- (adcb|wio|enbd|emirates nbd|dib|fgb|adib|rakbank|cbd|mashreq|hsbc|standard chartered|citibank|barclays|deutsche bank|commercial bank|ajman bank|nbad|first abu dhabi bank|fab)/i;
      const match = agentName.match(bankPattern);
      if (match) {
        return match[1].toUpperCase();
      }
      const lowerName = agentName.toLowerCase();
      if (lowerName.includes('adcb')) return 'ADCB';
      if (lowerName.includes('wio')) return 'WIO';
      if (lowerName.includes('enbd') || lowerName.includes('emirates nbd')) return 'ENBD';
      return null;
    };

    // Create new assignments with order-based system
    // Order is based on array index: first agent = 0, second = 1, etc.
    await Promise.all(
      agentIds.map((agentId: string, index: number) => {
        const agent = agents.find(a => a.id === agentId);
        const bankName = determinedServiceType === 'bank' && agent ? extractBankName(agent.name) : null;
        const isCurrent = index === 0; // First agent is current for this service type
        
        return db.leadAgent.create({
          data: {
            leadId: id,
            agentId: agentId,
            order: index, // Order based on position in array
            status: 'assigned', // All new assignments start as assigned
            serviceType: determinedServiceType,
            bankName: bankName,
            isCurrent: isCurrent,
            isPrimary: index === 0, // Keep for backward compatibility (first agent is primary)
          },
        });
      })
    );

    // Update legacy assignedAgent field for backward compatibility
    // First agent (order 0) is used for legacy field
    const firstAgent = agents.find(a => a.id === agentIds[0]);
    let legacyAssignedAgent = 'unassigned';
    if (firstAgent) {
      const lowerCaseName = firstAgent.name.toLowerCase();
      if (lowerCaseName.includes('athar')) {
        legacyAssignedAgent = 'athar';
      } else if (lowerCaseName.includes('anoop')) {
        legacyAssignedAgent = 'anoop';
      } else if (lowerCaseName.includes('self') || lowerCaseName.includes('zahed')) {
        legacyAssignedAgent = 'self';
      } else {
        legacyAssignedAgent = firstAgent.name;
      }
    }

    await db.lead.update({
      where: { id },
      data: {
        assignedAgent: legacyAssignedAgent,
      },
    });

    // Fetch updated assignments ordered by order field
    const assignments = await db.leadAgent.findMany({
      where: { leadId: id },
      include: {
        agent: true,
      },
      orderBy: {
        order: 'asc', // Order by order field (0, 1, 2, ...)
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error assigning agents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to assign agents: ${errorMessage}` },
      { status: 500 }
    );
  }
}

