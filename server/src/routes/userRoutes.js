import { Router } from 'express';
import { createStaff, getAllUsers, updateUserStatus } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/staff', authenticate, authorize('ADMIN'), createStaff);
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateUserStatus);

export default router;
