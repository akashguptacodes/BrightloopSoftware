import express from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Require authentication for all customer routes
router.use(authenticate);

// List & Create
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getCustomers);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createCustomer);

// Read, Update, Toggle Status
router.get('/:id', authorizeRoles('ADMIN', 'STAFF', 'CUSTOMER'), getCustomerById);
router.put('/:id', authorizeRoles('ADMIN', 'STAFF'), updateCustomer);
router.patch('/:id/status', authorizeRoles('ADMIN', 'STAFF'), toggleCustomerStatus);

export default router;

