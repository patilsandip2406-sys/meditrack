// Prisma Client singleton - every repository imports THIS file,
// never `new PrismaClient()` directly.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;