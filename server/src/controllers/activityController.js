import { getActivityLogs } from '../services/activityService.js';

export async function getActivities(req, res, next) {
  try {
    const { page, limit, action, entityType, entityId, customerId, startDate, endDate } = req.query;

    const result = await getActivityLogs({
      page,
      limit,
      action,
      entityType,
      entityId,
      customerId,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

