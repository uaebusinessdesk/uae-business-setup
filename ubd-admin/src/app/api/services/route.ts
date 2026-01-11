import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if serviceType model exists
    if (!db.serviceType) {
      console.error('[Services API] serviceType model not found in Prisma client');
      return NextResponse.json(
        { error: 'ServiceType model not available. Please run: npx prisma generate' },
        { status: 500 }
      );
    }

    const services = await db.serviceType.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

