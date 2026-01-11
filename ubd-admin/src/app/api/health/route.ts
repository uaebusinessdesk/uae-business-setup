import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint to verify server and database are working
 */
export async function GET() {
  try {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      models: [],
    };

    // Check database connection
    try {
      await db.$connect();
      health.database = 'connected';
    } catch (error: any) {
      health.database = 'error';
      health.databaseError = error.message;
    }

    // Check available models (using type assertion to avoid TS errors)
    const dbAny = db as any;
    const availableModels = Object.keys(dbAny).filter(
      (k: string) => !k.startsWith('_') && typeof dbAny[k] === 'object' && dbAny[k] !== null
    );
    health.models = availableModels;

    const statusCode = health.database === 'connected' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

