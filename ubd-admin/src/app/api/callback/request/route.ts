import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { normalizePhone, isValidE164 } from '@/lib/phone';

// CORS headers
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.50.9.210:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://www.uaebusinessdesk.com',
  'http://www.uaebusinessdesk.com',
  'https://uaebusinessdesk.com',
  'http://uaebusinessdesk.com',
];

function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    const allowedOrigin = origin || '*';
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
      ? origin 
      : ALLOWED_ORIGINS[0];
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-UBD-LEAD-KEY');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      const response = NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    // Validate required fields
    if (!body.phone || typeof body.phone !== 'string' || body.phone.trim() === '') {
      const response = NextResponse.json(
        { ok: false, error: 'Phone number is required' },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      const response = NextResponse.json(
        { ok: false, error: 'Name is required' },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    // Normalize phone number
    const normalized = normalizePhone(body.phone);
    
    // Validate E.164 format
    if (!isValidE164(normalized)) {
      const response = NextResponse.json(
        { ok: false, error: 'Invalid phone number. Please include country code, e.g. +97150xxxxxxx' },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    // Check if CallbackRequest model exists
    if (!db.callbackRequest) {
      console.error('[API/Callback/Request] CallbackRequest model not found in Prisma Client');
      const response = NextResponse.json(
        { ok: false, error: 'Server configuration error. Please restart the server after running: npx prisma generate' },
        { status: 500 }
      );
      return addCorsHeaders(response, origin);
    }

    // Create callback request
    const callbackRequest = await db.callbackRequest.create({
      data: {
        name: body.name.trim(),
        phone: normalized,
      },
    });

    // Send simple email notification
    const adminEmail = 'support@uaebusinessdesk.com';
    const adminSubject = `📞 Callback Request - ${callbackRequest.name || 'No name provided'}`;
    
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b2a4a 0%, #1e3a5f 100%); padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">📞 Callback Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Name</p>
                    <p style="margin: 4px 0 0; color: #0b2a4a; font-size: 16px; font-weight: 600;">${callbackRequest.name || 'Not provided'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 500;">Phone Number</p>
                    <p style="margin: 4px 0 0;">
                      <a href="https://wa.me/${callbackRequest.phone.replace(/[^0-9]/g, '')}" style="color: #0b2a4a; text-decoration: none; font-weight: 600; font-size: 16px;">${callbackRequest.phone}</a>
                    </p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 12px;">Click the number to open WhatsApp</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">View all callback requests in the admin portal</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email notification
    try {
      await sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
      });
    } catch (emailError) {
      console.error('Failed to send callback notification email:', emailError);
      // Don't fail the request if email fails - callback is still saved
    }

    const response = NextResponse.json({
      ok: true,
      message: 'Callback request submitted successfully',
    }, { status: 200 });
    
    return addCorsHeaders(response, origin);
  } catch (error: any) {
    console.error('[API/Callback/Request] Error:', error);
    const response = NextResponse.json(
      { ok: false, error: 'Failed to process callback request', details: error.message },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}

