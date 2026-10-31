import prisma from '../config/database.js';

const VALID_DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'];

/**
 * @desc    Create a discount rule (ADMIN only)
 * @route   POST /api/discounts
 */
export async function createDiscount(req, res, next) {
  try {
    const {
      name,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minimumPurchaseAmount,
      minimumQuantity,
      startsAt,
      expiresAt,
      usageLimit,
      appliesToAllProducts = false,
      productIds = [],
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Discount name is required.' });
    }

    const upperType = String(discountType).toUpperCase();
    if (!VALID_DISCOUNT_TYPES.includes(upperType)) {
      return res.status(400).json({
        success: false,
        message: `Discount type must be one of: ${VALID_DISCOUNT_TYPES.join(', ')}`,
      });
    }

    if (discountValue === undefined || discountValue === null || isNaN(discountValue)) {
      return res.status(400).json({ success: false, message: 'Discount value is required.' });
    }

    const numericValue = Number(discountValue);
    if (upperType === 'PERCENTAGE') {
      if (numericValue <= 0 || numericValue > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount must be greater than 0% and at most 100%.',
        });
      }
    } else if (upperType === 'FIXED') {
      if (numericValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Fixed discount amount must be greater than 0.',
        });
      }
    }

    if (minimumPurchaseAmount !== undefined && minimumPurchaseAmount !== null && Number(minimumPurchaseAmount) < 0) {
      return res.status(400).json({ success: false, message: 'Minimum purchase amount cannot be negative.' });
    }

    if (minimumQuantity !== undefined && minimumQuantity !== null && Number(minimumQuantity) < 1) {
      return res.status(400).json({ success: false, message: 'Minimum quantity must be at least 1.' });
    }

    const startDate = startsAt ? new Date(startsAt) : new Date();
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (expiryDate < startDate) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date cannot be earlier than start date.',
        });
      }
    }

    if (usageLimit !== undefined && usageLimit !== null && Number(usageLimit) < 1) {
      return res.status(400).json({ success: false, message: 'Usage limit must be at least 1.' });
    }

    const isAll = Boolean(appliesToAllProducts);
    const validProductIds = Array.isArray(productIds) ? productIds : [];

    const discount = await prisma.discount.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        discountType: upperType,
        discountValue: numericValue,
        minimumPurchaseAmount: minimumPurchaseAmount !== undefined && minimumPurchaseAmount !== null ? Number(minimumPurchaseAmount) : null,
        minimumQuantity: minimumQuantity !== undefined && minimumQuantity !== null ? Number(minimumQuantity) : null,
        startsAt: startDate,
        expiresAt: expiryDate,
        usageLimit: usageLimit !== undefined && usageLimit !== null ? Number(usageLimit) : null,
        appliesToAllProducts: isAll,
        products: !isAll && validProductIds.length > 0
          ? {
              connect: validProductIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        products: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Discount rule created successfully.',
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all discount rules (ADMIN and STAFF)
 * @route   GET /api/discounts
 */
export async function getDiscounts(req, res, next) {
  try {
    const { search, discountType, status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    if (discountType && VALID_DISCOUNT_TYPES.includes(discountType.toUpperCase())) {
      where.discountType = discountType.toUpperCase();
    }

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    const take = Math.max(1, Number(limit));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const discounts = await prisma.discount.findMany({
      where,
      include: {
        products: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.discount.count({ where });

    return res.status(200).json({
      success: true,
      message: 'Discount rules retrieved successfully.',
      data: {
        discounts,
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
 * @desc    Get discount rule by ID (ADMIN and STAFF)
 * @route   GET /api/discounts/:id
 */
export async function getDiscountById(req, res, next) {
  try {
    const { id } = req.params;

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
      },
    });

    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount rule not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Discount rule retrieved successfully.',
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update a discount rule (ADMIN only)
 * @route   PUT /api/discounts/:id
 */
export async function updateDiscount(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discountType,
      discountValue,
      minimumPurchaseAmount,
      minimumQuantity,
      startsAt,
      expiresAt,
      usageLimit,
      appliesToAllProducts,
      productIds,
      isActive,
    } = req.body;

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
      return res.status(404).json({ success: false, message: 'Discount rule not found.' });
    }

    const data = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Discount name cannot be empty.' });
      data.name = name.trim();
    }

    if (description !== undefined) {
      data.description = description ? description.trim() : null;
    }

    if (discountType !== undefined) {
      const upperType = String(discountType).toUpperCase();
      if (!VALID_DISCOUNT_TYPES.includes(upperType)) {
        return res.status(400).json({
          success: false,
          message: `Discount type must be one of: ${VALID_DISCOUNT_TYPES.join(', ')}`,
        });
      }
      data.discountType = upperType;
    }

    const effectiveType = data.discountType || existingDiscount.discountType;

    if (discountValue !== undefined) {
      const numericVal = Number(discountValue);
      if (effectiveType === 'PERCENTAGE' && (numericVal <= 0 || numericVal > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount must be greater than 0% and at most 100%.',
        });
      }
      if (effectiveType === 'FIXED' && numericVal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Fixed discount amount must be greater than 0.',
        });
      }
      data.discountValue = numericVal;
    }

    if (minimumPurchaseAmount !== undefined) {
      data.minimumPurchaseAmount = minimumPurchaseAmount !== null ? Number(minimumPurchaseAmount) : null;
    }

    if (minimumQuantity !== undefined) {
      data.minimumQuantity = minimumQuantity !== null ? Number(minimumQuantity) : null;
    }

    const effectiveStart = startsAt ? new Date(startsAt) : existingDiscount.startsAt;
    if (startsAt !== undefined) {
      data.startsAt = effectiveStart;
    }

    if (expiresAt !== undefined) {
      if (expiresAt) {
        const effectiveExpiry = new Date(expiresAt);
        if (effectiveExpiry < effectiveStart) {
          return res.status(400).json({
            success: false,
            message: 'Expiry date cannot be earlier than start date.',
          });
        }
        data.expiresAt = effectiveExpiry;
      } else {
        data.expiresAt = null;
      }
    }

    if (usageLimit !== undefined) {
      data.usageLimit = usageLimit !== null ? Number(usageLimit) : null;
    }

    if (appliesToAllProducts !== undefined) {
      data.appliesToAllProducts = Boolean(appliesToAllProducts);
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    if (productIds !== undefined && Array.isArray(productIds)) {
      if (data.appliesToAllProducts || (appliesToAllProducts === undefined && existingDiscount.appliesToAllProducts)) {
        data.products = { set: [] };
      } else {
        data.products = {
          set: productIds.map((pid) => ({ id: pid })),
        };
      }
    }

    const discount = await prisma.discount.update({
      where: { id },
      data,
      include: {
        products: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Discount rule updated successfully.',
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle discount active status (ADMIN only)
 * @route   PATCH /api/discounts/:id/status
 */
export async function updateDiscountStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
      return res.status(404).json({ success: false, message: 'Discount rule not found.' });
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Discount rule ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a discount rule (ADMIN only)
 * @route   DELETE /api/discounts/:id
 */
export async function deleteDiscount(req, res, next) {
  try {
    const { id } = req.params;

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
      return res.status(404).json({ success: false, message: 'Discount rule not found.' });
    }

    await prisma.discount.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Discount rule deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

