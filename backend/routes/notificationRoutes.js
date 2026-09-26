const express = require('express');
const Joi = require('joi');
const prisma = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { collectionLinks } = require('../utils/listQuery');

const router = express.Router();
const createSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  type: Joi.string().valid('info', 'success', 'warning', 'alert').default('info'),
  message: Joi.string().min(1).max(1000).required()
});

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, 'page must be positive and limit must be between 1 and 100');
  }
  const where = {
    userId: Number(req.user.id),
    ...(req.query.unread === 'true' ? { readAt: null } : {})
  };
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where })
  ]);
  const pages = Math.ceil(total / limit);
  res.json({
    data: notifications.map((notification) => ({
      ...notification,
      _links: {
        self: { href: `/api/v1/notifications/${notification.id}` },
        markRead: { href: `/api/v1/notifications/${notification.id}/read`, method: 'PATCH' }
      }
    })),
    pagination: { total, page, limit, pages },
    links: collectionLinks(req, page, pages)
  });
}));

router.post('/', authenticate, authorize('admin', 'receptionist'), asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw new ApiError(400, error.details.map((detail) => detail.message).join('; '));
  const recipient = await prisma.user.findUnique({ where: { id: value.userId }, select: { id: true } });
  if (!recipient) throw new ApiError(404, 'Notification recipient not found');

  const notification = await prisma.notification.create({ data: value });
  res.status(201).json({
    ...notification,
    _links: {
      self: { href: `/api/v1/notifications/${notification.id}` },
      collection: { href: '/api/v1/notifications' }
    }
  });
}));

router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'Notification id must be a positive integer');
  const notification = await prisma.notification.findFirst({ where: { id, userId: Number(req.user.id) } });
  if (!notification) throw new ApiError(404, 'Notification not found');
  const updated = notification.readAt ? notification : await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() }
  });
  res.json({
    ...updated,
    _links: {
      self: { href: `/api/v1/notifications/${updated.id}` },
      collection: { href: '/api/v1/notifications' }
    }
  });
}));

module.exports = router;
