import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not set (Vercel Environment Variable missing).');
}

const useTls = redisUrl.startsWith('rediss://');

export const redis = new Redis(redisUrl, {
  tls: useTls ? {} : undefined,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});

export function assertRedisConfigured() {
  if (!redisUrl) {
    throw new Error('REDIS_URL is not set (Vercel Environment Variable missing).');
  }
  return redis;
}
