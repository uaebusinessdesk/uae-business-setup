import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const assignment = await db.leadAgent.findFirst({
      where: {
        leadId: id,
        agentId: agentId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Agent assignment not found' },
        { status: 404 }
      );
    }

    // Get all assignments for this lead
    const allAssignments = await db.leadAgent.findMany({
      where: { leadId: id },
      orderBy: { order: 'asc' },
    });

    // Find the minimum order that's available (not declined)
    // We want to set this agent's order to be the next available position
    const availableOrders = allAssignments
      .filter(a => a.status !== 'declined' && a.id !== assignment.id)
      .map(a => a.order)
      .sort((a, b) => a - b);

    // Find the first available order position
    let nextOrder = 0;
    if (availableOrders.length > 0) {
      // Find the first gap or use the max + 1
      for (let i = 0; i <= availableOrders.length; i++) {
        if (!availableOrders.includes(i)) {
          nextOrder = i;
          break;
        }
      }
      if (nextOrder === 0 && availableOrders.length > 0) {
        nextOrder = Math.max(...availableOrders) + 1;
      }
    }

    // Update the assignment to be next (set order and status to pending)
    const updated = await db.leadAgent.update({
      where: { id: assignment.id },
      data: {
        order: nextOrder,
        status: 'pending',
      },
      include: {
        agent: true,
      },
    });

    // Reorder all other assignments to maintain proper order
    // Get all assignments except the one we just updated, sorted by current order
    const otherAssignments = allAssignments
      .filter(a => a.id !== assignment.id)
      .sort((a, b) => a.order - b.order);

    // Reassign orders: skip declined agents, maintain order for others
    let currentOrder = 0;
    for (const otherAssignment of otherAssignments) {
      if (otherAssignment.status !== 'declined') {
        // If this agent's order is less than nextOrder, keep it
        // Otherwise, increment order
        if (otherAssignment.order >= nextOrder) {
          await db.leadAgent.update({
            where: { id: otherAssignment.id },
            data: { order: otherAssignment.order + 1 },
          });
        }
      }
    }

    // Fetch all updated assignments
    const allUpdated = await db.leadAgent.findMany({
      where: { leadId: id },
      include: {
        agent: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(allUpdated);
  } catch (error) {
    console.error('Error setting next agent:', error);
    return NextResponse.json(
      { error: 'Failed to set next agent' },
      { status: 500 }
    );
  }
}

