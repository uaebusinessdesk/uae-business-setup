import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Verify new models are available (for debugging)
if (process.env.NODE_ENV === 'development') {
  const dbAny = db as any;
  if (typeof dbAny.serviceType === 'undefined') {
    console.error('[DB] WARNING: ServiceType model not found in Prisma Client');
    console.error('[DB] Available models:', Object.keys(dbAny).filter((k: string) => !k.startsWith('_') && typeof dbAny[k] === 'object'));
    console.error('[DB] Please restart the server after running: npx prisma generate');
  }
  if (typeof dbAny.agent === 'undefined') {
    console.error('[DB] WARNING: Agent model not found in Prisma Client');
  }
}

// Verify models are available (for debugging)
if (process.env.NODE_ENV === 'development') {
  const dbAny = db as any;
  if (typeof dbAny.callbackRequest === 'undefined') {
    console.error('[DB] WARNING: CallbackRequest model not found in Prisma Client');
    console.error('[DB] Available models:', Object.keys(dbAny).filter((k: string) => !k.startsWith('_') && typeof dbAny[k] === 'object'));
    console.error('[DB] Please run: npx prisma generate');
  }
}
