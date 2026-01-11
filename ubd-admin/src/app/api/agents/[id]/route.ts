import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            serviceType: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, organizationName, whatsappNumber, email, serviceIds, isActive } = body;

    // Check if agent exists
    const existingAgent = await db.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update agent basic info
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (organizationName !== undefined) updateData.organizationName = organizationName.trim();
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Only update if there's data to update
    if (Object.keys(updateData).length > 0) {
      await db.agent.update({
        where: { id },
        data: updateData,
      });
    }

    // Update service associations if provided
    if (serviceIds !== undefined && Array.isArray(serviceIds)) {
      // Validate that all service IDs exist
      if (serviceIds.length > 0) {
        const existingServices = await db.serviceType.findMany({
          where: {
            id: {
              in: serviceIds,
            },
          },
        });

        if (existingServices.length !== serviceIds.length) {
          return NextResponse.json(
            { error: 'One or more service IDs are invalid' },
            { status: 400 }
          );
        }
      }

      // Delete existing service associations
      await db.agentService.deleteMany({
        where: { agentId: id },
      });

      // Create new service associations
      if (serviceIds.length > 0) {
        await Promise.all(
          serviceIds.map((serviceId: string) =>
            db.agentService.create({
              data: {
                agentId: id,
                serviceTypeId: serviceId,
              },
            })
          )
        );
      }
    }

    // Fetch updated agent with services
    const agentWithServices = await db.agent.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            serviceType: true,
          },
        },
      },
    });

    return NextResponse.json(agentWithServices);
  } catch (error: any) {
    console.error('Error updating agent:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to update agent',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Soft delete by setting isActive to false
    const agent = await db.agent.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

