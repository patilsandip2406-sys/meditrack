const prisma = require('../config/db');
const { orNullIfMissing } = require('../utils/prismaHelpers');

// `.populate()` in Mongoose becomes `include` in Prisma - a real SQL JOIN.
const withRelations = {
  patient: { select: { name: true, phone: true } },
  doctor: { select: { name: true, specialization: true } }
};

exports.findAll = ({ skip, limit, where, orderBy, select }) =>
  prisma.appointment.findMany({
    where, skip, take: limit, orderBy,
    ...(select ? { select } : { include: withRelations })
  });

exports.count = (where) => prisma.appointment.count({ where });

exports.findConflict = (doctorId, date) =>
  prisma.appointment.findFirst({
    where: { doctorId: Number(doctorId), date: new Date(date), NOT: { status: 'Cancelled' } }
  });

exports.create = (data) =>
  prisma.appointment.create({
    data: {
      patientId: Number(data.patient),
      doctorId: Number(data.doctor),
      date: new Date(data.date),
      reason: data.reason,
      notes: data.notes
    },
    include: withRelations
  });

exports.updateById = (id, data) =>
  orNullIfMissing(
    prisma.appointment.update({ where: { id: Number(id) }, data, include: withRelations })
  );

exports.deleteById = (id) =>
  orNullIfMissing(prisma.appointment.delete({ where: { id: Number(id) } }));

// Prisma's groupBy() can't join, so a raw SQL query is the natural
// Postgres equivalent of the Mongo aggregation pipeline you had before -
// arguably more readable, too.
exports.getStatsByDoctor = () => prisma.$queryRaw`
  SELECT d.name AS "doctorName", d.specialization, a.status, COUNT(*)::int AS count
  FROM "Appointment" a
  JOIN "Doctor" d ON d.id = a."doctorId"
  GROUP BY d.name, d.specialization, a.status
  ORDER BY d.name;
`;