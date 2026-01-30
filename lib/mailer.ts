import nodemailer from 'nodemailer';

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portRaw || !user || !pass) {
    throw new Error('Missing SMTP configuration (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)');
  }

  const port = Number(portRaw);
  const secure = port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

export async function sendMail({ to, subject, html, replyTo }: SendMailInput): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'support@uaebusinessdesk.com';

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}
