import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import chatRoutes from './chat.routes';
import adminRoutes from './admin.routes';
import publicRoutes from './public.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/upload', uploadRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MobiStore API is running', timestamp: new Date().toISOString() });
});

export default router;
