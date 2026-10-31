import prisma from '../config/database.js';
import { calculateInvoiceItems, createManualInvoice, issueInvoice, voidInvoice } from '../services/invoiceService.js';
import { generateInvoicePdf } from '../services/invoicePdfService.js';

/**
 * List all invoices with search, filters, and pagination
 */
export async function getInvoices(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      customerId,
      subscriptionId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        { customer: { contactPerson: { contains: query, mode: 'insensitive' } } },
        { customer: { companyName: { contains: query, mode: 'insensitive' } } },
        { customer: { email: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // Run sequentially for Neon DB connection stability
    const total = await prisma.invoice.count({ where });
    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            contactPerson: true,
            email: true,
            companyName: true,
            customerCode: true,
          },
        },
        subscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
          },
        },
        _count: {
          select: { items: true, payments: true },
        },
      },
    });

    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      grandTotal: inv.totalAmount,
      invoiceDate: inv.issueDate,
    }));

    return res.status(200).json({
      success: true,
      data: formattedInvoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single invoice by ID with items, customer, payments and subscription
 */
export async function getInvoiceById(req, res, next) {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
            billingFrequencySnapshot: true,
            nextBillingDate: true,
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          include: {
            recordedBy: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const formattedInvoice = {
      ...invoice,
      grandTotal: invoice.totalAmount,
      invoiceDate: invoice.issueDate,
      terms: invoice.termsAndConditions,
    };

    return res.status(200).json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a manual invoice (Draft)
 */
export async function createInvoice(req, res, next) {
  try {
    const { customerId, subscriptionId, dueDate, notes, terms, items } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required' });
    }

    const invoice = await createManualInvoice(
      { customerId, subscriptionId, dueDate, notes, terms, items },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing DRAFT invoice
 */
export async function updateInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const { dueDate, notes, terms, items } = req.body;

    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit an invoice in ${existing.status} status. Only DRAFT invoices can be modified.`,
      });
    }

    const { itemsToCreate, subtotal, discountTotal, taxTotal, grandTotal } =
      await calculateInvoiceItems(items || []);

    const updated = await prisma.$transaction(
      async (tx) => {
        // Delete old items
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        // Update invoice and add new items
        return await tx.invoice.update({
          where: { id },
          data: {
            dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
            notes: notes !== undefined ? notes : existing.notes,
            terms: terms !== undefined ? terms : existing.terms,
            subtotal,
            discountTotal,
            taxTotal,
            grandTotal,
            amountDue: grandTotal,
            items: {
              create: itemsToCreate,
            },
          },
          include: {
            items: true,
            customer: true,
          },
        });
      },
      { maxWait: 15000, timeout: 30000 }
    );

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Issue a DRAFT invoice (makes it payable and triggers email notification)
 */
export async function issueInvoiceHandler(req, res, next) {
  try {
    const { id } = req.params;
    const invoice = await issueInvoice(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} issued successfully`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Void an unpaid invoice
 */
export async function voidInvoiceHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await voidInvoice(id, reason || 'Voided by administrative action', req.user.id);

    return res.status(200).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} has been voided`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Stream invoice as a downloadable/viewable PDF
 */
export async function downloadInvoicePdf(req, res, next) {
  try {
    const { id } = req.params;
    await generateInvoicePdf(id, res);
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    }
  }
}

