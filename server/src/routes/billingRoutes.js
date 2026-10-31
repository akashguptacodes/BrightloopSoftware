import express from 'express';
import {
  triggerRecurringBilling,
  triggerOverdueCheck,
  getBillingStatus,
} from '../controllers/billingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Admin & Staff can view status and trigger runs
router.get('/status', authorizeRoles('ADMIN', 'STAFF'), getBillingStatus);
router.post('/run', authorizeRoles('ADMIN', 'STAFF'), triggerRecurringBilling);
router.post('/check-overdue', authorizeRoles('ADMIN', 'STAFF'), triggerOverdueCheck);

export default router;

