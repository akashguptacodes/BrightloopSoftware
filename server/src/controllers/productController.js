import prisma from '../config/database.js';

const VALID_PRODUCT_TYPES = ['SOFTWARE', 'SERVICE', 'PHYSICAL'];

// ==========================================
// Product Handlers
// ==========================================

/**
 * @desc    Create a product (ADMIN only)
 * @route   POST /api/products
 */
export async function createProduct(req, res, next) {
  try {
    const { name, description, type = 'SOFTWARE', salesPrice, costPrice = 0, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    const upperType = String(type).toUpperCase();
    if (!VALID_PRODUCT_TYPES.includes(upperType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product type. Must be one of: ${VALID_PRODUCT_TYPES.join(', ')}`,
      });
    }

    if (salesPrice === undefined || salesPrice === null || Number(salesPrice) < 0) {
      return res.status(400).json({ success: false, message: 'Sales price must be a non-negative number.' });
    }

    if (costPrice !== undefined && Number(costPrice) < 0) {
      return res.status(400).json({ success: false, message: 'Cost price must be a non-negative number.' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        type: upperType,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice || 0),
        notes: notes ? notes.trim() : null,
      },
      include: {
        variants: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all products (ADMIN and STAFF)
 * @route   GET /api/products
 */
export async function getProducts(req, res, next) {
  try {
    const { search, type, status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    if (type && VALID_PRODUCT_TYPES.includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    const take = Math.max(1, Number(limit));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        _count: {
          select: { plans: true, variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.product.count({ where });

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      data: {
        products,
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
 * @desc    Get product details by ID (ADMIN and STAFF)
 * @route   GET /api/products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        plans: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update product details (ADMIN only)
 * @route   PUT /api/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, type, salesPrice, costPrice, notes, isActive } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const data = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Product name cannot be empty.' });
      }
      data.name = name.trim();
    }

    if (description !== undefined) {
      data.description = description ? description.trim() : null;
    }

    if (type !== undefined) {
      const upperType = String(type).toUpperCase();
      if (!VALID_PRODUCT_TYPES.includes(upperType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product type. Must be one of: ${VALID_PRODUCT_TYPES.join(', ')}`,
        });
      }
      data.type = upperType;
    }

    if (salesPrice !== undefined) {
      if (Number(salesPrice) < 0) {
        return res.status(400).json({ success: false, message: 'Sales price must be non-negative.' });
      }
      data.salesPrice = Number(salesPrice);
    }

    if (costPrice !== undefined) {
      if (Number(costPrice) < 0) {
        return res.status(400).json({ success: false, message: 'Cost price must be non-negative.' });
      }
      data.costPrice = Number(costPrice);
    }

    if (notes !== undefined) {
      data.notes = notes ? notes.trim() : null;
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        variants: true,
        plans: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle product active status (ADMIN only)
 * @route   PATCH /api/products/:id/status
 */
export async function updateProductStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
      include: { variants: true },
    });

    return res.status(200).json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a product (ADMIN only)
 * @route   DELETE /api/products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (existingProduct._count.plans > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing subscription plans. Deactivate the product instead.',
      });
    }

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Product Variant Handlers
// ==========================================

/**
 * @desc    Create a variant for a product (ADMIN only)
 * @route   POST /api/products/:productId/variants
 */
export async function createVariant(req, res, next) {
  try {
    const { productId } = req.params;
    const { name, value, additionalPrice = 0 } = req.body;

    if (!name || !name.trim() || !value || !value.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Variant attribute name (e.g., Brand) and value (e.g., Odoo) are required.',
      });
    }

    if (Number(additionalPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Additional price must be non-negative.',
      });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: name.trim(),
        value: value.trim(),
        additionalPrice: Number(additionalPrice || 0),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product variant created successfully.',
      data: { variant },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all variants for a product (ADMIN and STAFF)
 * @route   GET /api/products/:productId/variants
 */
export async function getVariants(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Product variants retrieved successfully.',
      data: { variants },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update a variant (ADMIN only)
 * @route   PUT /api/variants/:id
 */
export async function updateVariant(req, res, next) {
  try {
    const { id } = req.params;
    const { name, value, additionalPrice, isActive } = req.body;

    const existingVariant = await prisma.productVariant.findUnique({ where: { id } });
    if (!existingVariant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (value !== undefined) data.value = value.trim();
    if (additionalPrice !== undefined) {
      if (Number(additionalPrice) < 0) {
        return res.status(400).json({ success: false, message: 'Additional price must be non-negative.' });
      }
      data.additionalPrice = Number(additionalPrice);
    }
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const variant = await prisma.productVariant.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: 'Product variant updated successfully.',
      data: { variant },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle variant status (ADMIN only)
 * @route   PATCH /api/variants/:id/status
 */
export async function updateVariantStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const existingVariant = await prisma.productVariant.findUnique({ where: { id } });
    if (!existingVariant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Variant ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { variant },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a variant (ADMIN only)
 * @route   DELETE /api/variants/:id
 */
export async function deleteVariant(req, res, next) {
  try {
    const { id } = req.params;

    const existingVariant = await prisma.productVariant.findUnique({ where: { id } });
    if (!existingVariant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    await prisma.productVariant.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Variant deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

