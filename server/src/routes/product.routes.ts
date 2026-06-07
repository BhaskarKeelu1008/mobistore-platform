import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/latest', productController.getLatestProducts);
router.get('/search/suggestions', productController.searchSuggestions);
router.get('/recently-viewed', authenticate, productController.getRecentlyViewed);
router.get('/:slug', optionalAuth, productController.getProductBySlug);
router.post('/', authenticate, authorize('admin', 'staff', 'superadmin'), productController.createProduct);
router.put('/:id', authenticate, authorize('admin', 'staff', 'superadmin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), productController.deleteProduct);
router.post('/:id/reviews', authenticate, productController.addReview);

export default router;
