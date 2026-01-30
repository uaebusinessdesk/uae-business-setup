type JsonPayload = Record<string, unknown>;

const DEFAULT_ALLOWED_ORIGINS = [
  'https://uaebusinessdesk.com',
  'https://www.uaebusinessdesk.com',
];

function getAllowedOrigins(): Set<string> {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return new Set(DEFAULT_ALLOWED_ORIGINS);
  const parsed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set(parsed.length ? parsed : DEFAULT_ALLOWED_ORIGINS);
}

export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return true;
  return getAllowedOrigins().has(origin);
}

export function applyCors(res: any, origin: string) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Lite-Key');
}

export function sendJson(res: any, statusCode: number, payload: JsonPayload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function getAdminLiteKey(req: any): string {
  const headerValue =
    (req.headers && (req.headers['x-admin-lite-key'] || req.headers['X-Admin-Lite-Key'])) || '';
  return String(headerValue).trim();
}

export function getExpectedAdminKey(): string | null {
  return process.env.ADMIN_LITE_KEY || process.env.ADMIN_LITE_PASSWORD || null;
}

export function requireAdminKey(req: any, res: any): boolean {
  const expectedKey = getExpectedAdminKey();
  if (!expectedKey) {
    sendJson(res, 500, { ok: false, error: 'MISCONFIG', message: 'ADMIN_LITE_PASSWORD missing' });
    return false;
  }
  const headerKey = getAdminLiteKey(req);
  if (headerKey !== expectedKey) {
    sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

export function validateAdminPassword(password: string | null, res: any): boolean {
  const expected = process.env.ADMIN_LITE_PASSWORD;
  if (!expected) {
    sendJson(res, 500, { ok: false, error: 'MISCONFIG', message: 'ADMIN_LITE_PASSWORD missing' });
    return false;
  }
  if (!password || password !== expected) {
    sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

export function handleAdminCors(req: any, res: any): boolean {
  const origin = req.headers?.origin;

  if (origin && !isOriginAllowed(origin)) {
    sendJson(res, 403, { ok: false, error: 'Forbidden' });
    return false;
  }

  if (req.method === 'OPTIONS') {
    if (!origin) {
      res.statusCode = 204;
      res.end();
      return false;
    }
    applyCors(res, origin);
    res.statusCode = 204;
    res.end();
    return false;
  }

  if (origin) {
    applyCors(res, origin);
  }

  return true;
}
