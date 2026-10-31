import prisma from '../config/database.js';
import { sendQuotationStatusEmail } from '../services/emailService.js';
import { generateInvoicePdf } from '../services/invoicePdfService.js';
import { logActivity } from '../services/activityService.js';
import { calculateNextBillingDate } from '../utils/billingDateCalculator.js';

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

    const totalInvoicesCount = await prisma.invoice.count({
      where: { customerId: customer.id },
    });

    const unpaidInvoicesCount = await prisma.invoice.count({
      where: {
        customerId: customer.id,
        status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
    });

    const totalPaymentsCount = await prisma.payment.count({
      where: { customerId: customer.id, status: 'SUCCESSFUL' },
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
          totalInvoices: totalInvoicesCount,
          unpaidInvoices: unpaidInvoicesCount,
          totalPayments: totalPaymentsCount,
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

/**
 * @desc    Get invoices for the logged-in customer
 * @route   GET /api/customer-portal/invoices
 */
export async function getCustomerInvoices(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);
    if (!customer) {
      return res.status(200).json({ success: true, data: { invoices: [] } });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: customer.id,
        // Customers only see issued/payable or past invoices, never internal drafts
        status: { in: ['ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'REFUNDED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: { select: { subscriptionNumber: true } },
        _count: { select: { items: true, payments: true } },
      },
    });

    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      grandTotal: inv.totalAmount,
      invoiceDate: inv.issueDate,
    }));

    return res.status(200).json({
      success: true,
      data: { invoices: formattedInvoices },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single invoice details for customer
 * @route   GET /api/customer-portal/invoices/:id
 */
export async function getCustomerInvoiceById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, customerId: customer.id },
      include: {
        items: true,
        subscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            billingFrequencySnapshot: true,
          },
        },
        payments: {
          where: { status: 'SUCCESSFUL' },
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const formattedInvoice = {
      ...invoice,
      grandTotal: invoice.totalAmount,
      invoiceDate: invoice.issueDate,
      terms: invoice.termsAndConditions,
    };

    return res.status(200).json({
      success: true,
      data: { invoice: formattedInvoice, customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Download customer invoice PDF
 * @route   GET /api/customer-portal/invoices/:id/pdf
 */
export async function downloadCustomerInvoicePdf(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    await generateInvoicePdf(invoice.id, res);
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    }
  }
}

/**
 * @desc    Get customer payment history
 * @route   GET /api/customer-portal/payments
 */
export async function getCustomerPayments(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);
    if (!customer) {
      return res.status(200).json({ success: true, data: { payments: [] } });
    }

    const payments = await prisma.payment.findMany({
      where: { customerId: customer.id },
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            status: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update customer profile information
 * @route   PUT /api/customer-portal/profile
 */
export async function updateCustomerProfile(req, res, next) {
  try {
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const {
      contactPerson,
      companyName,
      phone,
      alternatePhone,
      billingAddress,
      shippingAddress,
      city,
      state,
      country,
      postalCode,
      taxIdentificationNumber,
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update customer record
      const cust = await tx.customer.update({
        where: { id: customer.id },
        data: {
          contactPerson: contactPerson !== undefined ? contactPerson : customer.contactPerson,
          companyName: companyName !== undefined ? companyName : customer.companyName,
          phone: phone !== undefined ? phone : customer.phone,
          alternatePhone: alternatePhone !== undefined ? alternatePhone : customer.alternatePhone,
          billingAddress: billingAddress !== undefined ? billingAddress : customer.billingAddress,
          shippingAddress: shippingAddress !== undefined ? shippingAddress : customer.shippingAddress,
          city: city !== undefined ? city : customer.city,
          state: state !== undefined ? state : customer.state,
          country: country !== undefined ? country : customer.country,
          postalCode: postalCode !== undefined ? postalCode : customer.postalCode,
          taxIdentificationNumber:
            taxIdentificationNumber !== undefined ? taxIdentificationNumber : customer.taxIdentificationNumber,
        },
      });

      // 2. Also keep user name in sync
      if (contactPerson && req.user.id) {
        await tx.user.update({
          where: { id: req.user.id },
          data: { name: contactPerson },
        });
      }

      return cust;
    });

    await logActivity({
      userId: req.user.id,
      customerId: customer.id,
      action: 'CUSTOMER_PROFILE_UPDATED',
      description: `Customer profile updated by ${updated.contactPerson}`,
      entityType: 'Customer',
      entityId: customer.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Pause subscription from customer portal
 * @route   POST /api/customer-portal/subscriptions/:id/pause
 */
export async function customerPauseSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    // Strict ownership validation
    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId: customer.id },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Only ACTIVE subscriptions can be paused. Current status: ${subscription.status}`,
      });
    }

    // Enforce Plan Pause Policy
    if (subscription.plan && subscription.plan.allowPause === false) {
      return res.status(400).json({
        success: false,
        message: `Pausing is not permitted for the ${subscription.plan.name} plan according to its service agreement.`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAUSED' },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'PAUSED',
          fromStatus: 'ACTIVE',
          toStatus: 'PAUSED',
          description: reason ? `Customer paused subscription: ${reason}` : 'Customer requested temporary pause via portal',
          performedById: req.user.id,
        },
      });

      return sub;
    });

    await logActivity({
      userId: req.user.id,
      customerId: customer.id,
      action: 'SUBSCRIPTION_PAUSED',
      description: `Subscription ${subscription.subscriptionNumber} paused by customer`,
      entityType: 'Subscription',
      entityId: subscription.id,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${subscription.subscriptionNumber} has been paused.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Resume paused subscription from customer portal
 * @route   POST /api/customer-portal/subscriptions/:id/resume
 */
export async function customerResumeSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status !== 'PAUSED') {
      return res.status(400).json({
        success: false,
        message: `Only PAUSED subscriptions can be resumed. Current status: ${subscription.status}`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'RESUMED',
          fromStatus: 'PAUSED',
          toStatus: 'ACTIVE',
          description: 'Customer resumed subscription via portal',
          performedById: req.user.id,
        },
      });

      return sub;
    });

    await logActivity({
      userId: req.user.id,
      customerId: customer.id,
      action: 'SUBSCRIPTION_RESUMED',
      description: `Subscription ${subscription.subscriptionNumber} resumed by customer`,
      entityType: 'Subscription',
      entityId: subscription.id,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${subscription.subscriptionNumber} is now active.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Cancel subscription from customer portal
 * @route   POST /api/customer-portal/subscriptions/:id/cancel
 */
export async function customerCancelSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId: customer.id },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.status === 'CANCELLED' || subscription.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: `Subscription is already ${subscription.status}.`,
      });
    }

    // Check Plan Early Cancellation Policy
    if (subscription.plan && subscription.plan.allowEarlyCancellation === false) {
      return res.status(400).json({
        success: false,
        message: `Early termination is restricted for the ${subscription.plan.name} commitment period. Please contact support.`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason || 'Cancelled by customer via self-service portal',
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'CANCELLED',
          fromStatus: subscription.status,
          toStatus: 'CANCELLED',
          description: reason ? `Customer cancelled: ${reason}` : 'Cancelled by customer via portal',
          performedById: req.user.id,
        },
      });

      return sub;
    });

    await logActivity({
      userId: req.user.id,
      customerId: customer.id,
      action: 'SUBSCRIPTION_CANCELLED',
      description: `Subscription ${subscription.subscriptionNumber} cancelled by customer`,
      entityType: 'Subscription',
      entityId: subscription.id,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${subscription.subscriptionNumber} has been cancelled.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Renew subscription from customer portal
 * @route   POST /api/customer-portal/subscriptions/:id/renew
 */
export async function customerRenewSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await resolveCurrentCustomer(req.user.id, req.user.email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId: customer.id },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (subscription.plan && subscription.plan.allowRenewal === false) {
      return res.status(400).json({
        success: false,
        message: 'This subscription plan does not allow customer self-renewal.',
      });
    }

    const currentBase = subscription.nextBillingDate && new Date(subscription.nextBillingDate) > new Date()
      ? new Date(subscription.nextBillingDate)
      : new Date();

    const frequency = subscription.billingFrequencySnapshot || subscription.plan?.billingFrequency || 'MONTHLY';
    const interval = subscription.billingIntervalSnapshot || subscription.plan?.billingInterval || 1;
    const nextDate = calculateNextBillingDate(currentBase, frequency, interval);

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          nextBillingDate: nextDate,
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'RENEWED',
          fromStatus: subscription.status,
          toStatus: 'ACTIVE',
          description: `Customer initiated renewal. Next billing date: ${nextDate.toLocaleDateString()}`,
          performedById: req.user.id,
        },
      });

      return sub;
    });

    await logActivity({
      userId: req.user.id,
      customerId: customer.id,
      action: 'SUBSCRIPTION_RENEWED',
      description: `Subscription ${subscription.subscriptionNumber} renewed by customer`,
      entityType: 'Subscription',
      entityId: subscription.id,
    });

    return res.status(200).json({
      success: true,
      message: `Subscription ${subscription.subscriptionNumber} renewed! Next billing date: ${nextDate.toLocaleDateString()}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}



