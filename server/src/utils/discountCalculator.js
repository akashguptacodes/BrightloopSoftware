import { Prisma } from '@prisma/client';

/**
 * Calculates discount eligibility and amount
 * @param {Object} discount - The discount record from database (including products if applicable)
 * @param {string} productId - The product ID being purchased
 * @param {number} quantity - Quantity of the item
 * @param {number|string|Prisma.Decimal} eligibleSubtotal - The subtotal amount to which discount may apply
 * @param {Date} [currentDate=new Date()] - The reference date for validity checks
 * @returns {{ isApplicable: boolean, reason: string|null, discountAmount: Prisma.Decimal }}
 */
export function calculateDiscount(discount, productId, quantity = 1, eligibleSubtotal = 0, currentDate = new Date()) {
  const zero = new Prisma.Decimal(0);
  const subtotal = new Prisma.Decimal(eligibleSubtotal || 0);
  const now = currentDate instanceof Date ? currentDate : new Date(currentDate);

  if (!discount) {
    return { isApplicable: false, reason: 'No discount provided', discountAmount: zero };
  }

  // 1. Discount must be active
  if (!discount.isActive) {
    return { isApplicable: false, reason: 'Discount is inactive', discountAmount: zero };
  }

  // 2. Validity period check: startsAt <= now
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    return { isApplicable: false, reason: 'Discount offer has not started yet', discountAmount: zero };
  }

  // 2b. Validity period check: expiresAt >= now
  if (discount.expiresAt && new Date(discount.expiresAt) < now) {
    return { isApplicable: false, reason: 'Discount offer has expired', discountAmount: zero };
  }

  // 3. Usage limit must not be exhausted
  if (discount.usageLimit !== null && discount.usageLimit !== undefined) {
    if (Number(discount.usedCount || 0) >= Number(discount.usageLimit)) {
      return { isApplicable: false, reason: 'Discount usage limit reached', discountAmount: zero };
    }
  }

  // 4. Product must be eligible
  if (!discount.appliesToAllProducts) {
    const eligibleProductIds = (discount.products || []).map((p) => p.id || p);
    if (!eligibleProductIds.includes(productId)) {
      return { isApplicable: false, reason: 'Discount does not apply to this product', discountAmount: zero };
    }
  }

  // 5. Minimum quantity requirement
  if (discount.minimumQuantity !== null && discount.minimumQuantity !== undefined && discount.minimumQuantity > 0) {
    if (Number(quantity) < Number(discount.minimumQuantity)) {
      return {
        isApplicable: false,
        reason: `Requires minimum quantity of ${discount.minimumQuantity}`,
        discountAmount: zero,
      };
    }
  }

  // 6. Minimum purchase amount requirement
  if (discount.minimumPurchaseAmount !== null && discount.minimumPurchaseAmount !== undefined) {
    const minPurchase = new Prisma.Decimal(discount.minimumPurchaseAmount);
    if (subtotal.lessThan(minPurchase)) {
      return {
        isApplicable: false,
        reason: `Requires minimum purchase amount of ${minPurchase.toFixed(2)}`,
        discountAmount: zero,
      };
    }
  }

  // 7. Calculate discount amount
  let calculatedAmount = zero;
  const discountVal = new Prisma.Decimal(discount.discountValue || 0);

  if (discount.discountType === 'PERCENTAGE') {
    // subtotal * (discountValue / 100)
    calculatedAmount = subtotal.mul(discountVal).div(100);
  } else if (discount.discountType === 'FIXED') {
    calculatedAmount = discountVal;
  }

  // Round to 2 decimal places
  calculatedAmount = new Prisma.Decimal(calculatedAmount.toFixed(2));

  // 8. Discount amount must never exceed the eligible subtotal
  if (calculatedAmount.greaterThan(subtotal)) {
    calculatedAmount = subtotal;
  }

  return {
    isApplicable: true,
    reason: null,
    discountAmount: calculatedAmount,
  };
}

