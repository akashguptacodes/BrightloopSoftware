import prisma from '../config/database.js';
import { generateSubscriptionNumber } from '../utils/numberGenerator.js';
import { calculateQuotation } from '../utils/quotationCalculator.js';
import { sendSubscriptionStatusEmail } from '../services/emailService.js';

/**
 * Helper to compute period end and next billing date
 */
function calculateNextBilling(frequency, interval = 1, fromDate = new Date()) {
  const d = new Date(fromDate);
  switch (frequency) {
    case 'DAILY':
      d.setDate(d.getDate() + interval);
      break;
    case 'WEEKLY':
      d.setDate(d.getDate() + interval * 7);
      break;
    case 'YEARLY':
      d.setFullYear(d.getFullYear() + interval);
      break;
    case 'MONTHLY':
    default:
      d.setMonth(d.getMonth() + interval);
      break;
  }
  return d;
}

/**
 * @desc    Get all subscriptions with search & filters (ADMIN, STAFF)
 * @route   GET /api/subscriptions
 */
export async function getSubscriptions(req, res, next) {
  try {
    const { status, customerId, planId, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (planId) {
      where.planId = planId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { subscriptionNumber: { contains: q, mode: 'insensitive' } },
        { customer: { contactPerson: { contains: q, mode: 'insensitive' } } },
        { customer: { companyName: { contains: q, mode: 'insensitive' } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Sequential queries for PgBouncer pooler safety
    const total = await prisma.subscription.count({ where });
    const subscriptions = await prisma.subscription.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            contactPerson: true,
            companyName: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            billingFrequency: true,
            billingInterval: true,
          },
        },
        _count: {
          select: { items: true, history: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single subscription with items & history (ADMIN, STAFF, CUSTOMER self)
 * @route   GET /api/subscriptions/:id
 */
export async function getSubscriptionById(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        items: {
          include: {
            product: { select: { id: true, name: true, type: true } },
            variant: { select: { id: true, name: true, value: true } },
            plan: { select: { id: true, name: true } },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        quotation: {
          select: { id: true, quotationNumber: true, status: true, issueDate: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    // Role check: CUSTOMER can only view if it belongs to them
    if (
      req.user &&
      req.user.role === 'CUSTOMER' &&
      subscription.customer.userId !== req.user.id &&
      subscription.customer.email !== req.user.email
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this subscription.' });
    }

    return res.status(200).json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create direct subscription without a prior quotation (ADMIN, STAFF)
 * @route   POST /api/subscriptions
 */
export async function createDirectSubscription(req, res, next) {
  try {
    const {
      customerId,
      planId,
      items,
      startDate,
      paymentTerms,
      autoRenew = true,
      initialStatus = 'ACTIVE',
    } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required.' });
    }

    // Plan resolution
    let plan = null;
    if (planId) {
      plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    } else {
      const itemWithPlan = items.find((i) => i.planId);
      if (itemWithPlan) {
        plan = await prisma.subscriptionPlan.findUnique({ where: { id: itemWithPlan.planId } });
      }
    }

    const frequency = plan ? plan.billingFrequency : 'MONTHLY';
    const interval = plan ? plan.billingInterval : 1;

    // Calculation engine for item snapshots
    const calculation = await calculateQuotation({ items, customerId });

    const start = startDate ? new Date(startDate) : new Date();
    const nextBilling = calculateNextBilling(frequency, interval, start);
    const subscriptionNumber = await generateSubscriptionNumber();

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber,
        customerId,
        planId: plan ? plan.id : null,
        status: initialStatus === 'PENDING' ? 'PENDING' : 'ACTIVE',
        startDate: start,
        nextBillingDate: nextBilling,
        billingFrequencySnapshot: frequency,
        billingIntervalSnapshot: interval,
        quantity: items[0]?.quantity || 1,
        subtotal: calculation.subtotal,
        discountTotal: calculation.discountTotal,
        taxTotal: calculation.taxTotal,
        grandTotal: calculation.grandTotal,
        paymentTerms: paymentTerms ? paymentTerms.trim() : null,
        autoRenew: Boolean(autoRenew),
        createdById: req.user.id,
        items: {
          create: calculation.items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            planId: it.planId,
            productNameSnapshot: it.productNameSnapshot,
            variantNameSnapshot: it.variantNameSnapshot,
            planNameSnapshot: it.planNameSnapshot,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discountAmount: it.discountAmount,
            taxRateSnapshot: it.taxRateSnapshot,
            taxAmount: it.taxAmount,
            lineSubtotal: it.lineSubtotal,
            lineTotal: it.lineTotal,
          })),
        },
        history: {
          create: {
            action: 'CREATED',
            newStatus: initialStatus === 'PENDING' ? 'PENDING' : 'ACTIVE',
            description: 'Subscription manually created.',
            performedById: req.user.id,
          },
        },
      },
      include: {
        customer: true,
        plan: true,
        items: true,
        history: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully.',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Activate subscription (from PENDING or PAUSED) (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/activate
 */
export async function activateSubscription(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Subscription is already active.' });
    }

    if (['CLOSED', 'CANCELLED', 'EXPIRED'].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot activate a subscription in ${subscription.status} status. Please create a new subscription or renew.`,
      });
    }

    const previousStatus = subscription.status;
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          pausedAt: null,
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'ACTIVATED',
          previousStatus,
          newStatus: 'ACTIVE',
          description: `Subscription activated by staff/admin.`,
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    await sendSubscriptionStatusEmail({
      subscription: updated,
      customer: updated.customer,
      status: 'ACTIVE',
      message: 'Your subscription is now active.',
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} is now ACTIVE.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Pause subscription (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/pause
 */
export async function pauseSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Only ACTIVE subscriptions can be paused. Current status is ${subscription.status}.`,
      });
    }

    if (subscription.plan && !subscription.plan.allowPause) {
      return res.status(400).json({
        success: false,
        message: `The plan "${subscription.plan.name}" does not permit pausing.`,
      });
    }

    const previousStatus = subscription.status;
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          pausedAt: new Date(),
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'PAUSED',
          previousStatus,
          newStatus: 'PAUSED',
          description: note || 'Subscription paused by user request.',
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    await sendSubscriptionStatusEmail({
      subscription: updated,
      customer: updated.customer,
      status: 'PAUSED',
      message: note || 'Your subscription has been temporarily paused.',
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} has been paused.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Resume subscription (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/resume
 */
export async function resumeSubscription(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status !== 'PAUSED') {
      return res.status(400).json({
        success: false,
        message: `Only PAUSED subscriptions can be resumed. Current status is ${subscription.status}.`,
      });
    }

    const previousStatus = subscription.status;
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          pausedAt: null,
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'RESUMED',
          previousStatus,
          newStatus: 'ACTIVE',
          description: 'Subscription resumed from paused state.',
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    await sendSubscriptionStatusEmail({
      subscription: updated,
      customer: updated.customer,
      status: 'ACTIVE',
      message: 'Your subscription has been resumed and is now active.',
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} has been resumed.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Cancel subscription (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/cancel
 */
export async function cancelSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (['CANCELLED', 'CLOSED'].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: `Subscription is already ${subscription.status}.`,
      });
    }

    if (subscription.plan && !subscription.plan.allowEarlyCancellation) {
      return res.status(400).json({
        success: false,
        message: `The plan "${subscription.plan.name}" does not allow early cancellation.`,
      });
    }

    const previousStatus = subscription.status;
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason ? reason.trim() : null,
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'CANCELLED',
          previousStatus,
          newStatus: 'CANCELLED',
          description: reason ? `Cancellation reason: ${reason}` : 'Subscription cancelled.',
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    await sendSubscriptionStatusEmail({
      subscription: updated,
      customer: updated.customer,
      status: 'CANCELLED',
      message: reason ? `Cancelled: ${reason}` : 'Your subscription has been cancelled.',
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} has been cancelled.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Renew subscription (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/renew
 */
export async function renewSubscription(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.plan && !subscription.plan.allowRenewal) {
      return res.status(400).json({
        success: false,
        message: `Plan "${subscription.plan.name}" does not permit renewal.`,
      });
    }

    const frequency = subscription.billingFrequencySnapshot || 'MONTHLY';
    const interval = subscription.billingIntervalSnapshot || 1;

    // Base next renewal date from existing nextBillingDate or today
    const baseDate = subscription.nextBillingDate && subscription.nextBillingDate > new Date()
      ? subscription.nextBillingDate
      : new Date();

    const newNextBilling = calculateNextBilling(frequency, interval, baseDate);
    const previousStatus = subscription.status;

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          nextBillingDate: newNextBilling,
          endDate: newNextBilling,
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'RENEWED',
          previousStatus,
          newStatus: 'ACTIVE',
          description: `Renewed for next cycle ending on ${newNextBilling.toISOString().split('T')[0]}.`,
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    await sendSubscriptionStatusEmail({
      subscription: updated,
      customer: updated.customer,
      status: 'RENEWED',
      message: `Your subscription has been renewed. Next billing date: ${newNextBilling.toLocaleDateString()}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} renewed successfully.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Close subscription (ADMIN, STAFF)
 * @route   POST /api/subscriptions/:id/close
 */
export async function closeSubscription(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true, plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Subscription is already closed.' });
    }

    const previousStatus = subscription.status;
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
        include: { customer: true, plan: true },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action: 'CLOSED',
          previousStatus,
          newStatus: 'CLOSED',
          description: 'Subscription manually closed.',
          performedById: req.user.id,
        },
      });

      return sub;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${updated.subscriptionNumber} has been closed.`,
      data: { subscription: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get subscription audit history (ADMIN, STAFF, CUSTOMER self)
 * @route   GET /api/subscriptions/:id/history
 */
export async function getSubscriptionHistory(req, res, next) {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (
      req.user &&
      req.user.role === 'CUSTOMER' &&
      subscription.customer.userId !== req.user.id &&
      subscription.customer.email !== req.user.email
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const history = await prisma.subscriptionHistory.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
}

