const prisma = require('../config/db');
const { orNullIfMissing } = require('../utils/prismaHelpers');

exports.findAll = ({ skip, limit, where, orderBy, select }) =>
  prisma.patient.findMany({ where, skip, take: limit, orderBy, ...(select ? { select } : {}) });

exports.count = (where) => prisma.patient.count({ where });

exports.findById = (id) => prisma.patient.findUnique({ where: { id: Number(id) } });
exports.create = (data) => prisma.patient.create({ data });

exports.updateById = (id, data) =>
  orNullIfMissing(prisma.patient.update({ where: { id: Number(id) }, data }));

exports.deleteById = (id) =>
  orNullIfMissing(prisma.patient.delete({ where: { id: Number(id) } }));