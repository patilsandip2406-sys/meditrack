const prisma = require('../config/db');
const { orNullIfMissing } = require('../utils/prismaHelpers');

exports.findAll = ({ skip = 0, limit = 20, search } = {}) => {
  const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
  return prisma.patient.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } });
};

exports.count = (search) => {
  const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
  return prisma.patient.count({ where });
};

exports.findById = (id) => prisma.patient.findUnique({ where: { id: Number(id) } });
exports.create = (data) => prisma.patient.create({ data });

exports.updateById = (id, data) =>
  orNullIfMissing(prisma.patient.update({ where: { id: Number(id) }, data }));

exports.deleteById = (id) =>
  orNullIfMissing(prisma.patient.delete({ where: { id: Number(id) } }));