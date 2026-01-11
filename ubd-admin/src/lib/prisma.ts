/**
 * NOTE: This project uses `@/lib/db` as the Prisma client singleton. This file is unused.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Ensure Prisma connects on first use
if (!globalForPrisma.prisma) {
  prisma.$connect().catch((err) => {
    console.error('Failed to connect to database:', err);
  });
}

