import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPaymentReminderEmail } from '@/lib/reminders/paymentReminder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/payment-reminders
 * Automated payment reminder cron job
 * Requires: Authorization: Bearer <CRON_SECRET> OR ?secret=<CRON_SECRET>
 * 
 * Environment variable required:
 * - CRON_SECRET: Secret token for authenticating cron requests
 */
export async function POST(req: NextRequest) {
  try {
    // Security: Check for CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('[Cron/PaymentReminders] CRON_SECRET not configured');
      return NextResponse.json(
        { ok: false, error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    // Accept either Authorization header OR query parameter
    const authHeader = req.headers.get('authorization');
    const searchParams = req.nextUrl.searchParams;
    const querySecret = searchParams.get('secret');

    let token: string | null = null;

    // Try Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    // Fallback to query parameter
    else if (querySecret) {
      token = querySecret;
    }

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized. Provide Authorization: Bearer <CRON_SECRET> or ?secret=<CRON_SECRET>' },
        { status: 401 }
      );
    }

    if (token !== cronSecret) {
      return NextResponse.json(
        { ok: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Calculate 48 hours ago
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find leads eligible for COMPANY payment reminders
    // Conditions:
    // - companyInvoiceSentAt is NOT null
    // - paymentReceivedAt is null
    // - declinedAt is null
    // - AND (paymentReminderSentAt is null OR paymentReminderSentAt <= 48 hours ago)
    const eligibleCompanyLeads = await db.lead.findMany({
      where: {
        companyInvoiceSentAt: { not: null },
        paymentReceivedAt: null,
        declinedAt: null,
        OR: [
          { paymentReminderSentAt: null },
          { paymentReminderSentAt: { lte: fortyEightHoursAgo } },
        ],
      },
      select: {
        id: true,
      },
      take: 50, // Limit batch size to 50 per run
      orderBy: {
        companyInvoiceSentAt: 'asc', // Process oldest invoices first
      },
    });

    // Find leads eligible for BANK payment reminders
    // Conditions:
    // - bankInvoiceSentAt is NOT null
    // - bankPaymentReceivedAt is null
    // - bankDeclinedAt is null
    // - AND (bankPaymentReminderSentAt is null OR bankPaymentReminderSentAt <= 48 hours ago)
    const eligibleBankLeads = await db.lead.findMany({
      where: {
        bankInvoiceSentAt: { not: null },
        bankPaymentReceivedAt: null,
        bankDeclinedAt: null,
        OR: [
          { bankPaymentReminderSentAt: null },
          { bankPaymentReminderSentAt: { lte: fortyEightHoursAgo } },
        ],
      },
      select: {
        id: true,
      },
      take: 50, // Limit batch size to 50 per run
      orderBy: {
        bankInvoiceSentAt: 'asc', // Process oldest invoices first
      },
    });

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    // Process company reminders
    for (const lead of eligibleCompanyLeads) {
      results.processed++;

      try {
        const result = await sendPaymentReminderEmail(lead.id, 'company');

        if (result.ok) {
          results.sent++;
        } else {
          results.skipped++;
          results.errors.push({
            id: lead.id,
            error: result.error || 'Unknown error',
          });
        }
      } catch (error: any) {
        console.error(`[Cron/PaymentReminders] Error processing company reminder for lead ${lead.id}:`, error);
        results.errors.push({
          id: lead.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Process bank reminders
    for (const lead of eligibleBankLeads) {
      results.processed++;

      try {
        const result = await sendPaymentReminderEmail(lead.id, 'bank');

        if (result.ok) {
          results.sent++;
        } else {
          results.skipped++;
          results.errors.push({
            id: lead.id,
            error: result.error || 'Unknown error',
          });
        }
      } catch (error: any) {
        console.error(`[Cron/PaymentReminders] Error processing bank reminder for lead ${lead.id}:`, error);
        results.errors.push({
          id: lead.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log successful cron run
    try {
      await db.cronRun.create({
        data: {
          type: 'payment-reminders',
          ranAt: now,
          processed: results.processed,
          sent: results.sent,
          skipped: results.skipped,
        },
      });
    } catch (logError) {
      // Log error but don't fail the cron response
      console.error('[Cron/PaymentReminders] Failed to log cron run:', logError);
    }

    return NextResponse.json({
      ok: true,
      processed: results.processed,
      sent: results.sent,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error('[Cron/PaymentReminders] Fatal error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to process payment reminders',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

