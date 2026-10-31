import express from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createDirectSubscription,
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription,
  closeSubscription,
  getSubscriptionHistory,
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// List & Create
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getSubscriptions);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createDirectSubscription);

// Single view & history
router.get('/:id', authorizeRoles('ADMIN', 'STAFF', 'CUSTOMER'), getSubscriptionById);
router.get('/:id/history', authorizeRoles('ADMIN', 'STAFF', 'CUSTOMER'), getSubscriptionHistory);

// Lifecycle operations
router.post('/:id/activate', authorizeRoles('ADMIN', 'STAFF'), activateSubscription);
router.post('/:id/pause', authorizeRoles('ADMIN', 'STAFF'), pauseSubscription);
router.post('/:id/resume', authorizeRoles('ADMIN', 'STAFF'), resumeSubscription);
router.post('/:id/cancel', authorizeRoles('ADMIN', 'STAFF'), cancelSubscription);
router.post('/:id/renew', authorizeRoles('ADMIN', 'STAFF'), renewSubscription);
router.post('/:id/close', authorizeRoles('ADMIN', 'STAFF'), closeSubscription);

export default router;

