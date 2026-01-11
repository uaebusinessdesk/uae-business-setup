import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callbackIds } = body;

    if (!callbackIds || !Array.isArray(callbackIds) || callbackIds.length === 0) {
      return NextResponse.json(
        { error: 'callbackIds array is required' },
        { status: 400 }
      );
    }

    // Delete callbacks
    const result = await db.callbackRequest.deleteMany({
      where: { id: { in: callbackIds } },
    });

    return NextResponse.json({
      ok: true,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error('Error bulk deleting callbacks:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete callbacks', details: error?.message },
      { status: 500 }
    );
  }
}

