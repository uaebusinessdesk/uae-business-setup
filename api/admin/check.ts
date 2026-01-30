import { handleAdminCors, sendJson } from '../_lib/adminApi';

function toStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
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

    let body: Record<string, unknown> = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (err) {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const expected = process.env.ADMIN_LITE_PASSWORD;
    if (!expected) {
      sendJson(res, 500, { ok: false, error: 'MISCONFIG', message: 'ADMIN_LITE_PASSWORD missing' });
      return;
    }

    const password = toStringOrNull(body.password);
    if (!password) {
      sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
      return;
    }

    if (password !== expected) {
      sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED' });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error('ADMIN_CHECK_ERROR', err);
    sendJson(res, 500, { ok: false, error: 'INTERNAL', message: 'Server error' });
  }
}
