import { handleAdminCors, requireAdminKey, sendJson } from '../_lib/adminApi';
import { listLeads } from '../_lib/sheets';

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

    const leads = await listLeads(safeLimit);
    sendJson(res, 200, { ok: true, leads });
  } catch (err) {
    console.error('ADMIN_LEADS_ERROR', err);
    sendJson(res, 500, { ok: false, error: 'INTERNAL', message: 'Server error' });
  }
}
