import { assertRedisConfigured, redis } from '../_lib/redis';

type LeadPayload = {
  leadId: string;
  name: string;
  email: string | null;
  whatsapp: string;
  service: string;
  message: string | null;
  createdAt: string;
};

const ALLOWED_ORIGINS = new Set([
  'https://uaebusinessdesk.com',
  'https://www.uaebusinessdesk.com',
]);

type RateEntry = { count: number; startMs: number };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateStore = new Map<string, RateEntry>();
const LEAD_TTL_SECONDS = 60 * 60 * 24 * 30;

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

function generateLeadId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
    leadId,
    name: fullName,
    email,
    whatsapp,
    service: serviceRequired,
    message,
    createdAt,
  };

  assertRedisConfigured();
  await redis.set(`lead:${leadId}`, JSON.stringify(payload));
  await redis.lpush('leads:inbox', leadId);
  await redis.expire(`lead:${leadId}`, LEAD_TTL_SECONDS);

  json(res, 200, { ok: true, leadId });
}
