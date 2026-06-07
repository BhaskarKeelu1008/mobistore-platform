import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.post('/', authenticate, orderController.createOrder);
router.post('/verify-payment', authenticate, orderController.verifyPayment);
router.post('/validate-coupon', authenticate, orderController.validateCoupon);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/track', orderController.trackOrder);
router.get('/:orderNumber', authenticate, orderController.getOrderByNumber);
router.post('/:orderNumber/retry-payment', authenticate, orderController.retryPayment);
router.get('/', authenticate, authorize('admin', 'staff', 'superadmin'), orderController.getAllOrders);
router.put('/:id/status', authenticate, authorize('admin', 'staff', 'superadmin'), orderController.updateOrderStatus);

export default router;
