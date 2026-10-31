import prisma from '../config/database.js';
import { generateCustomerCode } from '../utils/numberGenerator.js';

/**
 * @desc    Create a new customer (ADMIN, STAFF)
 * @route   POST /api/customers
 */
export async function createCustomer(req, res, next) {
  try {
    const {
      contactPerson,
      companyName,
      email,
      phone,
      alternatePhone,
      billingAddress,
      shippingAddress,
      city,
      state,
      country,
      postalCode,
      taxIdentificationNumber,
      notes,
      userId,
    } = req.body;

    if (!contactPerson || !contactPerson.trim()) {
      return res.status(400).json({ success: false, message: 'Contact person name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Customer email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid customer email address.' });
    }

    // Check for existing customer with the same email
    const existing = await prisma.customer.findFirst({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Customer already exists with email: ${email}`,
        data: { customerId: existing.id, customerCode: existing.customerCode },
      });
    }

    // Generate unique sequential customer code
    const customerCode = await generateCustomerCode();

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        contactPerson: contactPerson.trim(),
        companyName: companyName ? companyName.trim() : null,
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        alternatePhone: alternatePhone ? alternatePhone.trim() : null,
        billingAddress: billingAddress ? billingAddress.trim() : null,
        shippingAddress: shippingAddress ? shippingAddress.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        country: country ? country.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
        taxIdentificationNumber: taxIdentificationNumber ? taxIdentificationNumber.trim() : null,
        notes: notes ? notes.trim() : null,
        userId: userId || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all customers with search & pagination (ADMIN, STAFF)
 * @route   GET /api/customers
 */
export async function getCustomers(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { customerCode: { contains: q, mode: 'insensitive' } },
        { contactPerson: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Sequential queries for PgBouncer connection safety
    const total = await prisma.customer.count({ where });
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            quotations: true,
            subscriptions: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        customers,
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
 * @desc    Get single customer by ID with quotations & subscriptions (ADMIN, STAFF, CUSTOMER self)
 * @route   GET /api/customers/:id
 */
export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, isActive: true },
        },
        quotations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            grandTotal: true,
            issueDate: true,
            validUntil: true,
            createdAt: true,
          },
        },
        subscriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
            grandTotal: true,
            startDate: true,
            nextBillingDate: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            quotations: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Role check: If CUSTOMER, ensure they own this record
    if (req.user && req.user.role === 'CUSTOMER' && customer.userId !== req.user.id && customer.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this customer record.' });
    }

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update customer details (ADMIN, STAFF)
 * @route   PUT /api/customers/:id
 */
export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const {
      contactPerson,
      companyName,
      email,
      phone,
      alternatePhone,
      billingAddress,
      shippingAddress,
      city,
      state,
      country,
      postalCode,
      taxIdentificationNumber,
      notes,
      isActive,
    } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          NOT: { id },
        },
      });
      if (emailConflict) {
        return res.status(409).json({ success: false, message: 'Email is already used by another customer.' });
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        contactPerson: contactPerson !== undefined ? contactPerson.trim() : existing.contactPerson,
        companyName: companyName !== undefined ? (companyName ? companyName.trim() : null) : existing.companyName,
        email: email !== undefined ? email.trim().toLowerCase() : existing.email,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : existing.phone,
        alternatePhone: alternatePhone !== undefined ? (alternatePhone ? alternatePhone.trim() : null) : existing.alternatePhone,
        billingAddress: billingAddress !== undefined ? (billingAddress ? billingAddress.trim() : null) : existing.billingAddress,
        shippingAddress: shippingAddress !== undefined ? (shippingAddress ? shippingAddress.trim() : null) : existing.shippingAddress,
        city: city !== undefined ? (city ? city.trim() : null) : existing.city,
        state: state !== undefined ? (state ? state.trim() : null) : existing.state,
        country: country !== undefined ? (country ? country.trim() : null) : existing.country,
        postalCode: postalCode !== undefined ? (postalCode ? postalCode.trim() : null) : existing.postalCode,
        taxIdentificationNumber: taxIdentificationNumber !== undefined ? (taxIdentificationNumber ? taxIdentificationNumber.trim() : null) : existing.taxIdentificationNumber,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : existing.notes,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      data: { customer: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Toggle customer active status (ADMIN, STAFF)
 * @route   PATCH /api/customers/:id/status
 */
export async function toggleCustomerStatus(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Customer ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { customer: updated },
    });
  } catch (error) {
    next(error);
  }
}

