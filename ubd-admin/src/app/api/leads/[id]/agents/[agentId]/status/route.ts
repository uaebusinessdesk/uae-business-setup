import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; agentId: string }> }
) {
  try {
    const { id, agentId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['assigned', 'contacted', 'accepted', 'working', 'completed', 'declined', 'on_hold', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
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

    // Prepare update data with status and appropriate timestamp
    const now = new Date();
    const updateData: any = { status };

    // Update timestamp fields based on status
    if (status === 'contacted') {
      updateData.contactedAt = now;
    } else if (status === 'accepted') {
      updateData.acceptedAt = now;
      // If not already contacted, set contactedAt too
      if (!assignment.contactedAt) {
        updateData.contactedAt = now;
      }
    } else if (status === 'working') {
      updateData.startedWorkingAt = now;
      // If not already accepted, set acceptedAt too
      if (!assignment.acceptedAt) {
        updateData.acceptedAt = now;
      }
      if (!assignment.contactedAt) {
        updateData.contactedAt = now;
      }
    } else if (status === 'completed') {
      updateData.completedAt = now;
      // Ensure previous timestamps are set
      if (!assignment.startedWorkingAt) {
        updateData.startedWorkingAt = now;
      }
      if (!assignment.acceptedAt) {
        updateData.acceptedAt = now;
      }
      if (!assignment.contactedAt) {
        updateData.contactedAt = now;
      }
    } else if (status === 'declined') {
      updateData.declinedAt = now;
    } else if (status === 'assigned') {
      // Retry - clear declined timestamp
      updateData.declinedAt = null;
    }

    // Update the assignment status
    const updated = await db.leadAgent.update({
      where: { id: assignment.id },
      data: updateData,
      include: {
        agent: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating agent status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update agent status: ${errorMessage}` },
      { status: 500 }
    );
  }
}

