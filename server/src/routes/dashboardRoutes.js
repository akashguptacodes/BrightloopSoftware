import { Router } from 'express';
import { getDashboardStats, getStaffDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

// Admin & Staff can access main dashboard stats
router.get('/stats', authorizeRoles('ADMIN', 'STAFF'), getDashboardStats);

// Dedicated Staff operational dashboard
router.get('/staff', authorizeRoles('STAFF', 'ADMIN'), getStaffDashboardStats);

export default router;
