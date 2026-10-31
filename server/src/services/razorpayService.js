import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

/**
 * Creates an official Razorpay Order for an invoice
 *
 * @param {Object} params
 * @param {number|string} params.amount - Amount in Rupees
 * @param {string} params.invoiceNumber - Receipt reference
 * @param {string} [params.currency='INR']
 * @returns {Promise<Object>}
 */
export async function createRazorpayOrder({ amount, invoiceNumber, currency = 'INR' }) {
  const client = getRazorpayClient();
  if (!client) {
    throw new Error('Razorpay online payments are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env');
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  // Convert to paise (smallest currency unit for INR)
  const amountInPaise = Math.round(numericAmount * 100);

  const options = {
    amount: amountInPaise,
    currency,
    receipt: invoiceNumber.slice(-40), // max 40 chars
    payment_capture: 1, // Auto-capture payment upon authorization
  };

  const order = await client.orders.create(options);
  return order;
}

/**
 * Securely verifies payment signature from Razorpay Checkout callback
 *
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @returns {boolean}
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured.');
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

/**
 * Securely verifies webhook signature using raw body buffer and configured webhook secret
 *
 * @param {Buffer|string} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch (err) {
    return false;
  }
}

/**
 * Initiates an official refund through Razorpay
 */
export async function createRazorpayRefund({ paymentId, amount, notes = {} }) {
  const client = getRazorpayClient();
  if (!client) {
    throw new Error('Razorpay is not configured.');
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  const refund = await client.payments.refund(paymentId, {
    amount: amountInPaise,
    notes,
  });

  return refund;
}

