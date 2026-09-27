let prismaInstance = null;

if (typeof window === 'undefined' && process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const globalForPrisma = global;
    prismaInstance =
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
  } catch (err) {
    console.warn('[Prisma] Client initialization deferred:', err.message);
  }
}

export const prisma = prismaInstance;
export default prismaInstance;
