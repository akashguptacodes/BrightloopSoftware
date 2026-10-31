import express from 'express';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  convertToSubscription,
} from '../controllers/quotationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// List & Create
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getQuotations);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createQuotation);

// Single details (also CUSTOMER role can view their own)
router.get('/:id', authorizeRoles('ADMIN', 'STAFF', 'CUSTOMER'), getQuotationById);

// Update DRAFT
router.put('/:id', authorizeRoles('ADMIN', 'STAFF'), updateQuotation);

// Status workflows & Conversion
router.post('/:id/send', authorizeRoles('ADMIN', 'STAFF'), sendQuotation);
router.post('/:id/accept', authorizeRoles('ADMIN', 'STAFF'), acceptQuotation);
router.post('/:id/reject', authorizeRoles('ADMIN', 'STAFF'), rejectQuotation);
router.post('/:id/convert', authorizeRoles('ADMIN', 'STAFF'), convertToSubscription);

export default router;

