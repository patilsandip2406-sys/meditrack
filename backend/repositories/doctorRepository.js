const prisma = require('../config/db');
const { orNullIfMissing } = require('../utils/prismaHelpers');

exports.findAll = ({ skip, limit, where, orderBy, select }) =>
  prisma.doctor.findMany({ where, skip, take: limit, orderBy, ...(select ? { select } : {}) });
exports.count = (where) => prisma.doctor.count({ where });
exports.findById = (id) => prisma.doctor.findUnique({ where: { id: Number(id) } });
exports.create = (data) => prisma.doctor.create({ data });

exports.updateById = (id, data) =>
  orNullIfMissing(prisma.doctor.update({ where: { id: Number(id) }, data }));

exports.deleteById = (id) =>
  orNullIfMissing(prisma.doctor.delete({ where: { id: Number(id) } }));