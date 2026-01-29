import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

type Payload = {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  service?: string;
  message?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const body: Payload = req.body || {};
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!fullName || !email) {
    res.status(400).json({ ok: false, error: 'Missing required fields' });
    return;
  }

  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 16px; color: #0b2a4a;">New Lead Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 35%;">Full Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(fullName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Email</td>
            <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">WhatsApp</td>
            <td style="padding: 8px 0;">${escapeHtml(whatsapp || '—')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Service</td>
            <td style="padding: 8px 0;">${escapeHtml(service || '—')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Message</td>
            <td style="padding: 8px 0;">${escapeHtml(message || '—')}</td>
          </tr>
        </table>
      </div>
    `.trim();

    await transporter.sendMail({
      from: smtpFrom,
      to: 'support@uaebusinessdesk.com',
      subject: `New Lead: ${fullName}`,
      html,
    });

    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Email send failed' });
  }
}
