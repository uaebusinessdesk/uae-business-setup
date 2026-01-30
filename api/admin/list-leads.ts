import { handleAdminCors, requireAdminKey, sendJson } from '../_lib/adminApi';
import { listLeads } from '../_lib/leadStore';

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

    const leads = await listLeads(200);
    sendJson(res, 200, { ok: true, leads });
  } catch (err) {
    console.error('ADMIN_LIST_LEADS_HANDLER_ERROR', err);
    sendJson(res, 500, {
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to load leads right now.',
    });
  }
}
