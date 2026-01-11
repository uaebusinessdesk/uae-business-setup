import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadIds } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds array is required' },
        { status: 400 }
      );
    }

    // Delete in correct order (respecting foreign key constraints)
    // 1. Delete LeadAgent relationships
    await db.leadAgent.deleteMany({
      where: { leadId: { in: leadIds } },
    });

    // 2. Delete LeadActivity
    await db.leadActivity.deleteMany({
      where: { leadId: { in: leadIds } },
    });

    // 3. Delete CompanyInvoiceRevision
    await db.companyInvoiceRevision.deleteMany({
      where: { leadId: { in: leadIds } },
    });

    // 4. Delete BankInvoiceRevision
    await db.bankInvoiceRevision.deleteMany({
      where: { leadId: { in: leadIds } },
    });

    // 5. Delete leads
    const result = await db.lead.deleteMany({
      where: { id: { in: leadIds } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error('Error bulk deleting leads:', error);
    return NextResponse.json(
      { error: 'Failed to delete leads', details: error?.message },
      { status: 500 }
    );
  }
}

