import { sendMail } from '../_lib/mailer';
import { buildCompanyQuoteEmail } from '../_lib/adminEmailTemplates';
import { getAdminLiteKey, handleAdminCors, sendJson } from '../_lib/adminApi';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const MAX_BODY_BYTES = 100 * 1024;
const rateStore = new Map<string, { count: number; startMs: number }>();

function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function shouldRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now - entry.startMs > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(key, { count: 1, startMs: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req: any, res: any) {
  try {
    if (!handleAdminCors(req, res)) {
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
      return;
    }

    const expectedKey = process.env.ADMIN_LITE_KEY || process.env.ADMIN_LITE_PASSWORD;
    if (!expectedKey) {
      sendJson(res, 500, { ok: false, error: 'MISCONFIG', message: 'ADMIN_LITE_PASSWORD missing' });
      return;
    }
    const headerKey = getAdminLiteKey(req);
    if (headerKey !== expectedKey) {
      sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
      return;
    }

    if (typeof req.body === 'string' && Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
      sendJson(res, 413, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    let body: Record<string, unknown> = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (err) {
      sendJson(res, 400, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    try {
      if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
        sendJson(res, 413, { ok: false, error: 'SEND_FAILED' });
        return;
      }
    } catch (err) {
      sendJson(res, 400, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    const forwardedFor = req.headers?.['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : String(forwardedFor || ''))
      .split(',')[0]
      .trim() || req.socket?.remoteAddress || 'unknown';
    const rateKey = `${ip}:admin-send-quote`;
    if (shouldRateLimit(rateKey)) {
      sendJson(res, 429, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    const toEmail = toStringOrNull(body.toEmail);
    const customerName = toStringOrNull(body.customerName);
    const quoteItems = Array.isArray(body.quoteItems) ? body.quoteItems : null;
    const currency = toStringOrNull(body.currency) || 'AED';
    const totalRaw = body.total;
    const total = typeof totalRaw === 'number' ? totalRaw : Number(totalRaw || 0);
    const notes = toStringOrNull(body.notes);
    const leadRef = toStringOrNull(body.leadRef);

    if (!toEmail) {
      sendJson(res, 400, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    if (!customerName || !quoteItems || !currency || !Number.isFinite(total)) {
      sendJson(res, 400, { ok: false, error: 'SEND_FAILED' });
      return;
    }

    const leadNotes = [
      leadRef ? `Lead Reference: ${leadRef}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const lead = {
      fullName: customerName,
      setupType: 'mainland',
      notes: leadNotes || null,
      quotedAmountAed: total,
    };
    const { subject, htmlBody } = buildCompanyQuoteEmail(lead);

    await sendMail({
      to: toEmail,
      subject,
      html: htmlBody || '',
    });

    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error('ADMIN_SEND_QUOTE_ERROR', err);
    sendJson(res, 500, { ok: false, error: 'INTERNAL', message: 'Server error' });
  }
}
