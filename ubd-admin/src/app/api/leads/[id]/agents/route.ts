import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignments = await db.leadAgent.findMany({
      where: { leadId: id },
      include: {
        agent: {
          include: {
            services: {
              include: {
                serviceType: true,
              },
            },
          },
        },
      },
      orderBy: [
        { serviceType: 'asc' }, // Group by service type
        { order: 'asc' }, // Then by order field (0, 1, 2, ...)
      ],
    });

    // Group assignments by service type for easier frontend consumption
    const grouped = {
      company: assignments.filter(a => a.serviceType === 'company'),
      bank: assignments.filter(a => a.serviceType === 'bank'),
      all: assignments, // Also return flat list for backward compatibility
    };

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error fetching lead agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead agents' },
      { status: 500 }
    );
  }
}

