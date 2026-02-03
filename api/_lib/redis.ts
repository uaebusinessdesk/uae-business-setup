import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';
const useTls = redisUrl.startsWith('rediss://');

export const redis = redisUrl
  ? new Redis(redisUrl, {
      tls: useTls ? {} : undefined,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    })
  : null;

export function assertRedisConfigured() {
  if (!redisUrl) {
    throw new Error('REDIS_URL is not set (Vercel Environment Variable missing).');
  }
  if (!redis) {
    throw new Error('Redis client not initialized.');
  }
  return redis;
}
