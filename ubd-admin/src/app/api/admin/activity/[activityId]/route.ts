import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  // DEV-ONLY: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  try {
    const { activityId } = await params;

    // Debug logging (dev only)
    console.log('[PATCH /api/admin/activity] activityId:', activityId);

    const body = await req.json();
    const { createdAt } = body;

    // Debug logging (dev only)
    console.log('[PATCH /api/admin/activity] createdAt received:', createdAt);

    // Validate createdAt
    if (!createdAt || typeof createdAt !== 'string' || createdAt.trim() === '') {
      return NextResponse.json(
        { error: 'createdAt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate date
    const newDate = new Date(createdAt);
    if (isNaN(newDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected ISO string.' },
        { status: 400 }
      );
    }

    // Validate activity exists
    const existing = await db.leadActivity.findUnique({
      where: { id: activityId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Update activity
    const updated = await db.leadActivity.update({
      where: { id: activityId },
      data: { createdAt: newDate },
    });

    console.log('[PATCH /api/admin/activity] Successfully updated:', updated.id);

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('[PATCH /api/admin/activity] Error:', error);
    const errorMessage = error?.message || 'Failed to update activity timestamp';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

