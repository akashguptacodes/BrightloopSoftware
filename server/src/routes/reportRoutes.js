import express from 'express';
import {
  getRevenueReportHandler,
  getSubscriptionReportHandler,
  getCustomerReportHandler,
  getInvoiceReportHandler,
  getProductPlanReportHandler,
  exportCsvHandler,
  exportPdfHandler,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'STAFF'));

router.get('/revenue', getRevenueReportHandler);
router.get('/subscriptions', getSubscriptionReportHandler);
router.get('/customers', getCustomerReportHandler);
router.get('/invoices', getInvoiceReportHandler);
router.get('/products-plans', getProductPlanReportHandler);
router.get('/export/csv', exportCsvHandler);
router.get('/export/pdf', exportPdfHandler);

export default router;

