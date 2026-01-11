import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const activities = await db.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { action, message } = body;
    
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'action is required and must be a string' },
        { status: 400 }
      );
    }
    
    await logActivity(id, action, message || null);
    
    // Return updated activities list
    const activities = await db.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

