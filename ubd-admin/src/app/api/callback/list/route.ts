import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const called = searchParams.get('called'); // 'true' or 'false' or null for all

    let where: any = {};
    if (called === 'true') {
      where.calledAt = { not: null };
    } else if (called === 'false') {
      where.calledAt = null;
    }

    const callbacks = await db.callbackRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100
    });

    return NextResponse.json({ ok: true, callbacks });
  } catch (error: any) {
    console.error('[API/Callback/List] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch callback requests', details: error.message },
      { status: 500 }
    );
  }
}




