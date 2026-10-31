import express from 'express';
import {
  getCustomerProfile,
  getCustomerQuotations,
  getCustomerQuotationById,
  customerAcceptQuotation,
  customerRejectQuotation,
  getCustomerSubscriptions,
  getCustomerSubscriptionById,
  getCustomerInvoices,
  getCustomerInvoiceById,
  downloadCustomerInvoicePdf,
  getCustomerPayments,
} from '../controllers/customerPortalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
// Accessible by CUSTOMER role (and ADMIN for testing/impersonation)
router.use(authorizeRoles('CUSTOMER', 'ADMIN'));

router.get('/profile', getCustomerProfile);

router.get('/quotations', getCustomerQuotations);
router.get('/quotations/:id', getCustomerQuotationById);
router.post('/quotations/:id/accept', customerAcceptQuotation);
router.post('/quotations/:id/reject', customerRejectQuotation);

router.get('/subscriptions', getCustomerSubscriptions);
router.get('/subscriptions/:id', getCustomerSubscriptionById);

// Customer Invoices & Payments
router.get('/invoices', getCustomerInvoices);
router.get('/invoices/:id', getCustomerInvoiceById);
router.get('/invoices/:id/pdf', downloadCustomerInvoicePdf);
router.get('/payments', getCustomerPayments);

export default router;

