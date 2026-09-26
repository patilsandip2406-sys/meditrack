const prisma = require('../config/db');
const { orNullIfMissing } = require('../utils/prismaHelpers');

exports.findAll = () => prisma.doctor.findMany({ orderBy: { name: 'asc' } });
exports.findById = (id) => prisma.doctor.findUnique({ where: { id: Number(id) } });
exports.create = (data) => prisma.doctor.create({ data });

exports.updateById = (id, data) =>
  orNullIfMissing(prisma.doctor.update({ where: { id: Number(id) }, data }));

exports.deleteById = (id) =>
  orNullIfMissing(prisma.doctor.delete({ where: { id: Number(id) } }));