const express = require('express');
const prisma = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin', 'receptionist'), asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const [patients, doctors, appointments, todaysAppointments, upcoming, byStatus] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.appointment.findMany({
      where: { date: { gte: now }, status: 'Scheduled' },
      take: 10,
      orderBy: { date: 'asc' },
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true, specialization: true } }
      }
    }),
    prisma.appointment.groupBy({ by: ['status'], _count: { _all: true }, orderBy: { status: 'asc' } })
  ]);

  res.json({
    data: {
      totals: { patients, doctors, appointments },
      todaysAppointments,
      appointmentsByStatus: byStatus.map(({ status, _count }) => ({ status, count: _count._all })),
      upcomingAppointments: upcoming.map((appointment) => ({
        ...appointment,
        _links: {
          self: { href: `/api/v1/appointments/${appointment.id}` },
          patient: { href: `/api/v1/patients/${appointment.patient.id}` },
          doctor: { href: `/api/v1/doctors/${appointment.doctor.id}` }
        }
      }))
    },
    _links: {
      self: { href: '/api/v1/reports/dashboard' },
      appointments: { href: '/api/v1/appointments' },
      patients: { href: '/api/v1/patients' },
      doctors: { href: '/api/v1/doctors' }
    }
  });
}));

module.exports = router;
