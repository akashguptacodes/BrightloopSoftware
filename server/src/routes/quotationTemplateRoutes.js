import express from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  toggleTemplateStatus,
} from '../controllers/quotationTemplateController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Templates are managed by ADMIN and STAFF
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getTemplates);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createTemplate);
router.get('/:id', authorizeRoles('ADMIN', 'STAFF'), getTemplateById);
router.put('/:id', authorizeRoles('ADMIN', 'STAFF'), updateTemplate);
router.patch('/:id/status', authorizeRoles('ADMIN', 'STAFF'), toggleTemplateStatus);

export default router;

