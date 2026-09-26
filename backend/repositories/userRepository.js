const prisma = require('../config/db');

exports.findByEmail = (email) => prisma.user.findUnique({ where: { email } });
exports.create = (data) => prisma.user.create({ data });