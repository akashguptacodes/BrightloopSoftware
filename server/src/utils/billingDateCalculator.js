/**
 * Billing Date & Period Calculator
 * Handles recurring interval math with safe end-of-month calendar handling.
 */

/**
 * Safely adds months to a date, clamping day to the last valid day of the target month.
 * e.g. Jan 31 + 1 month -> Feb 28 (or 29 on leap year)
 */
export function addMonthsClamped(date, months) {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setDate(1); // Set to 1st to prevent overflow during month bump
  d.setMonth(d.getMonth() + months);

  // Determine last day of the resulting month
  const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(targetDay, lastDayOfMonth));
  return d;
}

/**
 * Calculates next billing date from a reference date based on frequency and interval
 *
 * @param {string} frequency - 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
 * @param {number} [interval=1] - Multiplier (e.g. 1, 2, 3)
 * @param {Date|string} [fromDate=new Date()] - Reference anchor date
 * @returns {Date}
 */
export function calculateNextBillingDate(frequency = 'MONTHLY', interval = 1, fromDate = new Date()) {
  const base = new Date(fromDate);
  const safeInterval = Math.max(1, parseInt(interval, 10) || 1);

  switch (frequency?.toUpperCase()) {
    case 'DAILY': {
      const next = new Date(base);
      next.setDate(next.getDate() + safeInterval);
      return next;
    }
    case 'WEEKLY': {
      const next = new Date(base);
      next.setDate(next.getDate() + safeInterval * 7);
      return next;
    }
    case 'YEARLY': {
      const next = new Date(base);
      next.setFullYear(next.getFullYear() + safeInterval);
      return next;
    }
    case 'MONTHLY':
    default: {
      return addMonthsClamped(base, safeInterval);
    }
  }
}

/**
 * Calculates start and end of billing period for recurring invoices
 *
 * @param {string} frequency
 * @param {number} interval
 * @param {Date|string} periodStart
 * @returns {{ billingPeriodStart: Date, billingPeriodEnd: Date, nextBillingDate: Date }}
 */
export function calculateBillingPeriod(frequency = 'MONTHLY', interval = 1, periodStart = new Date()) {
  const start = new Date(periodStart);
  const nextBilling = calculateNextBillingDate(frequency, interval, start);

  // Period end is 1 millisecond / 1 day before the next cycle start
  const periodEnd = new Date(nextBilling);
  periodEnd.setMilliseconds(periodEnd.getMilliseconds() - 1);

  return {
    billingPeriodStart: start,
    billingPeriodEnd: periodEnd,
    nextBillingDate: nextBilling,
  };
}

