import { Prisma } from '@prisma/client';
import { calculateDiscount } from './discountCalculator.js';

/**
 * Calculates itemized and total pricing for a product selection
 *
 * @param {Object} params
 * @param {number|string|Prisma.Decimal} params.basePrice - Product base sales price
 * @param {number|string|Prisma.Decimal} [params.variantAdditionalPrice=0] - Additional price for selected variant
 * @param {number} [params.quantity=1] - Number of units
 * @param {Object} [params.discount=null] - Applicable discount rule (optional)
 * @param {string} [params.productId=null] - Product ID (for discount product matching)
 * @param {number|string|Prisma.Decimal} [params.taxRate=0] - Tax rate percentage (e.g. 18 for 18%)
 * @param {Date} [params.currentDate=new Date()] - Date for discount validity check
 *
 * @returns {{
 *   unitPrice: Prisma.Decimal,
 *   quantity: number,
 *   subtotal: Prisma.Decimal,
 *   discountAmount: Prisma.Decimal,
 *   discountApplied: boolean,
 *   discountReason: string|null,
 *   taxableAmount: Prisma.Decimal,
 *   taxAmount: Prisma.Decimal,
 *   taxRate: Prisma.Decimal,
 *   total: Prisma.Decimal
 * }}
 */
export function calculatePrice({
  basePrice = 0,
  variantAdditionalPrice = 0,
  quantity = 1,
  discount = null,
  productId = null,
  taxRate = 0,
  currentDate = new Date(),
}) {
  const base = new Prisma.Decimal(basePrice || 0);
  const variant = new Prisma.Decimal(variantAdditionalPrice || 0);
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;

  // 1. Unit price = base price + variant additional price
  const unitPrice = base.plus(variant);

  // 2. Subtotal = unitPrice * quantity
  const subtotal = unitPrice.mul(qty);

  // 3. Discount calculation
  let discountAmount = new Prisma.Decimal(0);
  let discountApplied = false;
  let discountReason = null;

  if (discount) {
    const discountResult = calculateDiscount(discount, productId, qty, subtotal, currentDate);
    if (discountResult.isApplicable) {
      discountAmount = discountResult.discountAmount;
      discountApplied = true;
    } else {
      discountReason = discountResult.reason;
    }
  }

  // 4. Taxable amount = subtotal - discount
  let taxableAmount = subtotal.minus(discountAmount);
  if (taxableAmount.lessThan(0)) {
    taxableAmount = new Prisma.Decimal(0);
  }

  // 5. Tax calculation = taxableAmount * (taxRate / 100)
  const rate = new Prisma.Decimal(taxRate || 0);
  let taxAmount = new Prisma.Decimal(0);
  if (rate.greaterThan(0)) {
    taxAmount = taxableAmount.mul(rate).div(100);
    taxAmount = new Prisma.Decimal(taxAmount.toFixed(2));
  }

  // 6. Final total = taxableAmount + taxAmount
  const total = taxableAmount.plus(taxAmount);

  return {
    unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
    quantity: qty,
    subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
    discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
    discountApplied,
    discountReason,
    taxableAmount: new Prisma.Decimal(taxableAmount.toFixed(2)),
    taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
    taxRate: new Prisma.Decimal(rate.toFixed(2)),
    total: new Prisma.Decimal(total.toFixed(2)),
  };
}

