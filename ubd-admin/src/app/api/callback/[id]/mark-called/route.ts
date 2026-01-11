import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const callback = await db.callbackRequest.update({
      where: { id },
      data: {
        calledAt: new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json({ ok: true, callback });
  } catch (error: any) {
    console.error('[API/Callback/MarkCalled] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to mark callback as called', details: error.message },
      { status: 500 }
    );
  }
}




