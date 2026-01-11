import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentIds } = body;

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        { error: 'agentIds array is required' },
        { status: 400 }
      );
    }

    // Delete in correct order (respecting foreign key constraints)
    // 1. Delete LeadAgent relationships
    await db.leadAgent.deleteMany({
      where: { agentId: { in: agentIds } },
    });

    // 2. Delete AgentService relationships
    await db.agentService.deleteMany({
      where: { agentId: { in: agentIds } },
    });

    // 3. Delete agents
    const result = await db.agent.deleteMany({
      where: { id: { in: agentIds } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error('Error bulk deleting agents:', error);
    return NextResponse.json(
      { error: 'Failed to delete agents', details: error?.message },
      { status: 500 }
    );
  }
}

