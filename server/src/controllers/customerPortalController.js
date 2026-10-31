import prisma from '../config/database.js';
import { sendQuotationStatusEmail } from '../services/emailService.js';

/**
 * Helper to resolve the Customer record for the logged in user
 */
async function resolveCurrentCustomer(userId, email) {
  let customer = await prisma.customer.findUnique({
    where: { userId },
  });

  if (!customer && email) {
    customer = await prisma.customer.findFirst({
      where: { email: email.toLowerCase() },
    });
    // Auto-link if found by email
    if (customer && !customer.userId) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { userId },
      });
    }
  }

  return customer;
}

/**
 * @desc    Get logged-in customer's profile and stats
 * @route   GET /api/customer-portal/profile
 */
export async function getCustomerProfile(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No customer profile linked to this user account. Please contact support.',
      });
    }

    const quotationCount = await prisma.quotation.count({
      where: { customerId: customer.id },
    });

    const activeSubscriptionCount = await prisma.subscription.count({
      where: { customerId: customer.id, status: 'ACTIVE' },
    });

    return res.status(200).json({
      success: true,
      data: {
        customer,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        stats: {
          totalQuotations: quotationCount,
          activeSubscriptions: activeSubscriptionCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get quotations for the logged-in customer
 * @route   GET /api/customer-portal/quotations
 */
export async function getCustomerQuotations(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);
    if (!customer) {
      return res.status(200).json({ success: true, data: { quotations: [] } });
    }

    const quotations = await prisma.quotation.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { quotations },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single quotation details for the logged-in customer
 * @route   GET /api/customer-portal/quotations/:id
 */
export async function getCustomerQuotationById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const quotation = await prisma.quotation.findFirst({
      where: { id, customerId: customer.id },
      include: {
        items: true,
        template: { select: { name: true } },
        subscription: { select: { id: true, subscriptionNumber: true, status: true } },
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { quotation, customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Approve/Accept quotation from customer portal
 * @route   POST /api/customer-portal/quotations/:id/accept
 */
export async function customerAcceptQuotation(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const quotation = await prisma.quotation.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Quotation is already accepted and converted.' });
    }

    if (quotation.status === 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'Quotation is already accepted.' });
    }

    // Check expiration
    if (new Date(quotation.validUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'This quotation has expired.' });
    }

    const updated = await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: { customer: true },
    });

    await sendQuotationStatusEmail({
      quotation: updated,
      customer: updated.customer,
      status: 'ACCEPTED',
    });

    return res.status(200).json({
      success: true,
      message: 'You have successfully approved this quotation! Our team will activate your subscription shortly.',
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Reject quotation from customer portal
 * @route   POST /api/customer-portal/quotations/:id/reject
 */
export async function customerRejectQuotation(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const quotation = await prisma.quotation.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    if (quotation.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Cannot reject a converted quotation.' });
    }

    const updated = await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        customerNotes: reason ? `Rejection reason: ${reason}` : quotation.customerNotes,
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
      message: 'Quotation has been declined.',
      data: { quotation: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get subscriptions for the logged-in customer
 * @route   GET /api/customer-portal/subscriptions
 */
export async function getCustomerSubscriptions(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);
    if (!customer) {
      return res.status(200).json({ success: true, data: { subscriptions: [] } });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: { select: { name: true, billingFrequency: true, billingInterval: true } },
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { subscriptions },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single subscription details for the logged-in customer
 * @route   GET /api/customer-portal/subscriptions/:id
 */
export async function getCustomerSubscriptionById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId: customer.id },
      include: {
        plan: true,
        items: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

