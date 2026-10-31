import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  issueInvoiceHandler,
  voidInvoiceHandler,
  downloadInvoicePdf,
} from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// List and Create
router.route('/')
  .get(authorizeRoles('ADMIN', 'STAFF'), getInvoices)
  .post(authorizeRoles('ADMIN', 'STAFF'), createInvoice);

// Single invoice operations
router.route('/:id')
  .get(authorizeRoles('ADMIN', 'STAFF'), getInvoiceById)
  .put(authorizeRoles('ADMIN', 'STAFF'), updateInvoice);

// Issue & Void
router.post('/:id/issue', authorizeRoles('ADMIN', 'STAFF'), issueInvoiceHandler);
router.post('/:id/void', authorizeRoles('ADMIN', 'STAFF'), voidInvoiceHandler);

// PDF download (allows Admin, Staff)
router.get('/:id/pdf', authorizeRoles('ADMIN', 'STAFF'), downloadInvoicePdf);

export default router;

