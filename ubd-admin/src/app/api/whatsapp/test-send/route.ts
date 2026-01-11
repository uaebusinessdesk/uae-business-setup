import { NextRequest, NextResponse } from 'next/server';
import { sendText } from '@/lib/whatsapp';
import { getInternalNotifyRecipients } from '@/config/app';

export const dynamic = 'force-dynamic';

/**
 * Shared handler for both GET and POST requests
 * DEV-only endpoint to test WhatsApp outbound sending
 * Only works when NODE_ENV !== 'production'
 */
async function handleTestSend(): Promise<NextResponse> {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    // Get all internal notification recipients
    const recipients = getInternalNotifyRecipients();
    
    if (recipients.length === 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'No internal notification numbers configured. Please set INTERNAL_NOTIFY_NUMBERS environment variable.' 
        },
        { status: 500 }
      );
    }

    // Generate test message with ISO timestamp
    const timestamp = new Date().toISOString();
    const testMessage = `UAE Business Desk ✅ Outbound test OK. ${timestamp}`;

    // Send to all recipients
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        try {
          await sendText(recipient.number, testMessage);
          console.log(`[WhatsApp Test] Sent test message to ${recipient.name} (${recipient.number})`);
          return { recipient: recipient.name, success: true };
        } catch (error: any) {
          console.error(`[WhatsApp Test] Failed to send to ${recipient.name}:`, error.message);
          return { recipient: recipient.name, success: false, error: error.message };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Return success if at least one message was sent
    if (successful > 0) {
      return NextResponse.json({
        ok: true,
        message: `Test message sent to ${successful} of ${results.length} recipients`,
        timestamp,
        details: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { recipient: 'unknown', success: false }
        ),
      });
    } else {
      // All failed
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Failed to send test message to all recipients',
          details: results.map((r) =>
            r.status === 'fulfilled' ? r.value : { recipient: 'unknown', success: false }
          ),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[WhatsApp Test] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/test-send
 * DEV-only endpoint to test WhatsApp outbound sending
 */
export async function GET(request: NextRequest) {
  return handleTestSend();
}

/**
 * POST /api/whatsapp/test-send
 * DEV-only endpoint to test WhatsApp outbound sending
 */
export async function POST(request: NextRequest) {
  return handleTestSend();
}

