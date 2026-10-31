import prisma from '../config/database.js';

/**
 * @desc    Create a new tax rule (ADMIN only)
 * @route   POST /api/taxes
 */
export async function createTax(req, res, next) {
  try {
    const { name, rate, description, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tax name is required (e.g., GST 18%).' });
    }

    if (rate === undefined || rate === null || isNaN(rate)) {
      return res.status(400).json({ success: false, message: 'Tax rate percentage is required.' });
    }

    const numericRate = Number(rate);
    if (numericRate < 0 || numericRate > 100) {
      return res.status(400).json({ success: false, message: 'Tax rate must be between 0% and 100%.' });
    }

    const tax = await prisma.tax.create({
      data: {
        name: name.trim(),
        rate: numericRate,
        description: description ? description.trim() : null,
        isActive: Boolean(isActive),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Tax rule created successfully.',
      data: { tax },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all tax rules (ADMIN and STAFF)
 * @route   GET /api/taxes
 */
export async function getTaxes(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    const taxes = await prisma.tax.findMany({
      where,
      orderBy: { rate: 'asc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Tax rules retrieved successfully.',
      data: { taxes },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get tax rule by ID (ADMIN and STAFF)
 * @route   GET /api/taxes/:id
 */
export async function getTaxById(req, res, next) {
  try {
    const { id } = req.params;

    const tax = await prisma.tax.findUnique({ where: { id } });
    if (!tax) {
      return res.status(404).json({ success: false, message: 'Tax rule not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Tax rule retrieved successfully.',
      data: { tax },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update a tax rule (ADMIN only)
 * @route   PUT /api/taxes/:id
 */
export async function updateTax(req, res, next) {
  try {
    const { id } = req.params;
    const { name, rate, description, isActive } = req.body;

    const existingTax = await prisma.tax.findUnique({ where: { id } });
    if (!existingTax) {
      return res.status(404).json({ success: false, message: 'Tax rule not found.' });
    }

    const data = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Tax name cannot be empty.' });
      data.name = name.trim();
    }

    if (rate !== undefined) {
      const numericRate = Number(rate);
      if (numericRate < 0 || numericRate > 100) {
        return res.status(400).json({ success: false, message: 'Tax rate must be between 0% and 100%.' });
      }
      data.rate = numericRate;
    }

    if (description !== undefined) {
      data.description = description ? description.trim() : null;
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const tax = await prisma.tax.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: 'Tax rule updated successfully.',
      data: { tax },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle tax active status (ADMIN only)
 * @route   PATCH /api/taxes/:id/status
 */
export async function updateTaxStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const existingTax = await prisma.tax.findUnique({ where: { id } });
    if (!existingTax) {
      return res.status(404).json({ success: false, message: 'Tax rule not found.' });
    }

    const tax = await prisma.tax.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Tax rule ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { tax },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a tax rule (ADMIN only)
 * @route   DELETE /api/taxes/:id
 */
export async function deleteTax(req, res, next) {
  try {
    const { id } = req.params;

    const existingTax = await prisma.tax.findUnique({ where: { id } });
    if (!existingTax) {
      return res.status(404).json({ success: false, message: 'Tax rule not found.' });
    }

    await prisma.tax.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Tax rule deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

