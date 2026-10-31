import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { generateInvoiceNumber } from '../utils/numberGenerator.js';
import { sendInvoiceIssuedEmail } from './emailService.js';

/**
 * Validates and calculates invoice items using strict Decimal financial arithmetic
 *
 * @param {Array<Object>} rawItems
 * @returns {Promise<{
 *   validatedItems: Array<Object>,
 *   totals: {
 *     subtotal: Prisma.Decimal,
 *     discountTotal: Prisma.Decimal,
 *     taxTotal: Prisma.Decimal,
 *     totalAmount: Prisma.Decimal,
 *     amountDue: Prisma.Decimal
 *   }
 * }>}
 */
export async function calculateInvoiceItems(rawItems = []) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('At least one line item is required to generate an invoice.');
  }

  const validatedItems = [];
  let totalSubtotal = new Prisma.Decimal(0);
  let totalDiscount = new Prisma.Decimal(0);
  let totalTax = new Prisma.Decimal(0);
  let grandTotal = new Prisma.Decimal(0);

  for (const item of rawItems) {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = new Prisma.Decimal(item.unitPrice || 0);
    const lineSubtotal = unitPrice.mul(qty);

    let discountAmount = new Prisma.Decimal(item.discountAmount || 0);
    if (discountAmount.greaterThan(lineSubtotal)) {
      discountAmount = lineSubtotal;
    }

    const taxable = Prisma.Decimal.max(new Prisma.Decimal(0), lineSubtotal.sub(discountAmount));
    const taxRate = new Prisma.Decimal(item.taxRateSnapshot || 0);
    let taxAmount = new Prisma.Decimal(0);

    if (taxRate.greaterThan(0)) {
      taxAmount = taxable.mul(taxRate).div(100);
      taxAmount = new Prisma.Decimal(taxAmount.toFixed(2));
    }

    const lineTotal = taxable.add(taxAmount);

    totalSubtotal = totalSubtotal.add(lineSubtotal);
    totalDiscount = totalDiscount.add(discountAmount);
    totalTax = totalTax.add(taxAmount);
    grandTotal = grandTotal.add(lineTotal);

    validatedItems.push({
      subscriptionItemId: item.subscriptionItemId || null,
      productNameSnapshot: item.productNameSnapshot || 'Line Item',
      variantNameSnapshot: item.variantNameSnapshot || null,
      planNameSnapshot: item.planNameSnapshot || null,
      description: item.description ? item.description.trim() : null,
      quantity: qty,
      unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
      discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
      taxRateSnapshot: new Prisma.Decimal(taxRate.toFixed(2)),
      taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
      lineSubtotal: new Prisma.Decimal(lineSubtotal.toFixed(2)),
      lineTotal: new Prisma.Decimal(lineTotal.toFixed(2)),
    });
  }

  return {
    validatedItems,
    totals: {
      subtotal: new Prisma.Decimal(totalSubtotal.toFixed(2)),
      discountTotal: new Prisma.Decimal(totalDiscount.toFixed(2)),
      taxTotal: new Prisma.Decimal(totalTax.toFixed(2)),
      totalAmount: new Prisma.Decimal(grandTotal.toFixed(2)),
      amountDue: new Prisma.Decimal(grandTotal.toFixed(2)),
    },
  };
}

/**
 * Creates a manual invoice in DRAFT status
 */
export async function createManualInvoice(data, userId) {
  const {
    customerId,
    subscriptionId,
    dueDate,
    items,
    notes,
    termsAndConditions,
    currency = 'INR',
    autoIssue = false,
  } = data;

  if (!customerId) {
    throw new Error('Customer ID is required.');
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new Error('Customer not found.');
  }

  let finalItems = items;

  // If subscription selected without explicit items, pull saved snapshots from subscription items
  if (subscriptionId && (!items || items.length === 0)) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { items: true },
    });
    if (!sub) {
      throw new Error('Selected subscription not found.');
    }
    finalItems = sub.items.map((si) => ({
      subscriptionItemId: si.id,
      productNameSnapshot: si.productNameSnapshot,
      variantNameSnapshot: si.variantNameSnapshot,
      planNameSnapshot: si.planNameSnapshot,
      quantity: si.quantity,
      unitPrice: si.unitPrice,
      discountAmount: si.discountAmount,
      taxRateSnapshot: si.taxRateSnapshot,
      taxAmount: si.taxAmount,
      lineSubtotal: si.lineSubtotal,
      lineTotal: si.lineTotal,
    }));
  }

  const calculation = await calculateInvoiceItems(finalItems);
  const invoiceNumber = await generateInvoiceNumber();

  const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const status = autoIssue ? 'ISSUED' : 'DRAFT';

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      subscriptionId: subscriptionId || null,
      status,
      issueDate: new Date(),
      dueDate: due,
      subtotal: calculation.totals.subtotal,
      discountTotal: calculation.totals.discountTotal,
      taxTotal: calculation.totals.taxTotal,
      totalAmount: calculation.totals.totalAmount,
      amountPaid: new Prisma.Decimal(0),
      amountDue: calculation.totals.amountDue,
      currency,
      notes: notes ? notes.trim() : null,
      termsAndConditions: termsAndConditions ? termsAndConditions.trim() : null,
      createdById: userId || null,
      items: {
        create: calculation.validatedItems,
      },
    },
    include: {
      customer: true,
      subscription: true,
      items: true,
    },
  });

  if (autoIssue) {
    await sendInvoiceIssuedEmail({ invoice, customer: invoice.customer });
  }

  return invoice;
}

/**
 * Transitions DRAFT invoice to ISSUED and fires email notification
 */
export async function issueInvoice(id) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found.');
  }

  if (invoice.status !== 'DRAFT') {
    throw new Error(`Invoice cannot be issued because it is in ${invoice.status} status.`);
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'ISSUED' },
    include: { customer: true, items: true },
  });

  await sendInvoiceIssuedEmail({ invoice: updated, customer: updated.customer });
  return updated;
}

/**
 * Voids an unpaid/issued invoice
 */
export async function voidInvoice(id) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) {
    throw new Error('Invoice not found.');
  }

  if (['PAID', 'PARTIALLY_PAID', 'REFUNDED'].includes(invoice.status)) {
    throw new Error(`Cannot void an invoice with recorded payments (${invoice.status}).`);
  }

  return prisma.invoice.update({
    where: { id },
    data: { status: 'VOID' },
    include: { customer: true },
  });
}

