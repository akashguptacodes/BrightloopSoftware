import express from 'express';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerQuotations,
  getCustomerQuotationById,
  customerAcceptQuotation,
  customerRejectQuotation,
  getCustomerSubscriptions,
  getCustomerSubscriptionById,
  customerPauseSubscription,
  customerResumeSubscription,
  customerCancelSubscription,
  customerRenewSubscription,
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

// Customer Profile
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);

// Customer Quotations
router.get('/quotations', getCustomerQuotations);
router.get('/quotations/:id', getCustomerQuotationById);
router.post('/quotations/:id/accept', customerAcceptQuotation);
router.post('/quotations/:id/reject', customerRejectQuotation);

// Customer Subscriptions & Self-Service Lifecycle Actions
router.get('/subscriptions', getCustomerSubscriptions);
router.get('/subscriptions/:id', getCustomerSubscriptionById);
router.post('/subscriptions/:id/pause', customerPauseSubscription);
router.post('/subscriptions/:id/resume', customerResumeSubscription);
router.post('/subscriptions/:id/cancel', customerCancelSubscription);
router.post('/subscriptions/:id/renew', customerRenewSubscription);

// Customer Invoices & Payments
router.get('/invoices', getCustomerInvoices);
router.get('/invoices/:id', getCustomerInvoiceById);
router.get('/invoices/:id/pdf', downloadCustomerInvoicePdf);
router.get('/payments', getCustomerPayments);

export default router;

