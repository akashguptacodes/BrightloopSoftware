import prisma from '../config/database.js';

/**
 * Log an activity or business event
 * Safe function that never crashes the calling thread
 */
export async function logActivity({
  userId,
  customerId,
  action,
  description,
  entityType,
  entityId,
  metadata,
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: userId || null,
        customerId: customerId || null,
        action,
        description,
        entityType,
        entityId: entityId ? String(entityId) : null,
        metadata: metadata || undefined,
      },
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to log activity:', err.message);
    return null;
  }
}

/**
 * Get activity logs with filters & pagination
 */
export async function getActivityLogs({
  page = 1,
  limit = 20,
  action,
  entityType,
  entityId,
  customerId,
  userId,
  startDate,
  endDate,
} = {}) {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {};

  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (customerId) where.customerId = customerId;
  if (userId) where.userId = userId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const total = await prisma.activityLog.count({ where });
  const logs = await prisma.activityLog.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      customer: { select: { id: true, contactPerson: true, companyName: true, email: true } },
    },
  });

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  };
}

