import { sendMail } from '../_lib/mailer';
import { handleAdminCors, sendJson } from '../_lib/adminApi';

function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

export default async function handler(req: any, res: any) {
  if (!handleAdminCors(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
    return;
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (err) {
    sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
    return;
  }

  const to = toStringOrNull(body.to) || process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    sendJson(res, 400, { ok: false, error: 'Missing recipient' });
    return;
  }

  try {
    await sendMail({
      to,
      subject: 'SMTP Test Email – UAE Business Desk',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>SMTP Test Success</h2>
          <p>This is a test email from the Vercel API endpoint.</p>
        </div>
      `,
    });
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error('[EMAIL_SEND_FAIL] test-email', err);
    sendJson(res, 500, { ok: false, error: 'SEND_FAILED' });
  }
}
