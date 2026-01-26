export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const fullName = (body.fullName || '').trim();
    const whatsapp = (body.whatsapp || '').trim();
    const serviceRequired = (body.serviceRequired || body.helpWith || body.serviceChoice || '').trim();
    const email = (body.email || '').trim();

    if (!fullName || !whatsapp || !serviceRequired) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Send email using SMTP (Vercel supports outbound; DO was blocked)
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM;

    const subject = `New Lead – ${serviceRequired} | ${fullName}`;
    const text =
`Full Name: ${fullName}
WhatsApp: ${whatsapp}
Email: ${email || '(not provided)'}
Service: ${serviceRequired}
`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminTo,
      subject,
      text,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
}
