import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

router.use(authenticate, authorize('admin', 'staff', 'superadmin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/sales-report', adminController.getSalesReport);
router.get('/customers', adminController.getCustomers);
router.get('/payments', adminController.getPayments);
router.get('/invoices', adminController.getInvoices);
router.get('/invoices/:invoiceNumber/download', adminController.downloadInvoice);
router.get('/inventory/logs', adminController.getInventoryLogs);
router.get('/staff', adminController.getStaffUsers);
router.post('/staff', authorize('admin', 'superadmin'), adminController.createStaff);
router.put('/staff/:id', authorize('admin', 'superadmin'), adminController.updateStaff);

router.get('/settings', settingsController.getSettings);
router.put('/settings', authorize('admin', 'superadmin'), settingsController.updateSettings);
router.get('/banners', settingsController.getAllBanners);
router.post('/banners', settingsController.createBanner);
router.put('/banners/:id', settingsController.updateBanner);
router.delete('/banners/:id', settingsController.deleteBanner);
router.get('/offers', settingsController.getAllOffers);
router.post('/offers', settingsController.createOffer);
router.put('/offers/:id', settingsController.updateOffer);
router.get('/coupons', settingsController.getCoupons);
router.post('/coupons', settingsController.createCoupon);
router.put('/coupons/:id', settingsController.updateCoupon);
router.get('/delivery-zones', settingsController.getDeliveryZones);
router.post('/delivery-zones', settingsController.createDeliveryZone);
router.get('/suppliers', settingsController.getSuppliers);
router.post('/suppliers', settingsController.createSupplier);
router.post('/inventory/add', settingsController.addInventory);

export default router;
