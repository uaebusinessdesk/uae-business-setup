const nodemailer = require('nodemailer');

const DEFAULT_ALLOWED_ORIGINS = [
  'https://uaebusinessdesk.com',
  'https://www.uaebusinessdesk.com',
];

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return new Set(DEFAULT_ALLOWED_ORIGINS);
  const parsed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set(parsed.length ? parsed : DEFAULT_ALLOWED_ORIGINS);
}

function setCorsHeaders(res, origin) {
  if (!origin) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

function generateLeadRef() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `UBD-${year}${month}${day}-${hours}${minutes}-${random}`;
}

function toStringOrNull(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function buildAdminHtml(leadRef, data) {
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

function buildCustomerHtml(leadRef, data) {
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
                    <p style="margin:0 0 12px;font-size:16px;color:#0b2a4a;">Dear ${data.fullName},</p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
                      We have received your request and our team will contact you shortly.
                    </p>
                    <div style="background:#faf8f3;border-left:4px solid #c9a14a;border-radius:4px;padding:16px 20px;">
                      <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;">Your Reference</p>
                      <p style="margin:0;font-family:'Courier New',monospace;font-size:16px;font-weight:700;color:#0b2a4a;">${leadRef}</p>
                    </div>
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

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.has(origin)) {
    json(res, 403, { ok: false, error: 'FORBIDDEN' });
    return;
  }

  if (req.method === 'OPTIONS') {
    if (origin) {
      setCorsHeaders(res, origin);
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  if (origin) {
    setCorsHeaders(res, origin);
  }

  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method Not Allowed' });
    return;
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (err) {
    json(res, 400, { ok: false, error: 'Invalid JSON' });
    return;
  }

  const fullName = toStringOrNull(body.fullName);
  const whatsapp = toStringOrNull(body.whatsapp);
  const serviceRequired = toStringOrNull(body.serviceRequired);
  const email = toStringOrNull(body.email);

  if (!fullName || !whatsapp || !serviceRequired) {
    json(res, 400, { ok: false, error: 'Missing required fields' });
    return;
  }

  const leadRef = generateLeadRef();

  const payload = {
    'Full Name': fullName,
    WhatsApp: whatsapp,
    'Service Required': serviceRequired,
    Email: email,
    Notes: toStringOrNull(body.notes),
    ...Object.keys(body || {}).reduce((acc, key) => {
      if (['fullName', 'whatsapp', 'serviceRequired', 'email', 'notes'].includes(key)) {
        return acc;
      }
      const value = toStringOrNull(body[key]);
      if (value) acc[key] = value;
      return acc;
    }, {}),
  };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
  const adminHtml = buildAdminHtml(leadRef, payload);

  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      subject: `New Lead – ${serviceRequired} | ${fullName}`,
      html: adminHtml,
    });

    if (email) {
      const customerHtml = buildCustomerHtml(leadRef, { fullName });
      await transporter.sendMail({
        from,
        to: email,
        subject: `Thank you – ${leadRef}`,
        html: customerHtml,
      });
    }

    json(res, 200, { ok: true });
  } catch (err) {
    console.error('[EMAIL_SEND_FAIL] public-leads-capture', err);
    json(res, 500, { ok: false, error: 'SMTP_SEND_FAILED' });
  }
};
