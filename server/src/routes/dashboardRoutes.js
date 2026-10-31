import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN', 'STAFF'), getDashboardStats);

export default router;

