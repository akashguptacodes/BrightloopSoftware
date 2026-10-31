import express from 'express';
import { getActivities } from '../controllers/activityController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getActivities);

export default router;

