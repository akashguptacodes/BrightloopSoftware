import prisma from '../config/database.js';

/**
 * Concurrency-safe unique code / number generator
 */
export async function generateCustomerCode() {
  const year = new Date().getFullYear();
  const count = await prisma.customer.count();
  const sequence = String(count + 1).padStart(5, '0');
  const code = `CUST-${year}-${sequence}`;

  // Double-check collision
  const existing = await prisma.customer.findUnique({ where: { customerCode: code } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CUST-${year}-${sequence}-${randomSuffix}`;
  }
  return code;
}

export async function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count();
  const sequence = String(count + 1).padStart(5, '0');
  const num = `QUO-${year}-${sequence}`;

  // Double-check collision
  const existing = await prisma.quotation.findUnique({ where: { quotationNumber: num } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `QUO-${year}-${sequence}-${randomSuffix}`;
  }
  return num;
}

export async function generateSubscriptionNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.subscription.count();
  const sequence = String(count + 1).padStart(5, '0');
  const num = `SUB-${year}-${sequence}`;

  // Double-check collision
  const existing = await prisma.subscription.findUnique({ where: { subscriptionNumber: num } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SUB-${year}-${sequence}-${randomSuffix}`;
  }
  return num;
}

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const sequence = String(count + 1).padStart(6, '0');
  const num = `INV-${year}-${sequence}`;

  // Double-check collision
  const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: num } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${sequence}-${randomSuffix}`;
  }
  return num;
}

export async function generatePaymentReference() {
  const year = new Date().getFullYear();
  const count = await prisma.payment.count();
  const sequence = String(count + 1).padStart(6, '0');
  const num = `PAY-${year}-${sequence}`;

  // Double-check collision
  const existing = await prisma.payment.findUnique({ where: { paymentReference: num } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `PAY-${year}-${sequence}-${randomSuffix}`;
  }
  return num;
}
