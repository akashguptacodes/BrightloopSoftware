import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { calculateDiscount } from './discountCalculator.js';

/**
 * Validates line items and calculates price snapshots and quotation totals
 *
 * @param {Array<Object>} items - Array of raw item requests
 * @param {Date} [currentDate=new Date()] - Reference date for validation
 * @returns {Promise<{
 *   validatedItems: Array<Object>,
 *   totals: {
 *     subtotal: Prisma.Decimal,
 *     discountTotal: Prisma.Decimal,
 *     taxTotal: Prisma.Decimal,
 *     grandTotal: Prisma.Decimal
 *   }
 * }>}
 */
export async function calculateQuotationItems(items = [], currentDate = new Date()) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one line item is required.');
  }

  const validatedItems = [];
  let totalSubtotal = new Prisma.Decimal(0);
  let totalDiscount = new Prisma.Decimal(0);
  let totalTax = new Prisma.Decimal(0);
  let totalGrand = new Prisma.Decimal(0);

  for (const item of items) {
    const { productId, variantId, planId, discountId, taxRate, taxId, quantity = 1, description } = item;

    if (!productId) {
      throw new Error('Each item must specify a product.');
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      throw new Error(`Invalid quantity ${quantity}. Minimum quantity is 1.`);
    }

    // 1. Fetch Product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }
    if (!product.isActive) {
      throw new Error(`Product "${product.name}" is inactive and cannot be quoted.`);
    }

    // 2. Fetch Variant (if provided)
    let variant = null;
    let variantPrice = new Prisma.Decimal(0);
    let variantSnapshot = null;

    if (variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant || variant.productId !== productId) {
        throw new Error(`Selected variant does not belong to product "${product.name}".`);
      }
      if (!variant.isActive) {
        throw new Error(`Variant "${variant.name}: ${variant.value}" is inactive.`);
      }

      variantPrice = new Prisma.Decimal(variant.additionalPrice || 0);
      variantSnapshot = `${variant.name}: ${variant.value}`;
    }

    // 3. Fetch Plan (if provided)
    let plan = null;
    let planSnapshot = null;
    let basePrice = new Prisma.Decimal(product.salesPrice);

    if (planId) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan || plan.productId !== productId) {
        throw new Error(`Selected plan does not belong to product "${product.name}".`);
      }
      if (!plan.isActive) {
        throw new Error(`Subscription plan "${plan.name}" is inactive.`);
      }

      if (qty < plan.minimumQuantity) {
        throw new Error(`Plan "${plan.name}" requires a minimum quantity of ${plan.minimumQuantity} units.`);
      }

      basePrice = new Prisma.Decimal(plan.price);
      planSnapshot = `${plan.name} (${plan.billingFrequency})`;
    }

    // 4. Calculate Unit Price & Subtotal
    const unitPrice = basePrice.plus(variantPrice);
    const lineSubtotal = unitPrice.mul(qty);

    // 5. Calculate Discount (if provided)
    let discountAmount = new Prisma.Decimal(0);
    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
        include: { products: { select: { id: true } } },
      });

      if (discount) {
        const discountResult = calculateDiscount(discount, productId, qty, lineSubtotal, currentDate);
        if (discountResult.isApplicable) {
          discountAmount = discountResult.discountAmount;
        }
      }
    } else if (item.discountAmount) {
      discountAmount = new Prisma.Decimal(Math.min(Number(item.discountAmount), Number(lineSubtotal)));
    }

    // 6. Taxable Subtotal
    let taxableAmount = lineSubtotal.minus(discountAmount);
    if (taxableAmount.lessThan(0)) {
      taxableAmount = new Prisma.Decimal(0);
    }

    // 7. Calculate Tax
    let effectiveTaxRate = new Prisma.Decimal(0);
    if (taxId) {
      const tax = await prisma.tax.findUnique({ where: { id: taxId } });
      if (tax && tax.isActive) {
        effectiveTaxRate = new Prisma.Decimal(tax.rate);
      }
    } else if (taxRate !== undefined && taxRate !== null) {
      effectiveTaxRate = new Prisma.Decimal(taxRate);
    }

    let taxAmount = new Prisma.Decimal(0);
    if (effectiveTaxRate.greaterThan(0)) {
      taxAmount = taxableAmount.mul(effectiveTaxRate).div(100);
      taxAmount = new Prisma.Decimal(taxAmount.toFixed(2));
    }

    // 8. Line Total
    const lineTotal = taxableAmount.plus(taxAmount);

    totalSubtotal = totalSubtotal.plus(lineSubtotal);
    totalDiscount = totalDiscount.plus(discountAmount);
    totalTax = totalTax.plus(taxAmount);
    totalGrand = totalGrand.plus(lineTotal);

    validatedItems.push({
      productId,
      variantId: variantId || null,
      planId: planId || null,
      productNameSnapshot: product.name,
      variantNameSnapshot: variantSnapshot,
      planNameSnapshot: planSnapshot,
      description: description ? description.trim() : null,
      quantity: qty,
      unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
      discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
      taxRateSnapshot: new Prisma.Decimal(effectiveTaxRate.toFixed(2)),
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
      grandTotal: new Prisma.Decimal(totalGrand.toFixed(2)),
    },
  };
}

/**
 * Convenience wrapper returning flat items and totals
 */
export async function calculateQuotation({ items, customerId, currentDate = new Date() }) {
  const result = await calculateQuotationItems(items, currentDate);
  return {
    items: result.validatedItems,
    subtotal: result.totals.subtotal,
    discountTotal: result.totals.discountTotal,
    taxTotal: result.totals.taxTotal,
    grandTotal: result.totals.grandTotal,
  };
}


