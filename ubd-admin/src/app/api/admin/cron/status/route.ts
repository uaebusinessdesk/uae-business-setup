import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cron/status
 * Get the latest payment reminder cron run status
 * Admin-only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the latest CronRun for payment-reminders
    const lastRun = await db.cronRun.findFirst({
      where: {
        type: 'payment-reminders',
      },
      orderBy: {
        ranAt: 'desc',
      },
      select: {
        ranAt: true,
        processed: true,
        sent: true,
        skipped: true,
      },
    });

    return NextResponse.json({
      ok: true,
      lastRun: lastRun || null,
    });
  } catch (error: any) {
    console.error('[API/Admin/Cron/Status] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch cron status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




