import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload, uploadImage, uploadMultipleImages } from '../controllers/upload.controller';

const router = Router();

router.post('/image', authenticate, authorize('admin', 'staff', 'superadmin'), upload.single('image'), uploadImage);
router.post('/images', authenticate, authorize('admin', 'staff', 'superadmin'), upload.array('images', 10), uploadMultipleImages);
router.post('/chat-image', authenticate, upload.single('image'), uploadImage);

export default router;
