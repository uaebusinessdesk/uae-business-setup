import { sendMail } from '../_lib/mailer';
import { saveLead } from '../_lib/leadStore';

type LeadPayload = {
  id: string;
  createdAt: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  serviceRequired: string;
};

const ALLOWED_ORIGINS = new Set([
  'https://uaebusinessdesk.com',
  'https://www.uaebusinessdesk.com',
]);

type RateEntry = { count: number; startMs: number };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateStore = new Map<string, RateEntry>();

function json(res: any, statusCode: number, payload: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res: any, origin: string | undefined) {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function toLabel(key: string): string {
  const withSpaces = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function generateLeadId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateLeadRef(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `UBD-${year}${month}${day}-${hours}${minutes}-${random}`;
}

function buildAdminHtml(leadRef: string, data: Record<string, string | null | undefined>): string {
  const rows = Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 35%; vertical-align: top;">${label}</td>
          <td style="padding: 8px 0; color: #0b2a4a; font-size: 14px; font-weight: 600;">${value}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f5f5f5;color:#333;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:680px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0b2a4a 0%,#1e3a5f 100%);padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">New Lead Received</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;">
                    <p style="margin:0 0 12px;color:#0b2a4a;font-size:14px;font-weight:600;">Lead Reference</p>
                    <p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#333333;">${leadRef}</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${rows}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#faf8f3;padding:20px 32px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">This is an automated notification from the lead capture form.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildCustomerHtml(leadRef: string, data: Record<string, string | null | undefined>): string {
  const rows = Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 35%; vertical-align: top;">${label}</td>
          <td style="padding: 8px 0; color: #0b2a4a; font-size: 14px; font-weight: 600;">${value}</td>
        </tr>
      `
    )
    .join('');

  const name = data['Full Name'] || 'there';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#faf8f3;color:#333;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="720" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:720px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0b2a4a 0%,#1e3a5f 100%);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Thank you for your request</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-style:italic;">Clarity before commitment</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 12px;font-size:16px;color:#0b2a4a;">Dear ${name},</p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
                      We have received your request and our team will contact you shortly.
                    </p>
                    <div style="background:#faf8f3;border-left:4px solid #c9a14a;border-radius:4px;padding:16px 20px;">
                      <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;">Your Reference</p>
                      <p style="margin:0;font-family:'Courier New',monospace;font-size:16px;font-weight:700;color:#0b2a4a;">${leadRef}</p>
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                      ${rows}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#faf8f3;padding:20px 32px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:12px;">If you have questions, reply to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout after ${ms}ms (${label})`)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

function shouldRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now - entry.startMs > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(ip, { count: 1, startMs: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers?.origin;
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      json(res, 403, { ok: false, error: 'Forbidden' });
      return;
    }

    setCorsHeaders(res, origin);

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      json(res, 405, { ok: false, error: 'Method Not Allowed' });
      return;
    }

    let body: Record<string, unknown> = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (err) {
      json(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const honeypot = toStringOrNull((body as any).website || (body as any).companyWebsite);
    if (honeypot) {
      json(res, 200, { ok: true });
      return;
    }

    const forwardedFor = req.headers?.['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : String(forwardedFor || ''))
      .split(',')[0]
      .trim() || 'unknown';
    const rateKey = `${ip}:public-lead`;
    if (shouldRateLimit(rateKey)) {
      json(res, 429, { ok: false, error: 'Too Many Requests' });
      return;
    }

    const fullName = toStringOrNull(body.fullName);
    const whatsapp = toStringOrNull(body.whatsapp);
    const serviceRequired = toStringOrNull(body.serviceRequired);
    const email = toStringOrNull(body.email);
    const message = toStringOrNull(body.message) || toStringOrNull(body.notes);
    const pageUrl = toStringOrNull(body.pageUrl);

    if (!fullName || !whatsapp || !serviceRequired) {
      json(res, 400, { ok: false, error: 'Missing required fields' });
      return;
    }

    if (fullName.length > 80 || whatsapp.length > 25 || (message && message.length > 1200)) {
      json(res, 400, { ok: false, error: 'Invalid field length' });
      return;
    }

    const leadId = generateLeadId();
    const createdAt = new Date().toISOString();

    const payload: LeadPayload = {
      id: leadId,
      createdAt,
      fullName,
      whatsapp,
      email,
      serviceRequired,
    };

    try {
      await saveLead(payload);
    } catch (err) {
      console.error('[api/public/lead] save lead failed', err);
    }

    const leadRef = generateLeadRef();
    const adminRecipient = process.env.ADMIN_NOTIFY_EMAIL || 'support@uaebusinessdesk.com';

    const detailRows: Record<string, string | null | undefined> = {
      'Full Name': fullName,
      WhatsApp: whatsapp,
      'Service Required': serviceRequired,
      Email: email || '',
      Message: message || '',
      'Page URL': pageUrl || '',
  };

    const excludedKeys = new Set([
      'website',
      'companyWebsite',
      'fullName',
      'whatsapp',
      'serviceRequired',
      'email',
      'message',
      'notes',
      'pageUrl',
      'helpWith',
      'help_with',
      'privacyAccepted',
      'privacy_accepted',
    ]);

    Object.entries(body).forEach(([key, value]) => {
      if (excludedKeys.has(key)) return;
      const stringValue = toStringOrNull(value);
      if (!stringValue) return;
      detailRows[toLabel(key)] = stringValue;
    });

  const adminHtml = buildAdminHtml(leadRef, detailRows);

    const sendTasks = [
      withTimeout(
        sendMail({
          to: adminRecipient,
          subject: `NEW LEAD – ${serviceRequired} | ${leadRef}`,
          html: adminHtml,
        }),
        8000,
        'admin-email'
      ).catch((err) => {
        console.error('[api/public/lead] admin email failed', err);
      }),
    ];

    if (email) {
      sendTasks.push(
        withTimeout(
        sendMail({
            to: email,
            subject: `Thank you – ${leadRef}`,
          html: buildCustomerHtml(leadRef, detailRows),
          }),
          8000,
          'customer-email'
        ).catch((err) => {
          console.error('[api/public/lead] customer email failed', err);
        })
      );
    }

    await Promise.allSettled(sendTasks);

    json(res, 200, { ok: true, leadId });
  } catch (err) {
    console.error('PUBLIC_LEAD_HANDLER_ERROR', err);
    json(res, 500, {
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to submit the form right now.',
    });
  }
}
