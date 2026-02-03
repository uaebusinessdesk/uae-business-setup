import { assertRedisConfigured, redis } from './redis';

type StoredLead = {
  id: string;
  createdAt: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  serviceRequired: string;
};

const LEAD_KEY_PREFIX = 'ubd:lead:';
const LEADS_LIST_KEY = 'ubd:leads';
const LEADS_LIMIT = 200;
const LEAD_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function saveLead(lead: StoredLead): Promise<void> {
  assertRedisConfigured();
  const key = `${LEAD_KEY_PREFIX}${lead.id}`;
  await redis.set(key, JSON.stringify(lead));
  await redis.expire(key, LEAD_TTL_SECONDS);
  await redis.lpush(LEADS_LIST_KEY, lead.id);
  await redis.ltrim(LEADS_LIST_KEY, 0, LEADS_LIMIT - 1);
}

export async function listLeads(limit = LEADS_LIMIT): Promise<StoredLead[]> {
  assertRedisConfigured();
  const safeLimit = Math.min(Math.max(limit, 1), LEADS_LIMIT);
  const ids = await redis.lrange(LEADS_LIST_KEY, 0, safeLimit - 1);
  if (!ids.length) return [];
  const keys = ids.map((id) => `${LEAD_KEY_PREFIX}${id}`);
  const rows = await redis.mget<string[]>(...keys);
  return rows
    .map((value) => {
      if (!value) return null;
      try {
        return JSON.parse(value) as StoredLead;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as StoredLead[];
}
