import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../utils/asyncHandler';
import * as settingsController from '../controllers/settings.controller';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.get('/settings', settingsController.getSettings);
router.get('/banners', settingsController.getBanners);
router.get('/offers', settingsController.getOffers);
router.get('/cms/:page', settingsController.getCMSContent);
router.post('/newsletter', settingsController.subscribeNewsletter);

router.get('/addresses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const User = (await import('../models/User')).default;
    const user = await User.findById(req.user!.id);
    res.json({ success: true, message: 'Addresses fetched', data: user?.addresses || [] });
  } catch (e) { next(e); }
});

router.post('/addresses', authenticate, settingsController.addAddress);
router.put('/addresses/:addressId', authenticate, settingsController.updateAddress);
router.delete('/addresses/:addressId', authenticate, settingsController.deleteAddress);
router.get('/wishlist', authenticate, settingsController.getWishlist);
router.post('/wishlist/:productId', authenticate, settingsController.toggleWishlist);
router.delete('/wishlist/:productId', authenticate, settingsController.toggleWishlist);
router.get('/notifications', authenticate, adminController.getNotifications);
router.put('/notifications/:id/read', authenticate, adminController.markNotificationRead);
router.put('/notifications/read-all', authenticate, adminController.markAllNotificationsRead);
router.get('/invoices/:invoiceNumber/download', authenticate, adminController.downloadInvoice);

export default router;
