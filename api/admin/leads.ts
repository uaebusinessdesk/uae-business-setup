import { handleAdminCors, requireAdminKey, sendJson } from '../_lib/adminApi';
import { assertRedisConfigured, redis } from '../_lib/redis';

export default async function handler(req: any, res: any) {
  try {
    if (!handleAdminCors(req, res)) {
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
      return;
    }

    if (!requireAdminKey(req, res)) {
      return;
    }

    let body: Record<string, unknown> = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (err) {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const limitRaw = body.limit;
    const limit = Number(limitRaw || 50);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    assertRedisConfigured();

    const ids = await redis.lrange('leads:inbox', 0, safeLimit - 1);

    if (!ids.length) {
      sendJson(res, 200, { ok: true, leads: [] });
      return;
    }

    const keys = ids.map((id) => `lead:${id}`);
    const rows = await redis.mget<string[]>(...keys);
    const leads = rows
      .map((value) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    sendJson(res, 200, { ok: true, leads });
  } catch (err) {
    console.error('ADMIN_LEADS_ERROR', err);
    sendJson(res, 500, { ok: false, error: 'INTERNAL', message: 'Server error' });
  }
}
