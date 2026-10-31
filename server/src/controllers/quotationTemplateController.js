import prisma from '../config/database.js';

/**
 * @desc    Create a new quotation template (ADMIN, STAFF)
 * @route   POST /api/quotation-templates
 */
export async function createTemplate(req, res, next) {
  try {
    const { name, description, termsAndConditions, validityDays = 15, notes, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Template name is required.' });
    }

    const template = await prisma.quotationTemplate.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        termsAndConditions: termsAndConditions ? termsAndConditions.trim() : null,
        validityDays: Math.max(1, parseInt(validityDays, 10) || 15),
        notes: notes ? notes.trim() : null,
        isActive: Boolean(isActive),
        createdById: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation template created successfully.',
      data: { template },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all quotation templates (ADMIN, STAFF)
 * @route   GET /api/quotation-templates
 */
export async function getTemplates(req, res, next) {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    const templates = await prisma.quotationTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { templates },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single quotation template by ID (ADMIN, STAFF)
 * @route   GET /api/quotation-templates/:id
 */
export async function getTemplateById(req, res, next) {
  try {
    const { id } = req.params;

    const template = await prisma.quotationTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { template },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update a quotation template (ADMIN, STAFF)
 * @route   PUT /api/quotation-templates/:id
 */
export async function updateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, termsAndConditions, validityDays, notes, isActive } = req.body;

    const existing = await prisma.quotationTemplate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    const updated = await prisma.quotationTemplate.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        termsAndConditions: termsAndConditions !== undefined ? (termsAndConditions ? termsAndConditions.trim() : null) : existing.termsAndConditions,
        validityDays: validityDays !== undefined ? Math.max(1, parseInt(validityDays, 10) || 15) : existing.validityDays,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : existing.notes,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation template updated successfully.',
      data: { template: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle template status (ADMIN, STAFF)
 * @route   PATCH /api/quotation-templates/:id/status
 */
export async function toggleTemplateStatus(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.quotationTemplate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    const updated = await prisma.quotationTemplate.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Template ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { template: updated },
    });
  } catch (error) {
    next(error);
  }
}

