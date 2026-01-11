import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; agentId: string }> }
) {
  try {
    const { id, agentId } = await params;

    // Find the assignment
    const assignment = await db.leadAgent.findFirst({
      where: {
        leadId: id,
        agentId: agentId,
      },
      include: {
        agent: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Agent assignment not found' },
        { status: 404 }
      );
    }

    // Get the service type of this assignment
    const serviceType = assignment.serviceType;

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Assignment does not have a service type' },
        { status: 400 }
      );
    }

    // Unset current flag for all other agents of the same service type
    await db.leadAgent.updateMany({
      where: {
        leadId: id,
        serviceType: serviceType,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    // Set this agent as current
    const updated = await db.leadAgent.update({
      where: { id: assignment.id },
      data: {
        isCurrent: true,
      },
      include: {
        agent: true,
      },
    });

    // Fetch all assignments for this lead to return
    const allAssignments = await db.leadAgent.findMany({
      where: { leadId: id },
      include: {
        agent: true,
      },
      orderBy: [
        { serviceType: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json(allAssignments);
  } catch (error) {
    console.error('Error setting current agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to set current agent: ${errorMessage}` },
      { status: 500 }
    );
  }
}

