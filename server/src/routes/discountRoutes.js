import { Router } from 'express';
import {
  createDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  updateDiscountStatus,
  deleteDiscount,
} from '../controllers/discountController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createDiscount);
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getDiscounts);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), getDiscountById);
router.put('/:id', authenticate, authorize('ADMIN'), updateDiscount);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateDiscountStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteDiscount);

export default router;

