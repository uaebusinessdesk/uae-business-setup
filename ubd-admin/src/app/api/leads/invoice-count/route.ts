import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date'); // Format: YYYYMMDD

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Count invoices with numbers matching the pattern for this date
    const pattern = `UBD-INV-${date}-`;
    
    const count = await db.lead.count({
      where: {
        OR: [
          {
            companyInvoiceNumber: {
              startsWith: pattern,
            },
          },
          {
            bankInvoiceNumber: {
              startsWith: pattern,
            },
          },
        ],
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting invoices:', error);
    return NextResponse.json(
      { error: 'Failed to count invoices' },
      { status: 500 }
    );
  }
}

