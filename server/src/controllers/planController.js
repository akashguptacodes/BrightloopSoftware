import prisma from '../config/database.js';

const VALID_BILLING_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

/**
 * @desc    Create a subscription plan (ADMIN only)
 * @route   POST /api/plans
 */
export async function createPlan(req, res, next) {
  try {
    const {
      name,
      description,
      productId,
      price,
      billingFrequency = 'MONTHLY',
      billingInterval = 1,
      minimumQuantity = 1,
      availableFrom,
      availableUntil,
      allowRenewal = true,
      allowPause = false,
      allowEarlyCancellation = true,
      autoCloseOnExpiry = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Plan name is required.' });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Associated product ID is required.' });
    }

    // 1. Check product existence and active status
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Referenced product not found.' });
    }
    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a subscription plan for an inactive product.',
      });
    }

    // 2. Price cannot be negative
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Plan price must be a non-negative number.' });
    }

    // 3. Billing frequency validation
    const upperFreq = String(billingFrequency).toUpperCase();
    if (!VALID_BILLING_FREQUENCIES.includes(upperFreq)) {
      return res.status(400).json({
        success: false,
        message: `Billing frequency must be one of: ${VALID_BILLING_FREQUENCIES.join(', ')}`,
      });
    }

    // 4. Billing interval must be positive
    if (Number(billingInterval) < 1) {
      return res.status(400).json({ success: false, message: 'Billing interval must be at least 1.' });
    }

    // 5. Minimum quantity must be at least 1
    if (Number(minimumQuantity) < 1) {
      return res.status(400).json({ success: false, message: 'Minimum quantity must be at least 1.' });
    }

    // 6. Availability dates validation
    const fromDate = availableFrom ? new Date(availableFrom) : new Date();
    let untilDate = null;

    if (availableUntil) {
      untilDate = new Date(availableUntil);
      if (untilDate < fromDate) {
        return res.status(400).json({
          success: false,
          message: 'availableUntil cannot be earlier than availableFrom.',
        });
      }
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        productId,
        price: Number(price),
        billingFrequency: upperFreq,
        billingInterval: Number(billingInterval),
        minimumQuantity: Number(minimumQuantity),
        availableFrom: fromDate,
        availableUntil: untilDate,
        allowRenewal: Boolean(allowRenewal),
        allowPause: Boolean(allowPause),
        allowEarlyCancellation: Boolean(allowEarlyCancellation),
        autoCloseOnExpiry: Boolean(autoCloseOnExpiry),
      },
      include: {
        product: {
          select: { id: true, name: true, type: true, salesPrice: true, isActive: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully.',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all plans (ADMIN and STAFF)
 * @route   GET /api/plans
 */
export async function getPlans(req, res, next) {
  try {
    const { search, productId, billingFrequency, status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    if (productId) {
      where.productId = productId;
    }

    if (billingFrequency && VALID_BILLING_FREQUENCIES.includes(billingFrequency.toUpperCase())) {
      where.billingFrequency = billingFrequency.toUpperCase();
    }

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    const take = Math.max(1, Number(limit));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, type: true, salesPrice: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.subscriptionPlan.count({ where });

    return res.status(200).json({
      success: true,
      message: 'Subscription plans retrieved successfully.',
      data: {
        plans,
        pagination: {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get plan by ID (ADMIN and STAFF)
 * @route   GET /api/plans/:id
 */
export async function getPlanById(req, res, next) {
  try {
    const { id } = req.params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription plan retrieved successfully.',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update a plan (ADMIN only)
 * @route   PUT /api/plans/:id
 */
export async function updatePlan(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      productId,
      price,
      billingFrequency,
      billingInterval,
      minimumQuantity,
      availableFrom,
      availableUntil,
      allowRenewal,
      allowPause,
      allowEarlyCancellation,
      autoCloseOnExpiry,
      isActive,
    } = req.body;

    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    const data = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Plan name cannot be empty.' });
      data.name = name.trim();
    }

    if (description !== undefined) {
      data.description = description ? description.trim() : null;
    }

    if (productId !== undefined && productId !== existingPlan.productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ success: false, message: 'Referenced product not found.' });
      if (!product.isActive) {
        return res.status(400).json({ success: false, message: 'Cannot assign plan to an inactive product.' });
      }
      data.productId = productId;
    }

    if (price !== undefined) {
      if (Number(price) < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      data.price = Number(price);
    }

    if (billingFrequency !== undefined) {
      const upperFreq = String(billingFrequency).toUpperCase();
      if (!VALID_BILLING_FREQUENCIES.includes(upperFreq)) {
        return res.status(400).json({
          success: false,
          message: `Billing frequency must be one of: ${VALID_BILLING_FREQUENCIES.join(', ')}`,
        });
      }
      data.billingFrequency = upperFreq;
    }

    if (billingInterval !== undefined) {
      if (Number(billingInterval) < 1) {
        return res.status(400).json({ success: false, message: 'Billing interval must be at least 1.' });
      }
      data.billingInterval = Number(billingInterval);
    }

    if (minimumQuantity !== undefined) {
      if (Number(minimumQuantity) < 1) {
        return res.status(400).json({ success: false, message: 'Minimum quantity must be at least 1.' });
      }
      data.minimumQuantity = Number(minimumQuantity);
    }

    const effectiveFrom = availableFrom ? new Date(availableFrom) : existingPlan.availableFrom;
    if (availableFrom !== undefined) {
      data.availableFrom = effectiveFrom;
    }

    if (availableUntil !== undefined) {
      if (availableUntil) {
        const effectiveUntil = new Date(availableUntil);
        if (effectiveUntil < effectiveFrom) {
          return res.status(400).json({
            success: false,
            message: 'availableUntil cannot be earlier than availableFrom.',
          });
        }
        data.availableUntil = effectiveUntil;
      } else {
        data.availableUntil = null;
      }
    }

    if (allowRenewal !== undefined) data.allowRenewal = Boolean(allowRenewal);
    if (allowPause !== undefined) data.allowPause = Boolean(allowPause);
    if (allowEarlyCancellation !== undefined) data.allowEarlyCancellation = Boolean(allowEarlyCancellation);
    if (autoCloseOnExpiry !== undefined) data.autoCloseOnExpiry = Boolean(autoCloseOnExpiry);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data,
      include: {
        product: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully.',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle plan active status (ADMIN only)
 * @route   PATCH /api/plans/:id/status
 */
export async function updatePlanStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Plan ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a plan (ADMIN only)
 * @route   DELETE /api/plans/:id
 */
export async function deletePlan(req, res, next) {
  try {
    const { id } = req.params;

    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    await prisma.subscriptionPlan.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

