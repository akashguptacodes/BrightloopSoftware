import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  createVariant,
  getVariants,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
} from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// ==========================================
// Product Routes
// ==========================================
router.post('/', authenticate, authorize('ADMIN'), createProduct);
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getProducts);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), getProductById);
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateProductStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

// Nested Product Variants
router.post('/:productId/variants', authenticate, authorize('ADMIN'), createVariant);
router.get('/:productId/variants', authenticate, authorize('ADMIN', 'STAFF'), getVariants);

export default router;

// Export variant router for /api/variants
export const variantRouter = Router();
variantRouter.put('/:id', authenticate, authorize('ADMIN'), updateVariant);
variantRouter.patch('/:id/status', authenticate, authorize('ADMIN'), updateVariantStatus);
variantRouter.delete('/:id', authenticate, authorize('ADMIN'), deleteVariant);

