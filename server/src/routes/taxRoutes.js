import { Router } from 'express';
import {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
} from '../controllers/taxController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createTax);
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getTaxes);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), getTaxById);
router.put('/:id', authenticate, authorize('ADMIN'), updateTax);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateTaxStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTax);

export default router;

