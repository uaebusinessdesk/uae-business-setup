import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        services: {
          include: {
            serviceType: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(agents);
  } catch (error: any) {
    console.error('[API/Agents] Error fetching agents:', error);
    console.error('[API/Agents] Error stack:', error?.stack);
    console.error('[API/Agents] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      cause: error?.cause,
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch agents',
        details: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, organizationName, whatsappNumber, email, serviceIds } = body;

    if (!name || !organizationName || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Name, organization name, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    // Create agent
    const agent = await db.agent.create({
      data: {
        name: name.trim(),
        organizationName: organizationName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email ? email.trim() : null,
        isActive: true,
      },
    });

    // Link agent to services if provided
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      await Promise.all(
        serviceIds.map((serviceId: string) =>
          db.agentService.create({
            data: {
              agentId: agent.id,
              serviceTypeId: serviceId,
            },
          })
        )
      );
    }

    // Fetch agent with services
    const agentWithServices = await db.agent.findUnique({
      where: { id: agent.id },
      include: {
        services: {
          include: {
            serviceType: true,
          },
        },
      },
    });

    return NextResponse.json(agentWithServices, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

