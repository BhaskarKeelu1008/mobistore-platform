import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as categoryController from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/brands', categoryController.getBrands);
router.get('/brands/:slug', categoryController.getBrandBySlug);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', authenticate, authorize('admin', 'staff', 'superadmin'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin', 'staff', 'superadmin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), categoryController.deleteCategory);
router.post('/brands', authenticate, authorize('admin', 'staff', 'superadmin'), categoryController.createBrand);
router.put('/brands/:id', authenticate, authorize('admin', 'staff', 'superadmin'), categoryController.updateBrand);
router.delete('/brands/:id', authenticate, authorize('admin', 'superadmin'), categoryController.deleteBrand);

export default router;
