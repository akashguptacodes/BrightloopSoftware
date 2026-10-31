import prisma from '../config/database.js';
import { calculateQuotation } from '../utils/quotationCalculator.js';
import { generateQuotationNumber, generateSubscriptionNumber } from '../utils/numberGenerator.js';
import { sendQuotationEmail, sendQuotationStatusEmail } from '../services/emailService.js';

/**
 * Helper to calculate billing dates from frequency & interval
 */
function calculatePeriodDates(frequency, interval = 1, fromDate = new Date()) {
  const start = new Date(fromDate);
  const nextBilling = new Date(start);

  switch (frequency) {
    case 'DAILY':
      nextBilling.setDate(nextBilling.getDate() + interval);
      break;
    case 'WEEKLY':
      nextBilling.setDate(nextBilling.getDate() + interval * 7);
      break;
    case 'YEARLY':
      nextBilling.setFullYear(nextBilling.getFullYear() + interval);
      break;
    case 'MONTHLY':
    default:
      nextBilling.setMonth(nextBilling.getMonth() + interval);
      break;
  }

  return { startDate: start, nextBillingDate: nextBilling };
}

/**
 * @desc    Create a new quotation (ADMIN, STAFF)
 * @route   POST /api/quotations
 */
export async function createQuotation(req, res, next) {
  try {
    const {
      customerId,
      templateId,
      validUntil,
      customerNotes,
      internalNotes,
      termsAndConditions,
      items,
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

    // Optional quotation template resolution
    let template = null;
    let computedTerms = termsAndConditions;
    let computedNotes = customerNotes;
    let expiryDate = validUntil ? new Date(validUntil) : null;

    if (templateId) {
      template = await prisma.quotationTemplate.findUnique({ where: { id: templateId } });
      if (template) {
        if (!computedTerms) computedTerms = template.termsAndConditions;
        if (!computedNotes && template.notes) computedNotes = template.notes;
        if (!expiryDate) {
          expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (template.validityDays || 15));
        }
      }
    }

    if (!expiryDate) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15); // default 15 days
    }

    // Run unified calculation engine for line items and totals
    const calculation = await calculateQuotation({ items, customerId });

    // Generate unique sequential quotation number (QUO-YYYY-XXXXX)
    const quotationNumber = await generateQuotationNumber();

    // Create quotation with its line item snapshots
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        templateId: templateId || null,
        createdById: req.user.id,
        status: 'DRAFT',
        issueDate: new Date(),
        validUntil: expiryDate,
        subtotal: calculation.subtotal,
        discountTotal: calculation.discountTotal,
        taxTotal: calculation.taxTotal,
        grandTotal: calculation.grandTotal,
        customerNotes: computedNotes ? computedNotes.trim() : null,
        internalNotes: internalNotes ? internalNotes.trim() : null,
        termsAndConditions: computedTerms ? computedTerms.trim() : null,
        items: {
          create: calculation.items.map((it) => ({
            productId: it.productId || null,
            variantId: it.variantId || null,
            planId: it.planId || null,
            productNameSnapshot: it.productNameSnapshot,
            variantNameSnapshot: it.variantNameSnapshot,
            planNameSnapshot: it.planNameSnapshot,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discountAmount: it.discountAmount,
            taxRateSnapshot: it.taxRateSnapshot,
            taxAmount: it.taxAmount,
            lineSubtotal: it.lineSubtotal,
            lineTotal: it.lineTotal,
          })),
        },
      },
      include: {
        customer: true,
        template: true,
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation created successfully in DRAFT state.',
      data: { quotation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all quotations with filters & pagination (ADMIN, STAFF)
 * @route   GET /api/quotations
 */
export async function getQuotations(req, res, next) {
  try {
    const { status, customerId, search, page = 1, limit = 20 } = req.query;
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

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { quotationNumber: { contains: q, mode: 'insensitive' } },
        { customer: { contactPerson: { contains: q, mode: 'insensitive' } } },
        { customer: { companyName: { contains: q, mode: 'insensitive' } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Sequential queries for PgBouncer safety
    const total = await prisma.quotation.count({ where });
    const quotations = await prisma.quotation.findMany({
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
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        quotations,
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
 * @desc    Get single quotation details by ID (ADMIN, STAFF, CUSTOMER self)
 * @route   GET /api/quotations/:id
 */
export async function getQuotationById(req, res, next) {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        template: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, type: true } },
            variant: { select: { id: true, name: true, value: true } },
            plan: { select: { id: true, name: true, billingFrequency: true, billingInterval: true } },
          },
        },
        subscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
            startDate: true,
            nextBillingDate: true,
          },
        },
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Role check: CUSTOMER can only view if it belongs to them
    if (
      req.user &&
      req.user.role === 'CUSTOMER' &&
      quotation.customer.userId !== req.user.id &&
      quotation.customer.email !== req.user.email
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this quotation.' });
    }

    return res.status(200).json({
      success: true,
      data: { quotation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update quotation (ADMIN, STAFF) - Allowed only when in DRAFT status
 * @route   PUT /api/quotations/:id
 */
export async function updateQuotation(req, res, next) {
  try {
    const { id } = req.params;
    const {
      customerId,
      templateId,
      validUntil,
      customerNotes,
      internalNotes,
      termsAndConditions,
      items,
    } = req.body;

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit quotation in ${existing.status} status. Only DRAFT quotations can be modified.`,
      });
    }

    const targetCustomerId = customerId || existing.customerId;
    const targetItems = items && Array.isArray(items) && items.length > 0 ? items : existing.items;

    // Recalculate if items changed or customer changed
    const calculation = await calculateQuotation({
      items: targetItems,
      customerId: targetCustomerId,
    });

    // Update with transaction to replace items cleanly
    const updated = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items) && items.length > 0) {
        // Delete old line items
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });

        // Insert new line items
        await tx.quotationItem.createMany({
          data: calculation.items.map((it) => ({
            quotationId: id,
            productId: it.productId || null,
            variantId: it.variantId || null,
            planId: it.planId || null,
            productNameSnapshot: it.productNameSnapshot,
            variantNameSnapshot: it.variantNameSnapshot,
            planNameSnapshot: it.planNameSnapshot,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discountAmount: it.discountAmount,
            taxRateSnapshot: it.taxRateSnapshot,
            taxAmount: it.taxAmount,
            lineSubtotal: it.lineSubtotal,
            lineTotal: it.lineTotal,
          })),
        });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          customerId: targetCustomerId,
          templateId: templateId !== undefined ? templateId : existing.templateId,
          validUntil: validUntil ? new Date(validUntil) : existing.validUntil,
          customerNotes: customerNotes !== undefined ? customerNotes : existing.customerNotes,
          internalNotes: internalNotes !== undefined ? internalNotes : existing.internalNotes,
          termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : existing.termsAndConditions,
          subtotal: calculation.subtotal,
          discountTotal: calculation.discountTotal,
          taxTotal: calculation.taxTotal,
          grandTotal: calculation.grandTotal,
        },
        include: {
          customer: true,
          items: true,
        },
      });
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation updated successfully.',
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Send quotation to customer via email (ADMIN, STAFF)
 * @route   POST /api/quotations/:id/send
 */
export async function sendQuotation(req, res, next) {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Quotation has already been converted into a subscription.' });
    }

    // Update status to SENT
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: 'SENT' },
      include: { customer: true, items: true },
    });

    // Send email notification to customer
    await sendQuotationEmail({
      quotation: updated,
      customer: updated.customer,
    });

    return res.status(200).json({
      success: true,
      message: `Quotation ${updated.quotationNumber} has been sent to ${updated.customer.email}.`,
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Manually accept quotation (ADMIN, STAFF)
 * @route   POST /api/quotations/:id/accept
 */
export async function acceptQuotation(req, res, next) {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Quotation is already converted.' });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: { customer: true },
    });

    // Notify customer
    await sendQuotationStatusEmail({
      quotation: updated,
      customer: updated.customer,
      status: 'ACCEPTED',
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation marked as ACCEPTED.',
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Manually reject quotation (ADMIN, STAFF)
 * @route   POST /api/quotations/:id/reject
 */
export async function rejectQuotation(req, res, next) {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Quotation has already been converted.' });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
      include: { customer: true },
    });

    await sendQuotationStatusEmail({
      quotation: updated,
      customer: updated.customer,
      status: 'REJECTED',
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation marked as REJECTED.',
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Convert quotation to active/pending subscription (ADMIN, STAFF)
 * @route   POST /api/quotations/:id/convert
 */
export async function convertToSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { autoRenew = true, paymentTerms } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { plan: true },
        },
        subscription: true,
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED' || quotation.subscription) {
      return res.status(400).json({
        success: false,
        message: 'This quotation has already been converted into a subscription.',
        data: { subscriptionId: quotation.subscription?.id },
      });
    }

    // Determine primary plan if any line item links to a subscription plan
    const itemWithPlan = quotation.items.find((it) => it.planId && it.plan);
    const plan = itemWithPlan ? itemWithPlan.plan : null;
    const frequency = plan ? plan.billingFrequency : 'MONTHLY';
    const interval = plan ? plan.billingInterval : 1;

    // Calculate dates
    const { startDate, nextBillingDate } = calculatePeriodDates(frequency, interval, new Date());

    // Generate unique subscription number
    const subscriptionNumber = await generateSubscriptionNumber();

    // Atomic transaction for conversion
    const subscription = await prisma.$transaction(async (tx) => {
      // 1. Create Subscription
      const sub = await tx.subscription.create({
        data: {
          subscriptionNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          planId: plan ? plan.id : null,
          status: 'ACTIVE',
          startDate,
          nextBillingDate,
          billingFrequencySnapshot: frequency,
          billingIntervalSnapshot: interval,
          quantity: itemWithPlan ? itemWithPlan.quantity : 1,
          subtotal: quotation.subtotal,
          discountTotal: quotation.discountTotal,
          taxTotal: quotation.taxTotal,
          grandTotal: quotation.grandTotal,
          paymentTerms: paymentTerms || quotation.termsAndConditions || null,
          autoRenew: Boolean(autoRenew),
          createdById: req.user.id,
          items: {
            create: quotation.items.map((it) => ({
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
              action: 'CREATED_FROM_QUOTATION',
              newStatus: 'ACTIVE',
              description: `Subscription automatically created from quotation ${quotation.quotationNumber}.`,
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

      // 2. Mark Quotation as CONVERTED
      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: 'CONVERTED' },
      });

      return sub;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return res.status(201).json({
      success: true,
      message: `Quotation converted successfully into Subscription ${subscription.subscriptionNumber}.`,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

