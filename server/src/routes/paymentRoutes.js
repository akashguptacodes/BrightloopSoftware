import express from 'express';
import {
  getPayments,
  getPaymentById,
  recordManualPaymentHandler,
  initiateRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
  refundPaymentHandler,
  getInvoicePayments,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// List payments
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getPayments);

// Record manual offline payment
router.post('/manual', authorizeRoles('ADMIN', 'STAFF'), recordManualPaymentHandler);

// Razorpay checkout endpoints
router.post('/razorpay/create-order', initiateRazorpayOrderHandler);
router.post('/razorpay/verify', verifyRazorpayPaymentHandler);

// Single payment details & refund
router.get('/:id', authorizeRoles('ADMIN', 'STAFF'), getPaymentById);
router.post('/:id/refund', authorizeRoles('ADMIN'), refundPaymentHandler);

// Payments for a specific invoice
router.get('/invoice/:invoiceId', authorizeRoles('ADMIN', 'STAFF'), getInvoicePayments);

export default router;

