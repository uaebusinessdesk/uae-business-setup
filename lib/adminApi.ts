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

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  return allowed.has(origin);
}

export function applyCors(res: any, origin?: string) {
  if (!origin) return;
  if (!isOriginAllowed(origin)) return;
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

  applyCors(res, origin);
  return true;
}
