// Prisma Client singleton - every repository imports THIS file,
// never `new PrismaClient()` directly.
const { PrismaClient } = require('../node_modules/.prisma/meditrack-client');

const prisma = new PrismaClient();

module.exports = prisma;