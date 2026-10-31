import { Router } from 'express';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} from '../controllers/planController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), createPlan);
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getPlans);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), getPlanById);
router.put('/:id', authenticate, authorize('ADMIN'), updatePlan);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updatePlanStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deletePlan);

export default router;

